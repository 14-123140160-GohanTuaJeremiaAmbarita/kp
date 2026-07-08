import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LabelList
} from 'recharts';
import { motion } from 'motion/react';
import { BarChart3, PieChart as PieChartIcon, Activity, TrendingUp, Settings2, Download } from 'lucide-react';

interface InteractiveChartProps {
  jsonResult: string;
  theme?: 'light' | 'dark';
}

/**
 * Generates a vibrant, visually distinct random HSL color.
 * Avoids dull/muddy colors by constraining saturation and lightness.
 */
function generateVibrantColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 65 + Math.floor(Math.random() * 30); // 65-95%
  const lightness = 45 + Math.floor(Math.random() * 20);  // 45-65%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generates N unique random vibrant colors.
 * Uses a minimum hue distance to ensure colors are visually distinct.
 */
function generateUniqueColors(count: number): string[] {
  const colors: string[] = [];
  const usedHues: number[] = [];
  const MIN_HUE_DISTANCE = Math.min(30, Math.floor(360 / Math.max(count, 1)));

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let hue: number;
    do {
      hue = Math.floor(Math.random() * 360);
      attempts++;
    } while (
      usedHues.some(h => Math.min(Math.abs(h - hue), 360 - Math.abs(h - hue)) < MIN_HUE_DISTANCE) &&
      attempts < 50
    );
    usedHues.push(hue);
    const saturation = 65 + Math.floor(Math.random() * 30);
    const lightness = 48 + Math.floor(Math.random() * 17);
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
}

type ChartType = 'bar' | 'area' | 'line' | 'pie';

