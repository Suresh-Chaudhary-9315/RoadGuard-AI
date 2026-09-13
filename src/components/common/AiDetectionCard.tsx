import React, { useState } from 'react';
import { AiDetectionAnalysis, PotholeSeverity, LocationData } from '../../types';
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  Maximize2,
  Eye,
  EyeOff,
  Ruler,
  Compass,
  Layers,
  MapPin,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface AiDetectionCardProps {
  imageUrl: string;
  aiAnalysis: AiDetectionAnalysis;
  location?: LocationData;
  showLocation?: boolean;
}

export const AiDetectionCard: React.FC<AiDetectionCardProps> = ({
  imageUrl,
  aiAnalysis,
  location,
  showLocation = true,
}) => {
  const [showBoundingBox, setShowBoundingBox] = useState(true);

  const severityColor = {
    minor: 'border-emerald-400 bg-emerald-500/10 text-emerald-400',
    moderate: 'border-amber-400 bg-amber-500/15 text-amber-400',
    severe: 'border-rose-500 bg-rose-500/20 text-rose-400',
  }[aiAnalysis.severity];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
            Damage Analysis & Inspection
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBoundingBox(!showBoundingBox)}
            className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            {showBoundingBox ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {showBoundingBox ? 'Hide Box' : 'Show Box'}
          </button>
          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
            {aiAnalysis.confidenceScore}% Confidence
          </span>
        </div>
      </div>

      {/* Image with AI Bounding Box Overlay */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900 select-none">
        <img
          src={imageUrl}
          alt="Detected pothole"
          className="h-full w-full object-cover"
        />

        {/* Bounding Boxes */}
        {showBoundingBox &&
          aiAnalysis.detected &&
          aiAnalysis.boundingBoxes.map((box, idx) => (
            <div
              key={idx}
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.width}%`,
                height: `${box.height}%`,
              }}
              className={`absolute rounded border-2 transition-all duration-200 ${severityColor} shadow-lg`}
            >
              <div className="absolute -top-6 left-0 flex items-center gap-1 rounded bg-slate-950/90 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white shadow">
                <span className="uppercase text-amber-300">Pothole #{idx + 1}</span>
                <span className="text-slate-400">|</span>
                <span>{aiAnalysis.confidenceScore}%</span>
              </div>

              {/* Target reticle corners */}
              <div className="absolute -top-1 -left-1 h-2 w-2 border-t-2 border-l-2 border-white" />
              <div className="absolute -top-1 -right-1 h-2 w-2 border-t-2 border-r-2 border-white" />
              <div className="absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2 border-white" />
              <div className="absolute -bottom-1 -right-1 h-2 w-2 border-b-2 border-r-2 border-white" />
            </div>
          ))}

        {/* AI Scan Overlay Status Pill */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs text-white backdrop-blur-md">
          {aiAnalysis.detected ? (
            <>
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-semibold">Pothole Hazard Detected</span>
              <span className="text-slate-400">({aiAnalysis.detectedCount} spot{aiAnalysis.detectedCount > 1 ? 's' : ''})</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-semibold">No Pothole Identified</span>
            </>
          )}
        </div>
      </div>

      {/* Metrics & Classification Grid */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
            <div className="text-[11px] font-medium text-slate-500">Damage Severity</div>
            <div className="mt-1 flex justify-center">
              <StatusBadge severity={aiAnalysis.severity} size="sm" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
            <div className="text-[11px] font-medium text-slate-500">Est. Depth</div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {aiAnalysis.estimatedDimensions.depthCm} cm
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
            <div className="text-[11px] font-medium text-slate-500">Surface Area</div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {aiAnalysis.estimatedDimensions.areaSqM} m²
            </div>
          </div>
        </div>

        {/* Condition Analysis */}
        <div className="rounded-xl border border-slate-100 bg-blue-50/40 p-3 text-xs text-slate-700">
          <div className="font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            AI Structural Diagnostics:
          </div>
          <p className="text-slate-600">{aiAnalysis.roadCondition}</p>
          <div className="mt-2 flex items-center gap-1.5 text-blue-800 font-medium text-[11px]">
            <span className="font-semibold">Recommended Action:</span>
            <span>{aiAnalysis.recommendedUrgency}</span>
          </div>
        </div>

        {/* Detected Location Info if enabled */}
        {showLocation && location && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-0.5">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              <span>{location.roadName}</span>
            </div>
            <p className="text-slate-500 text-[11px]">{location.address}</p>
            <div className="mt-1 text-[10px] font-mono text-slate-400">
              GPS: {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
