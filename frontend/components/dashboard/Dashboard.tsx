import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { RefreshCw, Users, Monitor, FileText, AlertCircle, Wrench } from 'lucide-react';
import { DashboardStats } from '../../types/models';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  desc: string;
  theme?: 'light' | 'dark';
}

function MetricCard({ title, value, icon, desc, theme }: MetricCardProps) {
  const isDark = theme === 'dark';
  return (
    <div className={`rounded-2xl border transition-colors duration-300 p-4 flex items-center justify-between shadow-md ${
      isDark 
        ? 'border-slate-800 bg-slate-900/40 text-slate-100' 
        : 'border-slate-200 bg-white text-slate-850'
    }`}>
      <div className="space-y-1">
        <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</span>
        <h3 className={`text-2xl font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
        <p className={`text-[10px] leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
      </div>
      <div className={`rounded-xl p-2.5 transition-colors duration-300 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
        {icon}
      </div>
    </div>
  );
}

interface DashboardProps {
  stats: DashboardStats | null;
  loadingStats: boolean;
  onRefresh: () => void;
  theme?: 'light' | 'dark';
}

const COLORS_BRAND = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
const COLORS_WO = ['#10b981', '#f59e0b']; // Green (Completed), Amber (In Progress)
const COLORS_ASSET = ['#3b82f6', '#ef4444']; // Blue (Active), Rose (Maintenance)

export default function Dashboard({
  stats,
  loadingStats,
  onRefresh,
  theme,
}: DashboardProps) {
  const isDark = theme === 'dark';

  return (
    <div className="space-y-6 pb-12">
      <div className={`flex items-center justify-between pb-4 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div>
          <h2 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>IT Operations Analytics</h2>
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Statistik real-time introspeksi skema ITOpr PT Voksel Electric Tbk.</p>
        </div>
        <button 
          onClick={onRefresh}
          className={`flex items-center space-x-1 rounded-lg border px-3 py-1.5 text-xs transition shadow-sm font-semibold cursor-pointer ${
            isDark 
              ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white' 
              : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50 hover:text-slate-850'
          }`}
        >
          <RefreshCw className={`h-3 w-3 ${loadingStats ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {stats ? (
        <div className="space-y-6 animate-fade">
          
          {/* Metric Cards Grid */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            <MetricCard 
              title="Total Karyawan" 
              value={stats.totalEmployees} 
              icon={<Users className="h-5 w-5 text-blue-500" />}
              desc="Karyawan Aktif"
              theme={theme}
            />
            <MetricCard 
              title="Aset Komputer" 
              value={stats.totalComputers} 
              icon={<Monitor className="h-5 w-5 text-indigo-500" />}
              desc="Inventaris Laptop/PC"
              theme={theme}
            />
            <MetricCard 
              title="Total Tiket IT" 
              value={stats.totalTickets} 
              icon={<FileText className="h-5 w-5 text-amber-500" />}
              desc="Keluhan Masuk"
              theme={theme}
            />
            <MetricCard 
              title="Tiket Open" 
              value={stats.openTickets} 
              icon={<AlertCircle className="h-5 w-5 text-rose-500" />}
              desc="Belum Ada WO"
              theme={theme}
            />
            <MetricCard 
              title="Work Orders" 
              value={stats.totalWorkOrders || 0} 
              icon={<Wrench className="h-5 w-5 text-emerald-500" />}
              desc="Penugasan Teknisi"
              theme={theme}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Chart 1: Karyawan Per Departemen */}
            <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 md:col-span-2 ${
              isDark ? 'border-slate-800 bg-slate-900/40 text-slate-150' : 'border-slate-200 bg-white'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Distribusi Karyawan Per Departemen</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.employeesByDepartment || []} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                    <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} angle={-15} textAnchor="end" height={50} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <Tooltip contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                      borderColor: isDark ? '#1e293b' : '#e2e8f0', 
                      borderRadius: '8px',
                      color: isDark ? '#f8fafc' : '#0f172a'
                    }} />
                    <Bar dataKey="value" name="Jumlah Karyawan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Computer Brands (Pie) */}
            <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 ${
              isDark ? 'border-slate-800 bg-slate-900/40 text-slate-150' : 'border-slate-200 bg-white'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Distribusi Merek Komputer (Top 5)</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.computersByBrand || []}
                      cx="40%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(stats.computersByBrand || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_BRAND[index % COLORS_BRAND.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                      borderColor: isDark ? '#1e293b' : '#e2e8f0', 
                      borderRadius: '8px',
                      color: isDark ? '#f8fafc' : '#0f172a'
                    }} />
                    <Legend 
                      layout="vertical" 
                      align="right" 
                      verticalAlign="middle" 
                      iconSize={8}
                      formatter={(value) => <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{value}</span>} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Work Order Status (Donut) */}
            <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 ${
              isDark ? 'border-slate-800 bg-slate-900/40 text-slate-150' : 'border-slate-200 bg-white'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status Penanganan Work Order (WO)</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.woStatus || []}
                      cx="40%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(stats.woStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_WO[index % COLORS_WO.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                      borderColor: isDark ? '#1e293b' : '#e2e8f0', 
                      borderRadius: '8px',
                      color: isDark ? '#f8fafc' : '#0f172a'
                    }} />
                    <Legend 
                      layout="vertical" 
                      align="right" 
                      verticalAlign="middle" 
                      iconSize={8}
                      formatter={(value) => <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{value}</span>} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Computer Health Status */}
            <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 ${
              isDark ? 'border-slate-800 bg-slate-900/40 text-slate-150' : 'border-slate-200 bg-white'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status Aktifitas Aset Komputer</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.computerStatus || []}
                      cx="40%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(stats.computerStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_ASSET[index % COLORS_ASSET.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                      borderColor: isDark ? '#1e293b' : '#e2e8f0', 
                      borderRadius: '8px',
                      color: isDark ? '#f8fafc' : '#0f172a'
                    }} />
                    <Legend 
                      layout="vertical" 
                      align="right" 
                      verticalAlign="middle" 
                      iconSize={8}
                      formatter={(value) => <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{value}</span>} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 5: Category Distribution */}
            <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 ${
              isDark ? 'border-slate-800 bg-slate-900/40 text-slate-150' : 'border-slate-200 bg-white'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Keluhan IT Berdasarkan Kategori</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ticketsByCategory || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                    <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <Tooltip contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                      borderColor: isDark ? '#1e293b' : '#e2e8f0', 
                      borderRadius: '8px',
                      color: isDark ? '#f8fafc' : '#0f172a'
                    }} />
                    <Bar dataKey="value" name="Tiket" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="py-20 text-center text-slate-400">
          <AlertCircle className="mx-auto h-8 w-8 mb-2 animate-bounce text-slate-300" />
          <p className="text-xs font-mono">Gagal mengambil statistik IT Operations. Silakan refresh kembali.</p>
        </div>
      )}
    </div>
  );
}
export { Dashboard };
