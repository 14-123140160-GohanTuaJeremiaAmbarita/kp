import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Activity, Cable, Factory, Gauge, RefreshCw, Zap, Laptop, MonitorSmartphone, Server
} from 'lucide-react';
import { DashboardStats } from '../../types/models';

interface DashboardProps {
  stats: DashboardStats | null;
  loadingStats: boolean;
  onRefresh: () => void;
  theme?: 'light' | 'dark';
}

function Panel({ title, children, dark, className = '' }: { title: string; children: React.ReactNode; dark: boolean; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border p-5 shadow-sm overflow-hidden ${dark ? 'border-slate-800 bg-slate-900/65' : 'border-slate-200 bg-white'} ${className}`}
    >
      <h3 className={`mb-5 text-sm font-extrabold ${dark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
      {children}
    </motion.div>
  );
}

export default function Dashboard({ stats, loadingStats, onRefresh, theme }: DashboardProps) {
  const dark = theme === 'dark';

  const tooltipStyle = {
    backgroundColor: dark ? '#07111f' : '#ffffff',
    border: `1px solid ${dark ? '#233044' : '#e2e8f0'}`,
    borderRadius: 12,
    color: dark ? '#f8fafc' : '#0f172a',
    fontSize: 11,
    boxShadow: '0 12px 30px rgba(15,23,42,.14)',
  };

  if (!stats) {
    return (
      <div className={`flex min-h-[520px] items-center justify-center rounded-3xl border ${dark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
        <div className="text-center">
          <Server className="mx-auto h-10 w-10 animate-pulse text-blue-500" />
          <p className={`mt-3 text-sm font-bold ${dark ? 'text-slate-200' : 'text-slate-800'}`}>Loading Data...</p>
        </div>
      </div>
    );
  }

  // --- Process Data for Devices By Type and Status ---
  const typeStatusData = stats.devicesByTypeAndStatus || [];
  const typeStatusTotal = { type: 'Total', y: 0, n: 0, p: 0, grandTotal: 0 };
  const pieData = [
    { name: 'Active (Y)', value: 0, color: '#3b82f6' },
    { name: 'Not-Active (N)', value: 0, color: '#ef4444' },
    { name: 'Propose Write Off (P)', value: 0, color: '#eab308' }
  ];

  const processedTypeStatus = typeStatusData.map(d => {
    const total = d.y + d.n + d.p;
    typeStatusTotal.y += d.y;
    typeStatusTotal.n += d.n;
    typeStatusTotal.p += d.p;
    typeStatusTotal.grandTotal += total;
    
    pieData[0].value += d.y;
    pieData[1].value += d.n;
    pieData[2].value += d.p;
    
    return { ...d, grandTotal: total };
  });

  // --- Process Data for Devices By Used ---
  const usedData = stats.devicesByUsed || [];
  const usedTotal = { type: 'Total', user: 0, nonUser: 0, grandTotal: 0 };
  const barChartUsedData = usedData.map(d => {
    const total = d.user + d.nonUser;
    usedTotal.user += d.user;
    usedTotal.nonUser += d.nonUser;
    usedTotal.grandTotal += total;
    return { name: d.type, User: d.user, 'Non-User': d.nonUser, total };
  });

  // --- Process Data for Devices By Age and Condition ---
  const ageCondData = stats.devicesByAgeAndCondition || [];
  const locations = ['VOKSEL', 'PME', 'BPS'];
  const types = ['PC', 'ALL IN ONE', 'NOTEBOOK'];
  
  const ageCondMatrix: any[] = types.map(t => ({ type: t, grandTotal: 0, goodTotal: 0, ageTotal: 0 }));
  const ageCondTotal: any = { type: 'Total', grandTotal: 0, goodTotal: 0, ageTotal: 0 };
  
  const barChartAgeData: any[] = [];

  locations.forEach(loc => {
    ageCondTotal[`${loc}_le6_good`] = 0;
    ageCondTotal[`${loc}_le6_notGood`] = 0;
    ageCondTotal[`${loc}_gt6_good`] = 0;
    ageCondTotal[`${loc}_gt6_notGood`] = 0;

    types.forEach((t, i) => {
      const le6Good = ageCondData.find(d => d.type === t && d.location === loc && d.ageGroup === '<= 6 Years' && d.condition === 'Good')?.count || 0;
      const le6NotGood = ageCondData.find(d => d.type === t && d.location === loc && d.ageGroup === '<= 6 Years' && d.condition === 'Not Good')?.count || 0;
      const gt6Good = ageCondData.find(d => d.type === t && d.location === loc && d.ageGroup === '> 6 Years' && d.condition === 'Good')?.count || 0;
      const gt6NotGood = ageCondData.find(d => d.type === t && d.location === loc && d.ageGroup === '> 6 Years' && d.condition === 'Not Good')?.count || 0;
      
      ageCondMatrix[i][`${loc}_le6_good`] = le6Good;
      ageCondMatrix[i][`${loc}_le6_notGood`] = le6NotGood;
      ageCondMatrix[i][`${loc}_gt6_good`] = gt6Good;
      ageCondMatrix[i][`${loc}_gt6_notGood`] = gt6NotGood;
      
      const rowTotal = le6Good + le6NotGood + gt6Good + gt6NotGood;
      const goodSum = le6Good + gt6Good;
      const ageSum = gt6Good + gt6NotGood;
      
      ageCondMatrix[i].grandTotal += rowTotal;
      ageCondMatrix[i].goodTotal += goodSum;
      ageCondMatrix[i].ageTotal += ageSum;
      
      ageCondTotal[`${loc}_le6_good`] += le6Good;
      ageCondTotal[`${loc}_le6_notGood`] += le6NotGood;
      ageCondTotal[`${loc}_gt6_good`] += gt6Good;
      ageCondTotal[`${loc}_gt6_notGood`] += gt6NotGood;
      
      ageCondTotal.grandTotal += rowTotal;
      ageCondTotal.goodTotal += goodSum;
      ageCondTotal.ageTotal += ageSum;
    });
  });

  // Data for the age condition chart
  const conditions = [
    { label: '<= 6 Years (Good)', filter: (d: any) => d.ageGroup === '<= 6 Years' && d.condition === 'Good', color: '#94a3b8' },
    { label: '<= 6 Years (Not Good)', filter: (d: any) => d.ageGroup === '<= 6 Years' && d.condition === 'Not Good', color: '#f87171' },
    { label: '> 6 Years (Good)', filter: (d: any) => d.ageGroup === '> 6 Years' && d.condition === 'Good', color: '#3b82f6' },
    { label: '> 6 Years (Not Good)', filter: (d: any) => d.ageGroup === '> 6 Years' && d.condition === 'Not Good', color: '#f97316' },
  ];

  locations.forEach(loc => {
    conditions.forEach(cond => {
      const entry: any = { name: `${loc} ${cond.label}` };
      types.forEach(t => {
        const item = ageCondData.find(d => d.type === t && d.location === loc && cond.filter(d));
        entry[t] = item ? item.count : 0;
      });
      barChartAgeData.push(entry);
    });
  });

  const currentMonth = new Date().toLocaleString('id-ID', { month: 'short', year: 'numeric' });

  // Render Table Cell
  const renderCell = (val: number, isTotal?: boolean) => (
    <td className={`border px-3 py-2 text-right ${isTotal ? 'font-bold bg-slate-50 dark:bg-slate-800/50' : ''} ${val === 0 ? 'text-slate-400 dark:text-slate-600' : ''}`}>
      {val > 0 ? val : '-'}
    </td>
  );

  return (
    <div className={`relative space-y-6 pb-12 ${dark ? 'text-slate-100' : 'text-slate-900'}`}>
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`relative overflow-hidden rounded-3xl border p-6 ${dark ? 'border-slate-800 bg-slate-950/85' : 'border-slate-200 bg-white/90'} shadow-lg`}>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
          {[0, 1, 2, 3].map(i => <div key={i} className="absolute h-[2px] bg-blue-500" style={{ width: `${120 + i * 40}px`, right: -20, top: `${24 + i * 23}%`, transform: 'rotate(-18deg)' }} />)}
        </div>
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <motion.div animate={{ rotate: [0, 2, -2, 0] }} transition={{ duration: 4, repeat: Infinity }} className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-500">
              <MonitorSmartphone className="h-7 w-7" />
            </motion.div>
            <div>
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">VOKSEL IT Device Summary Report {currentMonth}</h1>
              <p className={`mt-1 text-[11px] leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                Detailed breakdown of IT Devices by Status, Usage, Age, and Condition.
              </p>
            </div>
          </div>
          <button onClick={onRefresh} disabled={loadingStats} className="group flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 ${loadingStats ? 'animate-spin' : 'transition-transform group-hover:rotate-180'}`} />
            Refresh Data
          </button>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Type/Status and Used */}
        <div className="lg:col-span-4 space-y-6">
          <Panel dark={dark} title="Devices Summary by Type and Status">
            <div className="overflow-x-auto text-[10px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 font-bold">
                    <th className="border px-2 py-2 text-left">Company</th>
                    <th className="border px-2 py-2 text-left">Type</th>
                    <th className="border px-2 py-2 text-center" colSpan={3}>Status</th>
                    <th className="border px-2 py-2 text-right">Grand Total</th>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="border px-2 py-1"></th>
                    <th className="border px-2 py-1"></th>
                    <th className="border px-2 py-1 text-center w-12 text-blue-600 dark:text-blue-400">Y</th>
                    <th className="border px-2 py-1 text-center w-12 text-red-500">N</th>
                    <th className="border px-2 py-1 text-center w-12 text-yellow-500">P</th>
                    <th className="border px-2 py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {processedTypeStatus.map((row, i) => (
                    <tr key={row.type} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      {i === 0 && <td rowSpan={3} className="border px-2 py-2 font-medium">VOKSEL</td>}
                      <td className="border px-2 py-2 whitespace-nowrap">{row.type}</td>
                      {renderCell(row.y)}
                      {renderCell(row.n)}
                      {renderCell(row.p)}
                      {renderCell(row.grandTotal, true)}
                    </tr>
                  ))}
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <td colSpan={2} className="border px-2 py-2 font-bold text-left">Total</td>
                    {renderCell(typeStatusTotal.y, true)}
                    {renderCell(typeStatusTotal.n, true)}
                    {renderCell(typeStatusTotal.p, true)}
                    {renderCell(typeStatusTotal.grandTotal, true)}
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-[9px] text-slate-500 space-y-1">
              <p>(*) Y : Active</p>
              <p>N : Not-Active</p>
              <p>P : Propose Write Off</p>
            </div>

            <div className="h-52 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel dark={dark} title="Devices Summary by Used">
            <div className="overflow-x-auto text-[10px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 font-bold">
                    <th className="border px-2 py-2 text-left" rowSpan={2}>Type</th>
                    <th className="border px-2 py-2 text-center" rowSpan={2}>Status</th>
                    <th className="border px-2 py-2 text-center" colSpan={2}>Used</th>
                    <th className="border px-2 py-2 text-right" rowSpan={2}>Grand Total</th>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="border px-2 py-1 text-center">User</th>
                    <th className="border px-2 py-1 text-center">Non-User</th>
                  </tr>
                </thead>
                <tbody>
                  {barChartUsedData.map(row => (
                    <tr key={row.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="border px-2 py-2 whitespace-nowrap">{row.name}</td>
                      <td className="border px-2 py-2 text-center">Y</td>
                      {renderCell(row.User)}
                      {renderCell(row['Non-User'])}
                      {renderCell(row.total, true)}
                    </tr>
                  ))}
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <td colSpan={2} className="border px-2 py-2 font-bold text-left">Grand Total</td>
                    {renderCell(usedTotal.user, true)}
                    {renderCell(usedTotal.nonUser, true)}
                    {renderCell(usedTotal.grandTotal, true)}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="h-48 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartUsedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke={dark ? '#94a3b8' : '#64748b'} />
                  <YAxis tick={{ fontSize: 9 }} stroke={dark ? '#94a3b8' : '#64748b'} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="User" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Non-User" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* RIGHT COLUMN: Age and Condition */}
        <div className="lg:col-span-8">
          <Panel dark={dark} title="Devices Summary by Age and Condition">
            <div className="overflow-x-auto text-[9px] pb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 font-bold">
                    <th className="border px-2 py-2 text-left" rowSpan={3}>Type</th>
                    <th className="border px-2 py-2 text-center" rowSpan={3}>Status</th>
                    {locations.map(loc => (
                      <th key={loc} className="border px-2 py-1 text-center" colSpan={4}>Device Location at {loc}</th>
                    ))}
                    <th className="border px-2 py-2 text-right" rowSpan={3}>Grand Total</th>
                    <th className="border px-2 py-2 text-right" rowSpan={3}>Good (%)</th>
                    <th className="border px-2 py-2 text-right" rowSpan={3}>Age &gt; 6 Years (%)</th>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                    {locations.map(loc => (
                      <React.Fragment key={`${loc}-age`}>
                        <th className="border px-1 py-1 text-center" colSpan={2}>&lt;= 6 Years</th>
                        <th className="border px-1 py-1 text-center" colSpan={2}>&gt; 6 Years</th>
                      </React.Fragment>
                    ))}
                  </tr>
                  <tr className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                    {locations.map(loc => (
                      <React.Fragment key={`${loc}-cond`}>
                        <th className="border px-1 py-1 text-center">Good</th>
                        <th className="border px-1 py-1 text-center text-red-500">Not Good</th>
                        <th className="border px-1 py-1 text-center">Good</th>
                        <th className="border px-1 py-1 text-center text-red-500">Not Good</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ageCondMatrix.map(row => {
                    const goodPct = row.grandTotal > 0 ? Math.round((row.goodTotal / row.grandTotal) * 100) : 0;
                    const agePct = row.grandTotal > 0 ? Math.round((row.ageTotal / row.grandTotal) * 100) : 0;
                    return (
                      <tr key={row.type} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="border px-2 py-2 whitespace-nowrap font-medium">{row.type}</td>
                        <td className="border px-2 py-2 text-center">Y</td>
                        {locations.map(loc => (
                          <React.Fragment key={`${loc}-cells`}>
                            {renderCell(row[`${loc}_le6_good`])}
                            {renderCell(row[`${loc}_le6_notGood`])}
                            {renderCell(row[`${loc}_gt6_good`])}
                            {renderCell(row[`${loc}_gt6_notGood`])}
                          </React.Fragment>
                        ))}
                        {renderCell(row.grandTotal, true)}
                        <td className="border px-2 py-2 text-right">{goodPct}%</td>
                        <td className="border px-2 py-2 text-right">{agePct}%</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <td colSpan={2} className="border px-2 py-2 font-bold text-left">Total</td>
                    {locations.map(loc => (
                      <React.Fragment key={`${loc}-total-cells`}>
                        {renderCell(ageCondTotal[`${loc}_le6_good`], true)}
                        {renderCell(ageCondTotal[`${loc}_le6_notGood`], true)}
                        {renderCell(ageCondTotal[`${loc}_gt6_good`], true)}
                        {renderCell(ageCondTotal[`${loc}_gt6_notGood`], true)}
                      </React.Fragment>
                    ))}
                    {renderCell(ageCondTotal.grandTotal, true)}
                    <td className="border px-2 py-2 text-right font-bold">{ageCondTotal.grandTotal > 0 ? Math.round((ageCondTotal.goodTotal / ageCondTotal.grandTotal) * 100) : 0}%</td>
                    <td className="border px-2 py-2 text-right font-bold">{ageCondTotal.grandTotal > 0 ? Math.round((ageCondTotal.ageTotal / ageCondTotal.grandTotal) * 100) : 0}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="h-80 mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartAgeData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={60} stroke={dark ? '#94a3b8' : '#64748b'} />
                  <YAxis tick={{ fontSize: 9 }} stroke={dark ? '#94a3b8' : '#64748b'} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="PC" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="ALL IN ONE" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="NOTEBOOK" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 text-[10px] text-slate-500 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 flex gap-3">
              <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-700 dark:text-amber-500 mb-1">Condition Notes (*)</p>
                <p>Most of the devices in Not Good condition are PCs that are more than 6 years old.</p>
                <p>Total devices in Not Good condition: {ageCondTotal.grandTotal - ageCondTotal.goodTotal} units.</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
