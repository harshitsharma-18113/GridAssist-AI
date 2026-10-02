import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  ListCollapse
} from 'lucide-react';

const API_BASE = 'https://gridassist-ai.onrender.com';

export default function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/analytics`)
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading analytics data:", error);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-500 text-sm">
        Loading grid analytics dashboard...
      </div>
    );
  }

  const { summary, category_distribution, monthly_trends, priority_distribution, status_distribution, top_areas } = data;

  // 1. Donut Segment Math Helper (Category Distribution)
  const categoryColors = {
    "Power Outage": "#3b82f6",       // Blue
    "Transformer Fault": "#ef4444",   // Red
    "Billing Issue": "#10b981",       // Emerald
    "Smart Meter Issue": "#f59e0b",   // Amber
    "Voltage Fluctuation": "#6366f1", // Indigo
    "Street Light Fault": "#8b5cf6"   // Purple
  };

  const categoryList = Object.entries(category_distribution).map(([name, val]) => ({
    name,
    value: val,
    color: categoryColors[name] || "#64748b"
  }));
  const categoryTotal = categoryList.reduce((sum, item) => sum + item.value, 0);

  let accumulatedCatPercent = 0;
  const categorySegments = categoryList.map(item => {
    const percent = (item.value / categoryTotal) * 100;
    const strokeLength = (percent / 100) * 251.2;
    const strokeOffset = 251.2 - ((accumulatedCatPercent / 100) * 251.2);
    accumulatedCatPercent += percent;
    return { ...item, strokeLength, strokeOffset, percent };
  });

  // 2. Line Chart Math Helper (Monthly Trends)
  const maxTrendVal = Math.max(...monthly_trends.map(t => Math.max(t.complaints, t.resolved)));
  const lineChartWidth = 500;
  const lineChartHeight = 200;
  const paddingX = 50;
  const paddingY = 30;
  
  const getCoordinates = (index, value) => {
    const x = paddingX + (index * ((lineChartWidth - paddingX * 2) / (monthly_trends.length - 1)));
    const y = lineChartHeight - paddingY - (value / maxTrendVal) * (lineChartHeight - paddingY * 2);
    return { x, y };
  };

  const complaintPoints = monthly_trends.map((t, idx) => getCoordinates(idx, t.complaints));
  const resolvedPoints = monthly_trends.map((t, idx) => getCoordinates(idx, t.resolved));

  const complaintsPolyline = complaintPoints.map(p => `${p.x},${p.y}`).join(' ');
  const resolvedPolyline = resolvedPoints.map(p => `${p.x},${p.y}`).join(' ');

  // 3. Bar Chart Math Helper (Priority Distribution)
  const priorityColors = {
    "Low": "#94a3b8",      // Slate
    "Medium": "#eab308",   // Yellow
    "High": "#f97316",     // Orange
    "Critical": "#ef4444"  // Red
  };

  const priorityList = Object.entries(priority_distribution).map(([name, val]) => ({
    name,
    value: val,
    color: priorityColors[name] || "#3b82f6"
  }));
  const maxPriorityVal = Math.max(...priorityList.map(p => p.value));

  // 4. Donut Segment Math Helper (Status Distribution)
  const statusColors = {
    "Pending": "#64748b",     // Slate
    "Assigned": "#3b82f6",    // Blue
    "In Progress": "#f59e0b", // Amber
    "Resolved": "#10b981"     // Emerald
  };

  const statusList = Object.entries(status_distribution).map(([name, val]) => ({
    name,
    value: val,
    color: statusColors[name] || "#64748b"
  }));
  const statusTotal = statusList.reduce((sum, item) => sum + item.value, 0);

  let accumulatedStatusPercent = 0;
  const statusSegments = statusList.map(item => {
    const percent = (item.value / statusTotal) * 100;
    const strokeLength = (percent / 100) * 251.2;
    const strokeOffset = 251.2 - ((accumulatedStatusPercent / 100) * 251.2);
    accumulatedStatusPercent += percent;
    return { ...item, strokeLength, strokeOffset, percent };
  });

  return (
    <div className="space-y-6">
      
      {/* 5 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Complaints */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{summary.total_complaints.toLocaleString()}</h3>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <FileText size={18} />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{summary.pending_complaints.toLocaleString()}</h3>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
            <Clock size={18} />
          </div>
        </div>

        {/* In Progress / Resolved */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{summary.resolved_complaints.toLocaleString()}</h3>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle size={18} />
          </div>
        </div>

        {/* Critical */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Critical</p>
            <h3 className="text-2xl font-extrabold text-red-600">{summary.critical_complaints.toLocaleString()}</h3>
          </div>
          <div className="p-2.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* Resolution Time */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Resolution</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{summary.average_resolution_time}</h3>
          </div>
          <div className="p-2.5 rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      {/* 4 SVG Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Distribution (Donut Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Complaint Category Distribution</h3>
            <p className="text-[10px] text-slate-400">Distribution of grid reports across classification groups</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                {categorySegments.map((seg, idx) => (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="8"
                    strokeDasharray={`${seg.strokeLength} 251.2`}
                    strokeDashoffset={seg.strokeOffset}
                    className="transition-all duration-300 hover:stroke-[10px] cursor-pointer"
                    title={`${seg.name}: ${seg.value}`}
                  />
                ))}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-slate-850">{categoryTotal}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
              </div>
            </div>
            
            <div className="space-y-1.5 text-xs text-slate-600 w-full sm:w-auto">
              {categorySegments.map((seg, idx) => (
                <div key={idx} className="flex items-center justify-between sm:justify-start gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
                    <span className="font-medium text-[11px] text-slate-700">{seg.name}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-500">
                    {seg.value} ({seg.percent.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Distribution (Donut Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Complaint Status Distribution</h3>
            <p className="text-[10px] text-slate-400">Current active state profile for registered complaints</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                {statusSegments.map((seg, idx) => (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="8"
                    strokeDasharray={`${seg.strokeLength} 251.2`}
                    strokeDashoffset={seg.strokeOffset}
                    className="transition-all duration-300 hover:stroke-[10px] cursor-pointer"
                  />
                ))}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-slate-850">{statusTotal}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
              </div>
            </div>
            
            <div className="space-y-2 text-xs text-slate-600 w-full sm:w-auto">
              {statusSegments.map((seg, idx) => (
                <div key={idx} className="flex items-center justify-between sm:justify-start gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
                    <span className="font-medium text-[11px] text-slate-700">{seg.name}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-500">
                    {seg.value} ({seg.percent.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Complaint Trends (Line Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Monthly Complaint Trends</h3>
              <p className="text-[10px] text-slate-400">Incoming vs. resolved records trajectory over 6 months</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-blue-600" />
                <span className="text-slate-600">Logged</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-emerald-500" />
                <span className="text-slate-600">Resolved</span>
              </div>
            </div>
          </div>

          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} className="w-full h-auto">
              {/* Horizontal gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = paddingY + ratio * (lineChartHeight - paddingY * 2);
                const val = Math.round(maxTrendVal - ratio * maxTrendVal);
                return (
                  <g key={idx}>
                    <line x1={paddingX} y1={y} x2={lineChartWidth - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    <text x={paddingX - 10} y={y + 4} textAnchor="end" className="text-[10px] font-mono fill-slate-400">{val}</text>
                  </g>
                );
              })}

              {/* X Axis month labels */}
              {monthly_trends.map((t, idx) => {
                const coords = getCoordinates(idx, t.complaints);
                return (
                  <text key={idx} x={coords.x} y={lineChartHeight - 8} textAnchor="middle" className="text-[10px] font-semibold fill-slate-500">
                    {t.month}
                  </text>
                );
              })}

              {/* Logged Complaints Line */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                points={complaintsPolyline}
                className="transition-all"
              />

              {/* Resolved Line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={resolvedPolyline}
                className="transition-all"
              />

              {/* Data Point Circles */}
              {complaintPoints.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
              ))}
              {resolvedPoints.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              ))}
            </svg>
          </div>
        </div>

        {/* Complaint Priority Distribution (Bar Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Complaint Severity Distribution</h3>
            <p className="text-[10px] text-slate-400">Total cases categorized by priority levels</p>
          </div>

          <div className="w-full overflow-hidden">
            <svg viewBox="0 0 400 200" className="w-full h-auto">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = 30 + ratio * 130;
                const val = Math.round(maxPriorityVal - ratio * maxPriorityVal);
                return (
                  <g key={idx}>
                    <line x1={40} y1={y} x2={380} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    <text x={30} y={y + 4} textAnchor="end" className="text-[10px] font-mono fill-slate-400">{val}</text>
                  </g>
                );
              })}

              {/* Columns */}
              {priorityList.map((p, idx) => {
                const colWidth = 50;
                const colGap = 80;
                const colX = 60 + idx * colGap;
                const barHeight = (p.value / maxPriorityVal) * 130;
                const colY = 160 - barHeight;
                return (
                  <g key={idx} className="group cursor-pointer">
                    <rect
                      x={colX}
                      y={colY}
                      width={colWidth}
                      height={barHeight}
                      fill={p.color}
                      rx="4"
                      className="opacity-90 hover:opacity-100 transition-opacity"
                    />
                    <text
                      x={colX + colWidth / 2}
                      y={colY - 6}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-slate-650 font-mono"
                    >
                      {p.value}
                    </text>
                    <text
                      x={colX + colWidth / 2}
                      y={180}
                      textAnchor="middle"
                      className="text-[11px] font-bold fill-slate-600"
                    >
                      {p.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

      </div>

      {/* Top Complaint Areas Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
          <MapPin size={18} className="text-blue-600" />
          <div>
            <h3 className="font-bold text-sm text-slate-800 font-sans">Top Complaint Areas</h3>
            <p className="text-[10px] text-slate-400">High-volume consumer regions and primary failure points</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-650 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-6">Grid Zone Address</th>
                <th className="py-3 px-6">Complaint Volume</th>
                <th className="py-3 px-6">Most Common Issue Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
              {top_areas.map((area, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                  <td className="py-3.5 px-6 flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    {area.area}
                  </td>
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{area.complaint_count}</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-1 rounded-full text-[10px] bg-slate-100 text-slate-700 font-medium border border-slate-200/50">
                      {area.most_common_issue}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
