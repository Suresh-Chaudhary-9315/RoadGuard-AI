import React, { useState } from 'react';
import { PotholeReport } from '../../types';
import { MapPin, Navigation, Compass, ExternalLink, Layers } from 'lucide-react';

interface MiniMapProps {
  reports: PotholeReport[];
  selectedReportId?: string | null;
  onSelectReport?: (id: string) => void;
  centerLocation?: { lat: number; lng: number; label?: string };
  heightClass?: string;
  showAllMarkers?: boolean;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  centerLocation,
  heightClass = 'h-72',
  showAllMarkers = true,
}) => {
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>('streets');
  const [hoveredReport, setHoveredReport] = useState<PotholeReport | null>(null);

  // Focus coordinates if centerLocation provided, else average or default to NH-48 / NCR
  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const severityColor = (sev: string) => {
    switch (sev) {
      case 'severe':
        return '#e11d48'; // rose-600
      case 'moderate':
        return '#f59e0b'; // amber-500
      default:
        return '#10b981'; // emerald-500
    }
  };

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner`}>
      {/* Background Stylized Vector Road Map */}
      <svg
        viewBox="0 0 800 450"
        className={`h-full w-full object-cover transition-colors duration-300 ${
          mapLayer === 'satellite' ? 'bg-slate-900 opacity-95' : 'bg-slate-50'
        }`}
      >
        <defs>
          <pattern id="roadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={mapLayer === 'satellite' ? '#334155' : '#e2e8f0'}
              strokeWidth="0.8"
            />
          </pattern>
          {/* Subtle water zone */}
          <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={mapLayer === 'satellite' ? '#0f172a' : '#dbeafe'} />
            <stop offset="100%" stopColor={mapLayer === 'satellite' ? '#1e293b' : '#bfdbfe'} />
          </linearGradient>
        </defs>

        {/* Base Grid */}
        <rect width="100%" height="100%" fill="url(#roadGrid)" />

        {/* Stylized River / Water Body */}
        <path
          d="M 0,220 C 150,180 250,290 400,240 C 550,190 650,310 800,280 L 800,340 C 650,370 550,250 400,300 C 250,350 150,240 0,280 Z"
          fill="url(#riverGrad)"
          opacity={mapLayer === 'satellite' ? '0.4' : '0.7'}
        />

        {/* National Highways & Arterial Roads */}
        {/* NH Expressway East-West */}
        <path
          d="M 0,140 Q 300,120 500,180 T 800,160"
          fill="none"
          stroke={mapLayer === 'satellite' ? '#64748b' : '#cbd5e1'}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 0,140 Q 300,120 500,180 T 800,160"
          fill="none"
          stroke={mapLayer === 'satellite' ? '#38bdf8' : '#f8fafc'}
          strokeWidth="6"
          strokeDasharray="14 10"
        />

        {/* North-South Ring Road */}
        <path
          d="M 220,0 Q 260,200 180,450"
          fill="none"
          stroke={mapLayer === 'satellite' ? '#475569' : '#cbd5e1'}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 220,0 Q 260,200 180,450"
          fill="none"
          stroke={mapLayer === 'satellite' ? '#94a3b8' : '#ffffff'}
          strokeWidth="5"
        />

        {/* Outer Ring Arc */}
        <path
          d="M 520,0 Q 640,240 480,450"
          fill="none"
          stroke={mapLayer === 'satellite' ? '#475569' : '#cbd5e1'}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 520,0 Q 640,240 480,450"
          fill="none"
          stroke={mapLayer === 'satellite' ? '#94a3b8' : '#ffffff'}
          strokeWidth="5"
        />

        {/* Sector Connecting Secondary roads */}
        <path
          d="M 100,60 L 700,380 M 150,380 L 680,80 M 350,0 L 380,450"
          fill="none"
          stroke={mapLayer === 'satellite' ? '#334155' : '#e2e8f0'}
          strokeWidth="4"
        />

        {/* Road Labels */}
        <text
          x="320"
          y="130"
          fill={mapLayer === 'satellite' ? '#94a3b8' : '#64748b'}
          fontSize="11"
          fontWeight="600"
          letterSpacing="1"
          transform="rotate(6, 320, 130)"
        >
          NH-48 EXPRESS HIGHWAY
        </text>
        <text
          x="480"
          y="340"
          fill={mapLayer === 'satellite' ? '#94a3b8' : '#64748b'}
          fontSize="10"
          fontWeight="500"
        >
          OUTER RING ROAD CORRIDOR
        </text>

        {/* City Sector Area labels */}
        <circle cx="280" cy="180" r="4" fill={mapLayer === 'satellite' ? '#38bdf8' : '#2563eb'} />
        <text x="290" y="184" fill={mapLayer === 'satellite' ? '#e2e8f0' : '#334155'} fontSize="10" fontWeight="600">
          Sector 21 / Cyber Zone
        </text>

        {/* Render Markers for Pothole Reports */}
        {showAllMarkers &&
          reports.map((report, idx) => {
            // Pseudo-projection to SVG canvas (deterministic by index & id)
            const basePositions = [
              { x: 310, y: 155 }, // NH-48
              { x: 540, y: 220 }, // Ring road
              { x: 230, y: 310 }, // Ashram underpass
              { x: 420, y: 95 },  // WEH
              { x: 610, y: 330 }, // GST road
              { x: 170, y: 160 },
              { x: 490, y: 290 },
            ];
            const pos = basePositions[idx % basePositions.length];
            const isSelected = selectedReportId === report.id;
            const color = severityColor(report.severity);

            return (
              <g
                key={report.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => onSelectReport && onSelectReport(report.id)}
                onMouseEnter={() => setHoveredReport(report)}
                onMouseLeave={() => setHoveredReport(null)}
              >
                {/* Ping animation for severe or selected */}
                {(isSelected || report.severity === 'severe') && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? '22' : '16'}
                    fill={color}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Outer halo */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? '14' : '10'}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="filter drop-shadow-md"
                />

                {/* Inner dot */}
                <circle cx={pos.x} cy={pos.y} r="4" fill="#ffffff" />

                {/* Pothole ID Label */}
                <rect
                  x={pos.x - 30}
                  y={pos.y - 32}
                  width="60"
                  height="16"
                  rx="4"
                  fill="#0f172a"
                  opacity={isSelected ? '0.95' : '0.8'}
                />
                <text
                  x={pos.x}
                  y={pos.y - 21}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="600"
                >
                  {report.id.replace('TS-2026-', '#')}
                </text>
              </g>
            );
          })}
      </svg>

      {/* Floating Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm text-xs backdrop-blur-sm">
        <button
          onClick={() => setMapLayer('streets')}
          className={`rounded px-2 py-1 font-medium transition ${
            mapLayer === 'streets' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Street
        </button>
        <button
          onClick={() => setMapLayer('satellite')}
          className={`rounded px-2 py-1 font-medium transition ${
            mapLayer === 'satellite' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* GPS Status Indicator */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1.5 shadow-sm text-xs backdrop-blur-sm">
        <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-medium text-slate-700">GPS Live Telemetry</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-500 font-mono text-[11px]">
          {activeReport ? `${activeReport.location.lat.toFixed(4)}°N, ${activeReport.location.lng.toFixed(4)}°E` : '28.4595°N, 77.0266°E'}
        </span>
      </div>

      {/* Hovered / Active Report Callout Card */}
      {(hoveredReport || activeReport) && (
        <div className="absolute top-3 left-3 max-w-xs rounded-xl border border-slate-200 bg-white/95 p-2.5 shadow-md backdrop-blur-md transition-all">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {(hoveredReport || activeReport).id}
              </div>
              <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                {(hoveredReport || activeReport).location.roadName}
              </div>
            </div>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase text-white"
              style={{ backgroundColor: severityColor((hoveredReport || activeReport).severity) }}
            >
              {(hoveredReport || activeReport).severity}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600 line-clamp-1">
            {(hoveredReport || activeReport).location.address}
          </p>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            <span>AI Confidence: {(hoveredReport || activeReport).confidenceScore}%</span>
            <span className="capitalize font-medium text-slate-700">
              {(hoveredReport || activeReport).status.replace('_', ' ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
