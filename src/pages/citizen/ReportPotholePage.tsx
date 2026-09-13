import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UploadCloud,
  Camera,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { LocationData, PotholeSeverity } from '../../types';

export const ReportPotholePage: React.FC = () => {
  const { addReport, setCurrentPage, viewReportDetails } = useApp();

  const [imageUrl, setImageUrl] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationData>({
    address: '',
    roadName: '',
    city: '',
    state: '',
    lat: 0,
    lng: 0,
    landmark: '',
  });
  const [severity, setSeverity] = useState<PotholeSeverity | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);

    if (!file.type.startsWith('image/')) {
      setFormError('Please upload an image file.');
      e.target.value = '';
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setFormError('Image size must be 25 MB or less.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const resultUrl = uploadEvent.target?.result;
      if (typeof resultUrl === 'string') {
        setImageUrl(resultUrl);
      }
    };
    reader.onerror = () => {
      setFormError('Could not read the selected image.');
    };
    reader.readAsDataURL(file);
  };

  const handleAutoGPS = () => {
    setFormError(null);
    setIsLocating(true);

    if (!('geolocation' in navigator)) {
      setIsLocating(false);
      setFormError('GPS is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setLocation((prev) => ({
          ...prev,
          lat,
          lng,
          address:
            prev.address ||
            `GPS coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        }));
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setFormError(
          'Could not access your GPS location. Allow location permission or enter the road details manually.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);

    if (!imageUrl) {
      setFormError('Please upload a road image before submitting.');
      return;
    }

    if (!severity) {
      setFormError('Please select the defect severity.');
      return;
    }

    if (!location.roadName.trim() || !location.address.trim()) {
      setFormError('Please enter the road name and address/location description.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newId = await addReport({
        title: title.trim(),
        description: description.trim(),
        severity,
        confidenceScore: 0,
        location: {
          ...location,
          roadName: location.roadName.trim(),
          address: location.address.trim(),
          city: location.city.trim(),
          state: location.state.trim(),
          landmark: location.landmark?.trim() || '',
        },
        imageUrl,
        aiAnalysis: {
          detected: false,
          detectedCount: 0,
          confidenceScore: 0,
          severity,
          boundingBoxes: [],
          estimatedDimensions: {
            widthCm: 0,
            depthCm: 0,
            areaSqM: 0,
          },
          roadCondition: 'Manual citizen report - AI analysis not performed',
          recommendedUrgency: 'Pending authority review',
        },
      });

      setSubmittedId(newId);
    } catch (error) {
      console.error('Report submission failed:', error);
      setFormError('Report could not be saved. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8 shadow-sm space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">
            Pothole Report Submitted
          </h2>

          <p className="text-xs text-slate-600">
            Tracking ID:{' '}
            <strong className="font-mono text-slate-900">{submittedId}</strong>
          </p>

          <p className="text-xs text-slate-500">
            Your report has been saved and is now available in the authority workflow for review.
          </p>

          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 text-left text-xs shadow-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Report stored successfully
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              The submitted image, location details, severity selection, and description were saved with this report.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => viewReportDetails(submittedId)}
              className="rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-800 transition"
            >
              View Report Status
            </button>

            <button
              onClick={() => {
                setSubmittedId(null);
                setCurrentPage('user-dashboard');
              }}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <button
          onClick={() => setCurrentPage('user-dashboard')}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-1"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-black text-slate-900">
          Report Road Damage & Pothole
        </h1>

        <p className="text-xs text-slate-500">
          Upload a real road photo and provide the actual location details for the report.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Upload Road Photo
              </label>

              <button
                type="button"
                onClick={() => setCurrentPage('camera-detection')}
                className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800"
              >
                <Camera className="h-3.5 w-3.5" /> Use Live Camera
              </button>
            </div>

            <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:border-blue-500 hover:bg-blue-50/20 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />

              <div className="text-xs font-bold text-slate-800">
                Click or drag & drop road image
              </div>

              <p className="text-[11px] text-slate-500 mt-0.5">
                PNG, JPG or other image formats up to 25 MB
              </p>
            </div>

            {imageUrl && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">
                  Photo Preview:
                </span>

                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs">
                  <img
                    src={imageUrl}
                    alt="Road defect"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Citizen-Observed Severity
              </label>

              <div className="grid grid-cols-3 gap-2">
                {(['minor', 'moderate', 'severe'] as PotholeSeverity[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-bold capitalize transition flex items-center justify-center gap-1.5 ${
                      severity === sev
                        ? sev === 'severe'
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : sev === 'moderate'
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        sev === 'severe'
                          ? 'bg-rose-500'
                          : sev === 'moderate'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                    />
                    {sev}
                  </button>
                ))}
              </div>

              <p className="mt-1.5 text-[10px] text-slate-400">
                This is the citizen's assessment. AI classification is performed only through the Camera Scan workflow.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Location & Road Details
            </h3>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  GPS Coordinates
                </span>

                <button
                  type="button"
                  onClick={handleAutoGPS}
                  disabled={isLocating}
                  className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isLocating ? 'animate-spin' : ''}`} />
                  {isLocating ? 'Locating...' : 'Use My GPS'}
                </button>
              </div>

              <div className="font-mono text-[11px] text-slate-500">
                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Road Name
              </label>
              <input
                type="text"
                value={location.roadName}
                onChange={(e) =>
                  setLocation((prev) => ({ ...prev, roadName: e.target.value }))
                }
                placeholder="e.g. Outer Ring Road"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Address / Location Description
              </label>
              <input
                type="text"
                value={location.address}
                onChange={(e) =>
                  setLocation((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="Enter the actual location or use GPS first"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={location.city}
                  onChange={(e) =>
                    setLocation((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="City"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={location.state}
                  onChange={(e) =>
                    setLocation((prev) => ({ ...prev, state: e.target.value }))
                  }
                  placeholder="State"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Landmark / Pillar / Kilometre Stone (Optional)
              </label>
              <input
                type="text"
                value={location.landmark || ''}
                onChange={(e) =>
                  setLocation((prev) => ({ ...prev, landmark: e.target.value }))
                }
                placeholder="e.g. Near Metro Pillar 42"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Damage Description
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Briefly describe the road damage"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Citizen Observations / Traffic Impact
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the damage and any safety or traffic impact you observed"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>
            </div>

            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                {formError}
              </div>
            )}

            <div className="pt-2">
              <button
                id="submit-pothole-report-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Submit Pothole Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
