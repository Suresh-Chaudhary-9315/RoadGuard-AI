import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';
import {
  AiDetectionAnalysis,
  BoundingBox,
  LocationData,
  PotholeSeverity,
} from '../../types';

const AI_API_URL =
  import.meta.env.VITE_AI_API_URL ||
  'http://127.0.0.1:8000/predict';

type AiApiResponse = {
  detected: boolean;
  detectedCount: number;
  confidenceScore: number;
  severity: PotholeSeverity | null;
  boundingBoxes: BoundingBox[];
};

const stopMediaStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

export const CameraDetectionPage: React.FC = () => {
  const { addReport, viewReportDetails, setCurrentPage } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);
  const cameraRequestRef = useRef(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<AiDetectionAnalysis | null>(null);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  const [location, setLocation] = useState<LocationData>({
    address: 'Location not detected',
    roadName: 'Waiting for GPS',
    city: '',
    state: '',
    lat: 0,
    lng: 0,
    landmark: '',
  });

  const stopCamera = () => {
    // Invalidate any getUserMedia request that is still waiting for permission.
    cameraRequestRef.current += 1;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    stopMediaStream(streamRef.current);
    streamRef.current = null;

    if (isMountedRef.current) {
      setCameraActive(false);
    }
  };

  const startCamera = async () => {
    const requestId = cameraRequestRef.current + 1;
    cameraRequestRef.current = requestId;

    setCameraError(null);

    stopMediaStream(streamRef.current);
    streamRef.current = null;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      // If the user navigated away while camera permission was still resolving,
      // immediately release the newly created stream.
      if (!isMountedRef.current || requestId !== cameraRequestRef.current) {
        stopMediaStream(stream);
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
    } catch (error) {
      console.error('Camera access error:', error);

      if (isMountedRef.current) {
        setCameraError('Could not access the camera. Allow camera permission and try again.');
        setCameraActive(false);
      }
    }
  };

  const detectGPSLocation = () => {
    setIsLocating(true);

    if (!('geolocation' in navigator)) {
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMountedRef.current) return;

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocation({
          address: `GPS coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          roadName: 'Current GPS Location',
          city: '',
          state: '',
          lat,
          lng,
          landmark: 'Device GPS',
        });
        setIsLocating(false);
      },
      (error) => {
        console.warn('GPS error:', error);
        if (isMountedRef.current) {
          setIsLocating(false);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000,
      }
    );
  };

  useEffect(() => {
    isMountedRef.current = true;

    void startCamera();
    detectGPSLocation();

    return () => {
      // This cleanup runs whenever CameraDetectionPage is left.
      isMountedRef.current = false;
      cameraRequestRef.current += 1;

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }

      stopMediaStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  const handleCaptureAndScan = async () => {
    if (!cameraActive || !videoRef.current || isScanning) return;

    const video = videoRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setCameraError('Camera is still starting. Try again in a moment.');
      return;
    }

    setIsScanning(true);
    setCameraError(null);
    setScanNotice(null);
    setDetectionResult(null);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not create image canvas.');
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(dataUrl);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) => {
            if (value) resolve(value);
            else reject(new Error('Could not create captured image.'));
          },
          'image/jpeg',
          0.95
        );
      });

      // We already have the frame. Release the physical camera immediately.
      // Retake/Reset will start it again when needed.
      stopCamera();

      const formData = new FormData();
      formData.append('file', blob, 'road_capture.jpg');

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`AI API returned HTTP ${response.status}.`);
      }

      const result = (await response.json()) as AiApiResponse;
      console.log('AI RESULT:', result);

      if (!result.detected || !result.severity || result.boundingBoxes.length === 0) {
        setScanNotice('No pothole was detected in this capture.');
        return;
      }

      setDetectionResult({
        detected: true,
        detectedCount: result.detectedCount,
        confidenceScore: result.confidenceScore,
        severity: result.severity,
        boundingBoxes: result.boundingBoxes,

        // Kept only because the existing project type currently requires them.
        // These values are not shown to the user and are not claimed as AI measurements.
        estimatedDimensions: {
          widthCm: 0,
          depthCm: 0,
          areaSqM: 0,
        },
        roadCondition: 'Not estimated by the current AI model',
        recommendedUrgency: 'Based on the predicted severity',
      });
    } catch (error) {
      console.error('AI scan failed:', error);
      setCameraError('AI scan failed. Make sure the Python AI service is running on port 8000.');
    } finally {
      if (isMountedRef.current) {
        setIsScanning(false);
      }
    }
  };

  const handleResetScan = async () => {
    setCapturedImage(null);
    setDetectionResult(null);
    setSubmittedReportId(null);
    setScanNotice(null);
    setCameraError(null);

    await startCamera();
  };

  const handleBackToDashboard = () => {
    stopCamera();
    setCurrentPage('user-dashboard');
  };

  const handleSubmitReport = async () => {
    if (!detectionResult || !capturedImage || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const newReportId = await addReport({
        title: `${detectionResult.severity.toUpperCase()} pothole detected at ${location.roadName}`,
        description: `AI camera detection identified ${detectionResult.detectedCount} pothole${
          detectionResult.detectedCount === 1 ? '' : 's'
        } with highest detector confidence ${detectionResult.confidenceScore.toFixed(1)}%.`,
        severity: detectionResult.severity,
        confidenceScore: detectionResult.confidenceScore,
        location,
        imageUrl: capturedImage,
        aiAnalysis: detectionResult,
      });

      setSubmittedReportId(newReportId);
    } catch (error) {
      console.error('Report submission failed:', error);
      setCameraError('The pothole was detected, but the report could not be submitted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedReportId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl space-y-5 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">Report submitted</h2>
            <p className="mt-2 text-sm text-slate-600">
              Report ID: <strong className="font-mono text-slate-900">{submittedReportId}</strong>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => viewReportDetails(submittedReportId)}
              className="rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-800"
            >
              Track Report
            </button>

            <button
              onClick={() => void handleResetScan()}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Scan Another Pothole
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={handleBackToDashboard}
            className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900">
            <Camera className="h-6 w-6 text-blue-700" />
            AI Live Camera Pothole Scanner
          </h1>

          <p className="text-xs text-slate-500">
            Real camera capture with AI pothole verification and severity classification
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm">
          <MapPin className="h-4 w-4 text-blue-600" />
          <div>
            <div className="font-semibold text-slate-900">{location.roadName}</div>
            <div className="font-mono text-[10px] text-slate-400">
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </div>
          </div>
          <button
            onClick={detectGPSLocation}
            title="Refresh GPS"
            className="ml-1 rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border-2 border-slate-900 bg-slate-950 shadow-xl">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured road surface"
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`h-full w-full object-cover ${cameraActive ? 'block' : 'invisible'}`}
                />

                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <Camera className="mb-3 h-12 w-12 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-300">Camera inactive</p>
                    <p className="mt-1 max-w-xs text-xs text-slate-500">
                      {cameraError || 'Enable the camera to capture a road surface.'}
                    </p>

                    <button
                      onClick={() => void startCamera()}
                      className="mt-4 rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                    >
                      Enable Camera
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-8 bottom-8 top-8 rounded-2xl border border-white/20">
                <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-blue-500" />
                <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-blue-500" />
                <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-blue-500" />
                <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-blue-500" />
              </div>

              {isScanning && (
                <div className="absolute inset-x-0 top-1/2 h-1 animate-pulse bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8]" />
              )}

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-1 font-mono text-xs text-white backdrop-blur-md">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isScanning ? 'bg-amber-400' : cameraActive ? 'bg-emerald-400' : 'bg-slate-400'
                  }`}
                />
                <span>
                  {isScanning
                    ? 'AI ANALYZING'
                    : capturedImage
                      ? 'FRAME CAPTURED'
                      : cameraActive
                        ? 'LIVE STREAM'
                        : 'CAMERA READY'}
                </span>
              </div>
            </div>

            {detectionResult?.detected &&
              detectionResult.boundingBoxes.map((box, index) => (
                <div
                  key={`${index}-${box.x}-${box.y}`}
                  className="pointer-events-none absolute rounded-md border-2 border-rose-500 bg-rose-500/10 shadow-lg"
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                >
                  <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-rose-600 px-2 py-1 text-[10px] font-bold text-white shadow">
                    Pothole {index + 1}
                  </span>
                </div>
              ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {capturedImage ? (
              <button
                onClick={() => void handleResetScan()}
                disabled={isScanning}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                Retake / Reset
              </button>
            ) : (
              <button
                onClick={handleCaptureAndScan}
                disabled={!cameraActive || isScanning}
                className="flex items-center gap-2.5 rounded-2xl bg-blue-700 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-blue-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isScanning ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
                {isScanning ? 'Processing AI Inference...' : 'Capture & Scan Road'}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-5">
          {cameraError && (
            <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {detectionResult ? (
            <div className="space-y-4 rounded-2xl border-2 border-blue-600 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">AI Detection Result</h3>
                    <p className="text-[11px] text-slate-500">Real model inference</p>
                  </div>
                </div>
                <StatusBadge severity={detectionResult.severity} size="md" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[11px] font-medium text-slate-500">Potholes detected</div>
                  <div className="text-2xl font-black text-slate-900">
                    {detectionResult.detectedCount}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[11px] font-medium text-slate-500">Highest confidence</div>
                  <div className="text-2xl font-black text-blue-700">
                    {detectionResult.confidenceScore.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                <div className="mb-1 flex items-center gap-1.5 font-bold text-slate-900">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  {location.roadName}
                </div>
                <p className="text-[11px] text-slate-500">{location.address}</p>
              </div>

              <button
                onClick={handleSubmitReport}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-bold text-white shadow transition hover:bg-blue-800 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {isSubmitting ? 'Submitting Report...' : 'Submit Pothole Report'}
              </button>
            </div>
          ) : scanNotice ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
              <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">No pothole detected</h3>
              <p className="mt-1 text-xs text-slate-600">{scanNotice}</p>
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-blue-600 opacity-60" />
              <h3 className="text-sm font-bold text-slate-800">Awaiting Road Capture</h3>
              <p className="mx-auto max-w-xs text-xs text-slate-500">
                Capture a road image. Every accepted pothole bounding box will be shown here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