// Custom tooltip
const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl ${
        isDark
          ? 'bg-slate-900/95 border-slate-600/50 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-800'
      }`}
      style={{ minWidth: '140px' }}
    >
      <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {label || (payload[0] && (payload[0].name || payload[0].payload.name))}
      </div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-sm font-bold">{typeof p.value === 'number' ? p.value.toLocaleString('id-ID') : p.value}</span>
        </div>
      ))}
    </motion.div>
  );
};

export default function InteractiveChart({ jsonResult, theme = 'dark' }: InteractiveChartProps) {
  const isDark = theme === 'dark';
  
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedXAxis, setSelectedXAxis] = useState<string>('');
  const [selectedYAxis, setSelectedYAxis] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);

  const rawData = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonResult);
      if (!Array.isArray(parsed) || parsed.length === 0) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }, [jsonResult]);

  const columns = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    return Object.keys(rawData[0]);
  }, [rawData]);

  const { finalData, finalXAxis, finalYAxis } = useMemo(() => {
    if (!rawData || columns.length < 2) return { finalData: [], finalXAxis: '', finalYAxis: '' };

    let defaultX = selectedXAxis;
    let defaultY = selectedYAxis;

    if (!defaultX || !columns.includes(defaultX)) {
      const categoricalX = columns.find(k => 
        k.toLowerCase().includes('dept') || 
        k.toLowerCase().includes('departemen') || 
        k.toLowerCase().includes('merk') || 
        k.toLowerCase().includes('jenis') ||
        k.toLowerCase().includes('status') ||
        k.toLowerCase().includes('type')
      );
      defaultX = categoricalX || columns[0];
    }
    if (!defaultY || !columns.includes(defaultY)) {
      const possibleY = columns.find(k => 
        k.toLowerCase().includes('total') || 
        k.toLowerCase().includes('jumlah') || 
        k.toLowerCase().includes('count') ||
        typeof rawData[0][k] === 'number'
      );
      defaultY = possibleY || columns[1];
    }

    let formattedData = rawData.map(row => ({
      ...row,
      name: String(row[defaultX] || 'N/A'),
      value: Number(row[defaultY] || 0)
    }));

    // Auto-aggregation for raw data
    // If the data has many rows, it's likely raw data or a window function. We group by the X-axis (name).
    if (formattedData.length > 20) {
      const grouped = new Map<string, number>();
      const hasRealValues = formattedData.some(d => !isNaN(d.value) && d.value > 0);
      
      formattedData.forEach(d => {
         if (!grouped.has(d.name)) {
            grouped.set(d.name, hasRealValues ? (isNaN(d.value) ? 0 : d.value) : 1);
         } else {
            if (!hasRealValues) {
               grouped.set(d.name, grouped.get(d.name)! + 1); // Auto-count
            } else {
               // For window functions, taking MAX is safest. 
               grouped.set(d.name, Math.max(grouped.get(d.name)!, isNaN(d.value) ? 0 : d.value));
            }
         }
      });
      
      formattedData = Array.from(grouped.entries()).map(([name, value]) => ({ name, value }));
      
      // If we auto-counted, update the Y-axis label to reflect this
      if (!hasRealValues && !selectedYAxis) {
        defaultY = `Jumlah per ${defaultX}`;
      }
    }

    if (formattedData.every(d => isNaN(d.value) || d.value === 0)) {
      return { finalData: [], finalXAxis: defaultX, finalYAxis: defaultY };
    }

    return { finalData: formattedData, finalXAxis: defaultX, finalYAxis: defaultY };
  }, [rawData, columns, selectedXAxis, selectedYAxis]);

  // Generate unique random colors once per component mount / data load
  const barColors = useMemo(() => {
    return generateUniqueColors(Math.max(finalData.length, 20));
  }, [finalData]);

  // Generate gradient colors for area and line chart
  const areaGradientColor = useMemo(() => generateVibrantColor(), []);
  const lineColor = useMemo(() => generateVibrantColor(), []);

  if (!rawData || finalData.length === 0) return null;

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        // Group into "Lainnya" if too many items for a pie chart
        const pieData = finalData.length > 12 ? [
          ...[...finalData].sort((a,b) => b.value - a.value).slice(0, 11),
          { 
            name: 'Lainnya', 
            value: [...finalData].sort((a,b) => b.value - a.value).slice(11).reduce((acc, curr) => acc + curr.value, 0)
          }
        ] : finalData;

        return (
          <PieChart>
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
            <Legend 
              wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingTop: '20px' }}
              formatter={(value: string) => <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{value}</span>}
            />
            <Pie 
              data={pieData} 
              cx="50%" cy="50%" 
              innerRadius={90} outerRadius={140} 
              paddingAngle={3} 
              dataKey="value" 
              nameKey="name"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
              label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              labelLine={{ stroke: isDark ? '#475569' : '#cbd5e1', strokeWidth: 1 }}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={barColors[index % barColors.length]} 
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))', cursor: 'pointer' }}
                />
              ))}
            </Pie>
          </PieChart>
        );
      case 'area':
        return (
          <AreaChart data={finalData} margin={{ top: 20, right: 20, left: -10, bottom: 40 }}>
            <defs>
              <linearGradient id={`areaGrad`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={areaGradientColor} stopOpacity={0.6}/>
                <stop offset="95%" stopColor={areaGradientColor} stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} opacity={0.4} />
            <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={60} tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} tickLine={false} axisLine={false} dy={10} />
            <YAxis tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ fill: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(241, 245, 249, 0.5)' }} />
            <Area type="monotone" dataKey="value" stroke={areaGradientColor} strokeWidth={3} fillOpacity={1} fill={`url(#areaGrad)`} animationDuration={800} />
          </AreaChart>
        );
      case 'line':
        return (
          <LineChart data={finalData} margin={{ top: 20, right: 20, left: -10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} opacity={0.4} />
            <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={60} tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} tickLine={false} axisLine={false} dy={10} />
            <YAxis tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ stroke: isDark ? '#475569' : '#cbd5e1', strokeDasharray: '5 5' }} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={lineColor} 
              strokeWidth={3} 
              dot={{ r: 5, fill: lineColor, stroke: isDark ? '#0f172a' : '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 7, stroke: lineColor, strokeWidth: 2, fill: isDark ? '#0f172a' : '#ffffff' }}
              animationDuration={800}
            />
          </LineChart>
        );
      case 'bar':
      default:
        // Sort data for vertical bar chart so largest is on the left
        // Limit to Top 15 to avoid clutter, group the rest as "Lainnya"
        const sortedBarData = finalData.length > 15 ? [
          ...[...finalData].sort((a, b) => b.value - a.value).slice(0, 15),
          {
            name: 'Lainnya',
            value: [...finalData].sort((a, b) => b.value - a.value).slice(15).reduce((acc, curr) => acc + curr.value, 0)
          }
        ] : [...finalData].sort((a, b) => b.value - a.value);

        return (
          <BarChart data={sortedBarData} margin={{ top: 20, right: 20, left: -10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} opacity={0.4} />
            <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={60} tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} tickLine={false} axisLine={false} dy={10} />
            <YAxis tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ fill: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(241, 245, 249, 0.5)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60} animationDuration={800} isAnimationActive={true}>
              {sortedBarData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.2))' }} />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  const chartTypeButtons: { type: ChartType; icon: React.ReactNode; label: string }[] = [
    { type: 'bar', icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Bar' },
    { type: 'area', icon: <Activity className="w-3.5 h-3.5" />, label: 'Area' },
    { type: 'line', icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'Line' },
    { type: 'pie', icon: <PieChartIcon className="w-3.5 h-3.5" />, label: 'Pie' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`w-full rounded-2xl overflow-hidden border shadow-lg transition-all duration-300 backdrop-blur-xl ${
        isDark 
          ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700/40 shadow-slate-950/50' 
          : 'bg-gradient-to-b from-white to-slate-50 border-slate-200/80 shadow-slate-200/50'
      }`}
    >
      {/* Header Bar */}
      <div className={`flex flex-wrap items-center justify-between px-3 py-2 border-b gap-2 ${
        isDark ? 'border-slate-800/60 bg-slate-800/20' : 'border-slate-100 bg-slate-50/60'
      }`}>
        {/* Chart Type Selector */}
        <div className={`flex p-0.5 rounded-xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
          {chartTypeButtons.map(btn => (
            <button 
              key={btn.type}
              onClick={() => setChartType(btn.type)} 
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                chartType === btn.type 
                  ? `${isDark ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-blue-500 text-white shadow-md shadow-blue-500/25'}` 
                  : `${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`
              }`}
            >
              {btn.icon}<span className="hidden sm:inline">{btn.label}</span>
            </button>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              showConfig 
                ? `${isDark ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`
                : `${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Konfigurasi</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Dashboard Style) */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 px-4 py-4 border-b ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
        <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700/50 shadow-inner' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
          <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">TOTAL KESELURUHAN</div>
          <div className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
            {finalData.reduce((a, b) => a + b.value, 0).toLocaleString('id-ID')}
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700/50 shadow-inner' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
          <div className="text-[10px] font-bold text-sky-500 uppercase tracking-wider mb-1">JUMLAH KATEGORI</div>
          <div className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
            {finalData.length}
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700/50 shadow-inner' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
          <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">RATA-RATA</div>
          <div className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
            {(finalData.reduce((a, b) => a + b.value, 0) / (finalData.length || 1)).toLocaleString('id-ID', {maximumFractionDigits: 1})}
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700/50 shadow-inner' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
          <div className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">TERBESAR</div>
          <div className={`text-sm font-bold truncate mt-1.5 ${isDark ? 'text-slate-100' : 'text-slate-800'}`} title={finalData.reduce((p, c) => p.value > c.value ? p : c, finalData[0] || {name: '-', value: 0}).name}>
            {finalData.reduce((p, c) => p.value > c.value ? p : c, finalData[0] || {name: '-', value: 0}).name}
          </div>
        </div>
      </div>

      {/* Axis Configuration Panel */}
      {showConfig && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`px-4 py-3 border-b grid grid-cols-2 gap-4 text-xs ${
            isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-50/80 border-slate-200'
          }`}
        >
          <div className="flex flex-col space-y-1.5">
            <label className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Sumbu X (Kategori)</label>
            <select 
              value={finalXAxis} 
              onChange={e => setSelectedXAxis(e.target.value)}
              className={`p-2 rounded-lg border outline-none text-xs font-medium transition-all focus:ring-2 focus:ring-blue-500/40 ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <label className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Sumbu Y (Nilai)</label>
            <select 
              value={finalYAxis} 
              onChange={e => setSelectedYAxis(e.target.value)}
              className={`p-2 rounded-lg border outline-none text-xs font-medium transition-all focus:ring-2 focus:ring-blue-500/40 ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </motion.div>
      )}
      
      {/* Chart Area */}
      <div className="w-full h-[500px] p-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
        {chartType === 'pie' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-15px' }}>
             <div className={`text-4xl font-black drop-shadow-sm ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                {finalData.reduce((a, b) => a + b.value, 0).toLocaleString('id-ID')}
             </div>
             <div className={`text-[10px] font-bold tracking-widest mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                TOTAL ITEM
             </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
