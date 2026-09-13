import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UploadCloud,
  Camera,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronLeft,
  RefreshCw,
  Info,
  Loader2,
} from 'lucide-react';
import { SAMPLE_ROAD_LOCATIONS } from '../../data/mockData';
import { LocationData, PotholeSeverity } from '../../types';

export const ReportPotholePage: React.FC = () => {
  const { addReport, setCurrentPage, viewReportDetails } = useApp();

  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  );
  const [title, setTitle] = useState('Severe road cavity near highway lane');
  const [description, setDescription] = useState(
    'Deep crater formed on the asphalt wearing course. Vehicles are swerving abruptly to avoid tyre burst.'
  );
  const [location, setLocation] = useState<LocationData>(SAMPLE_ROAD_LOCATIONS[0]);
  const [severity, setSeverity] = useState<PotholeSeverity>('severe');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const resultUrl = uploadEvent.target?.result as string;
        setImageUrl(resultUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoGPS = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setLocation({
            address: `Live GPS Fix (${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E)`,
            roadName: 'Detected Highway Road Segment',
            city: 'New Delhi / NCR',
            state: 'Delhi',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            landmark: 'Geo-stamped location',
          });
        },
        () => {
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newId = await addReport({
        title,
        description,
        severity,
        confidenceScore: 94,
        location,
        imageUrl,
        aiAnalysis: {
          detected: true,
          detectedCount: severity === 'severe' ? 2 : 1,
          confidenceScore: 94,
          severity,
          boundingBoxes: [{ x: 30, y: 35, width: 40, height: 35 }],
          estimatedDimensions: {
            widthCm: severity === 'severe' ? 80 : severity === 'moderate' ? 50 : 30,
            depthCm: severity === 'severe' ? 14 : severity === 'moderate' ? 8 : 4,
            areaSqM: severity === 'severe' ? 0.6 : 0.25,
          },
          roadCondition: 'Road surface damage reported for municipal restoration',
          recommendedUrgency:
            severity === 'severe'
              ? 'Critical 24h work order'
              : 'Standard road restoration cycle',
        },
      });
      setSubmittedId(newId);
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
            Pothole Complaint Registered!
          </h2>
          <p className="text-xs text-slate-600">
            Work Order Tracking ID: <strong className="font-mono text-slate-900">{submittedId}</strong>
          </p>
          <p className="text-xs text-slate-500">
            Your report has been received and dispatched to the municipal highway authority for review.
          </p>

          {/* Dispatch Notice */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 text-left text-xs shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Highway Authority Dispatched
              </span>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                Notified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Official road defect ticket sent to the regional highway authority with GPS coordinates and photo proof.
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
      {/* Back button & Page Title */}
      <div>
        <button
          onClick={() => setCurrentPage('user-dashboard')}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-1"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-black text-slate-900">Report Road Damage & Pothole</h1>
        <p className="text-xs text-slate-500">
          Upload a clear photo and road details to submit a damage ticket directly to the highway authority.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Photo Upload & Preview */}
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

            {/* Drag and Drop Box */}
            <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:border-blue-500 hover:bg-blue-50/20 transition cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
              <div className="text-xs font-bold text-slate-800">
                Click or drag & drop road image
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">PNG, JPG up to 25MB</p>
            </div>

            {/* Clean Image Preview */}
            {imageUrl && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">Photo Preview:</span>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs">
                  <img
                    src={imageUrl}
                    alt="Road defect"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Severity Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Defect Severity Level
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
            </div>
          </div>
        </div>

        {/* Right Column: GPS Location & Report Metadata */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Location & Road Details
            </h3>

            {/* Automatic GPS Capture */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Auto-Captured GPS Location
                </span>
                <button
                  type="button"
                  onClick={handleAutoGPS}
                  className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                >
                  <RefreshCw className={`h-3 w-3 ${isLocating ? 'animate-spin' : ''}`} />
                  {isLocating ? 'Locating...' : 'Re-fetch GPS'}
                </button>
              </div>

              <div className="text-xs text-slate-600">
                <span className="font-medium text-slate-800">{location.address}</span>
                <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                  Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Quick Road Select Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Indian Road Sector / Preset
              </label>
              <select
                value={location.roadName}
                onChange={(e) => {
                  const selected = SAMPLE_ROAD_LOCATIONS.find((l) => l.roadName === e.target.value);
                  if (selected) setLocation(selected);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                {SAMPLE_ROAD_LOCATIONS.map((loc) => (
                  <option key={loc.roadName} value={loc.roadName}>
                    {loc.roadName} ({loc.city}, {loc.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Specific Landmark */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Landmark / Pillar / Kilometre Stone (Optional)
              </label>
              <input
                type="text"
                value={location.landmark || ''}
                onChange={(e) => setLocation({ ...location, landmark: e.target.value })}
                placeholder="e.g. Near Metro Pillar 42, Opposite Gas Station"
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
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
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
