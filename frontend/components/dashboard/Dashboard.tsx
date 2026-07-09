import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Camera,
  CheckCircle2,
  Cpu,
  Database,
  HardDrive,
  Monitor,
  MonitorSmartphone,
  PieChart as PieChartIcon,
  Printer,
  RefreshCw,
  Server,
  ShieldCheck,
  Table2,
  Ticket,
  Users,
  Wrench,
  XCircle,
} from 'lucide-react';
import { DashboardStats } from '../../types/models';

interface DashboardProps {
  stats: DashboardStats | null;
  loadingStats: boolean;
  onRefresh: () => void;
  theme?: 'light' | 'dark';
}

type TypeStatusRow = {
  type: string;
  y: number;
  n: number;
  p: number;
  grandTotal: number;
};

type UsedRow = {
  name: string;
  User: number;
  'Non-User': number;
  total: number;
};

type AgeConditionItem = {
  type: string;
  location: string;
  ageGroup: string;
  condition: string;
  count: number;
};

type AgeMatrixRow = {
  type: string;
  grandTotal: number;
  goodTotal: number;
  ageTotal: number;
  [key: string]: any;
};

const REPORT_LOCATIONS = ['VOKSEL', 'PME', 'BPS'] as const;
const REPORT_TYPES = ['PC', 'ALL IN ONE', 'NOTEBOOK'];

const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#64748b',
];

const REPORT_TYPE_COLORS: Record<string, string> = {
  PC: '#5f8fd6',
  'ALL IN ONE': '#ed8b36',
  NOTEBOOK: '#9a9a9a',
};

function num(value: any) {
  return Number(value || 0);
}

function formatNumber(value: any) {
  return Number(value || 0).toLocaleString('id-ID');
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function normalizeType(value: any) {
  const v = String(value || '').trim().toUpperCase();

  if (v === 'AIO' || v === 'ALL-IN-ONE') return 'ALL IN ONE';
  if (v === 'LAPTOP') return 'NOTEBOOK';

  return v || 'TIDAK DIKETAHUI';
}

function displayType(value: any) {
  const v = String(value || '').trim().toUpperCase();

  if (v === 'ALL IN ONE') return 'ALL IN ONE';
  if (v === 'NOTEBOOK') return 'NOTEBOOK';

  return v;
}

function Panel({
  title,
  subtitle,
  icon: Icon,
  children,
  dark,
  className = '',
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  dark: boolean;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className={`relative overflow-hidden rounded-3xl border p-5 shadow-xl backdrop-blur-xl ${
        dark
          ? 'border-slate-800/80 bg-slate-900/75 shadow-black/20'
          : 'border-slate-200/80 bg-white/90 shadow-slate-200/60'
      } ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -right-24 -top-24 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mb-5 flex items-start gap-3">
        {Icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
              dark
                ? 'border-blue-500/20 bg-blue-500/10 text-blue-300'
                : 'border-blue-200 bg-blue-50 text-blue-600'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}

        <div>
          <h3 className={`text-sm font-black tracking-tight ${dark ? 'text-slate-100' : 'text-slate-900'}`}>
            {title}
          </h3>

          {subtitle && (
            <p className={`mt-1 text-[11px] font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="relative">{children}</div>
    </motion.section>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  dark,
  tone,
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  dark: boolean;
  tone: 'blue' | 'emerald' | 'rose' | 'amber' | 'violet' | 'cyan' | 'slate';
  delay?: number;
}) {
  const tones = {
    blue: {
      border: 'border-l-blue-500',
      icon: dark ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-600',
      glow: 'bg-blue-500/20',
    },
    emerald: {
      border: 'border-l-emerald-500',
      icon: dark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-600',
      glow: 'bg-emerald-500/20',
    },
    rose: {
      border: 'border-l-rose-500',
      icon: dark ? 'bg-rose-500/10 text-rose-300' : 'bg-rose-50 text-rose-600',
      glow: 'bg-rose-500/20',
    },
    amber: {
      border: 'border-l-amber-500',
      icon: dark ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-600',
      glow: 'bg-amber-500/20',
    },
    violet: {
      border: 'border-l-violet-500',
      icon: dark ? 'bg-violet-500/10 text-violet-300' : 'bg-violet-50 text-violet-600',
      glow: 'bg-violet-500/20',
    },
    cyan: {
      border: 'border-l-cyan-500',
      icon: dark ? 'bg-cyan-500/10 text-cyan-300' : 'bg-cyan-50 text-cyan-600',
      glow: 'bg-cyan-500/20',
    },
    slate: {
      border: 'border-l-slate-500',
      icon: dark ? 'bg-slate-500/10 text-slate-300' : 'bg-slate-100 text-slate-600',
      glow: 'bg-slate-500/20',
    },
  };

  const current = tones[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4, scale: 1.015 }}
      className={`relative overflow-hidden rounded-3xl border border-l-4 p-5 shadow-xl backdrop-blur-xl transition-all ${
        current.border
      } ${
        dark
          ? 'border-slate-800/80 bg-slate-900/75 shadow-black/20'
          : 'border-slate-200/80 bg-white/95 shadow-slate-200/70'
      }`}
    >
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl ${current.glow}`} />

      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            {title}
          </p>

          <h2 className={`mt-2 text-3xl font-black tracking-tight ${dark ? 'text-white' : 'text-slate-950'}`}>
            {value}
          </h2>

          <p className={`mt-1 text-[11px] font-bold leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        </div>

        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${current.icon}`}>
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </motion.div>
  );
}

function MiniProgress({
  label,
  value,
  total,
  color,
  dark,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  dark: boolean;
}) {
  const pct = percentage(value, total);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-[11px] font-black ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
          {label}
        </span>

        <span className={`text-[11px] font-black ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          {formatNumber(value)} / {pct}%
        </span>
      </div>

      <div className={`h-2.5 overflow-hidden rounded-full ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function Dashboard({
  stats,
  loadingStats,
  onRefresh,
  theme = 'light',
}: DashboardProps) {
  const dark = theme === 'dark';
  const reportPeriod = useMemo(() => {
    const date = stats?.lastUpdated ? new Date(stats.lastUpdated) : new Date();

    return Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, [stats?.lastUpdated]);

  const tooltipStyle: React.CSSProperties = {
    backgroundColor: dark ? '#020617' : '#ffffff',
    border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
    borderRadius: 14,
    color: dark ? '#f8fafc' : '#0f172a',
    fontSize: 11,
    boxShadow: '0 16px 40px rgba(15,23,42,.18)',
  };

  const operational = useMemo(() => {
    const totalComputers = num(stats?.totalComputers);
    const activeComputers = num(stats?.activeComputers);
    const inactiveComputers = num(stats?.inactiveComputers);

    const totalWorkOrders = num(stats?.totalWorkOrders);
    const closedWorkOrders = num(stats?.closedWorkOrders);
    const openWorkOrders = num(stats?.openWorkOrders);

    const totalTickets = num(stats?.totalTickets);
    const resolvedTickets = num(stats?.resolvedTickets);
    const openTickets = num(stats?.openTickets);

    const assetCards = [
      {
        name: 'Komputer',
        value: num(stats?.totalComputers),
        active: num(stats?.activeComputers),
        icon: Cpu,
        color: '#3b82f6',
      },
      {
        name: 'Monitor',
        value: num(stats?.totalMonitors),
        active: num(stats?.activeMonitors),
        icon: Monitor,
        color: '#10b981',
      },
      {
        name: 'Pencetak',
        value: num(stats?.totalPrinters),
        active: num(stats?.activePrinters),
        icon: Printer,
        color: '#f59e0b',
      },
      {
        name: 'Unit CCTV',
        value: num(stats?.totalCctvUnits),
        active: num(stats?.totalCctvUnits),
        icon: Camera,
        color: '#8b5cf6',
      },
      {
        name: 'Lisensi',
        value: num(stats?.totalLicenses),
        active: num(stats?.totalLicenses),
        icon: HardDrive,
        color: '#06b6d4',
      },
    ];

    return {
      totalComputers,
      activeComputers,
      inactiveComputers,
      activeComputerPct: percentage(activeComputers, totalComputers),

      totalWorkOrders,
      closedWorkOrders,
      openWorkOrders,
      completionRate: percentage(closedWorkOrders, totalWorkOrders),

      totalTickets,
      resolvedTickets,
      openTickets,
      resolvedTicketPct: percentage(resolvedTickets, totalTickets),

      assetCards,
    };
  }, [stats]);

  const report = useMemo(() => {
    const typeStatusSource = (stats?.devicesByTypeAndStatus || []) as any[];
    const usedSource = (stats?.devicesByUsed || []) as any[];
    const ageCondSource = (stats?.devicesByAgeAndCondition || []) as any[];

    const processedTypeStatus: TypeStatusRow[] = REPORT_TYPES.map((type) => {
      const row = typeStatusSource.find((item) => normalizeType(item.type) === type);

      const y = num(row?.y);
      const n = num(row?.n);
      const p = num(row?.p);

      return {
        type,
        y,
        n,
        p,
        grandTotal: y + n + p,
      };
    });

    const typeStatusTotal = processedTypeStatus.reduce(
      (acc, row) => {
        acc.y += row.y;
        acc.n += row.n;
        acc.p += row.p;
        acc.grandTotal += row.grandTotal;
        return acc;
      },
      { y: 0, n: 0, p: 0, grandTotal: 0 }
    );

    const pieData = [
      { name: 'N', value: typeStatusTotal.n, color: '#d94841' },
      { name: 'P', value: typeStatusTotal.p, color: '#2b6cb0' },
      { name: 'Y', value: typeStatusTotal.y, color: '#e7b400' },
    ];

    const usedRows: UsedRow[] = REPORT_TYPES.map((type) => {
      const row = usedSource.find((item) => normalizeType(item.type) === type);

      const user = num(row?.user);
      const nonUser = num(row?.nonUser);

      return {
        name: type,
        User: user,
        'Non-User': nonUser,
        total: user + nonUser,
      };
    });

    const usedTotal = usedRows.reduce(
      (acc, row) => {
        acc.user += row.User;
        acc.nonUser += row['Non-User'];
        acc.grandTotal += row.total;
        return acc;
      },
      { user: 0, nonUser: 0, grandTotal: 0 }
    );

    const ageCondData: AgeConditionItem[] = ageCondSource.map((item) => ({
      type: normalizeType(item.type),
      location: String(item.location || '').trim().toUpperCase(),
      ageGroup: String(item.ageGroup || '').trim(),
      condition: String(item.condition || '').trim(),
      count: num(item.count),
    }));

    const getAgeCount = (
      type: string,
      location: string,
      ageGroup: '<= 6 Years' | '> 6 Years',
      condition: 'Good' | 'Not Good'
    ) => {
      return ageCondData
        .filter(
          (item) =>
            item.type === type &&
            item.location === location &&
            item.ageGroup === ageGroup &&
            item.condition === condition
        )
        .reduce((sum, item) => sum + item.count, 0);
    };

    const ageCondMatrix: AgeMatrixRow[] = REPORT_TYPES.map((type) => ({
      type,
      grandTotal: 0,
      goodTotal: 0,
      ageTotal: 0,
    }));

    const ageCondTotal: any = {
      grandTotal: 0,
      goodTotal: 0,
      ageTotal: 0,
    };

    REPORT_LOCATIONS.forEach((loc) => {
      ageCondTotal[`${loc}_le6_good`] = 0;
      ageCondTotal[`${loc}_le6_notGood`] = 0;
      ageCondTotal[`${loc}_gt6_good`] = 0;
      ageCondTotal[`${loc}_gt6_notGood`] = 0;

      REPORT_TYPES.forEach((type, index) => {
        const le6Good = getAgeCount(type, loc, '<= 6 Years', 'Good');
        const le6NotGood = getAgeCount(type, loc, '<= 6 Years', 'Not Good');
        const gt6Good = getAgeCount(type, loc, '> 6 Years', 'Good');
        const gt6NotGood = getAgeCount(type, loc, '> 6 Years', 'Not Good');

        ageCondMatrix[index][`${loc}_le6_good`] = le6Good;
        ageCondMatrix[index][`${loc}_le6_notGood`] = le6NotGood;
        ageCondMatrix[index][`${loc}_gt6_good`] = gt6Good;
        ageCondMatrix[index][`${loc}_gt6_notGood`] = gt6NotGood;

        const rowTotal = le6Good + le6NotGood + gt6Good + gt6NotGood;
        const goodSum = le6Good + gt6Good;
        const ageSum = gt6Good + gt6NotGood;

        ageCondMatrix[index].grandTotal += rowTotal;
        ageCondMatrix[index].goodTotal += goodSum;
        ageCondMatrix[index].ageTotal += ageSum;

        ageCondTotal[`${loc}_le6_good`] += le6Good;
        ageCondTotal[`${loc}_le6_notGood`] += le6NotGood;
        ageCondTotal[`${loc}_gt6_good`] += gt6Good;
        ageCondTotal[`${loc}_gt6_notGood`] += gt6NotGood;

        ageCondTotal.grandTotal += rowTotal;
        ageCondTotal.goodTotal += goodSum;
        ageCondTotal.ageTotal += ageSum;
      });
    });

    const ageChartData: any[] = [];

    REPORT_LOCATIONS.forEach((loc) => {
      [
        { label: `${loc} <=6 Baik`, shortLabel: 'Baik', ageLabel: '<= 6 Tahun', ageGroup: '<= 6 Years', condition: 'Good' },
        { label: `${loc} <=6 Tidak Baik`, shortLabel: 'Tidak Baik', ageLabel: '<= 6 Tahun', ageGroup: '<= 6 Years', condition: 'Not Good' },
        { label: `${loc} >6 Baik`, shortLabel: 'Baik', ageLabel: '> 6 Tahun', ageGroup: '> 6 Years', condition: 'Good' },
        { label: `${loc} >6 Tidak Baik`, shortLabel: 'Tidak Baik', ageLabel: '> 6 Tahun', ageGroup: '> 6 Years', condition: 'Not Good' },
      ].forEach((group) => {
        const row: any = {
          name: group.shortLabel,
          label: group.label,
          location: loc,
          ageLabel: group.ageLabel,
        };

        REPORT_TYPES.forEach((type) => {
          row[type] = getAgeCount(
            type,
            loc,
            group.ageGroup as '<= 6 Years' | '> 6 Years',
            group.condition as 'Good' | 'Not Good'
          );
        });

        ageChartData.push(row);
      });
    });

    const noteNotGoodGt6Pc = REPORT_LOCATIONS.reduce((sum, loc) => {
      return sum + getAgeCount('PC', loc, '> 6 Years', 'Not Good');
    }, 0);

    const totalNotGood = ageCondTotal.grandTotal - ageCondTotal.goodTotal;

    return {
      processedTypeStatus,
      typeStatusTotal,
      pieData,
      usedRows,
      usedTotal,
      ageCondMatrix,
      ageCondTotal,
      ageChartData,
      noteNotGoodGt6Pc,
      totalNotGood,
    };
  }, [stats]);

  const renderReportCell = (value: number, isTotal?: boolean) => (
    <td
      className={`border px-3 py-2 text-right text-[10px] ${
        isTotal
          ? dark
            ? 'bg-slate-800/70 font-black'
            : 'bg-slate-50 font-black'
          : ''
      } ${
        dark ? 'border-slate-700 text-slate-200' : 'border-slate-300 text-slate-700'
      } ${value === 0 ? 'opacity-50' : ''}`}
    >
      {value > 0 ? formatNumber(value) : '-'}
    </td>
  );

  if (!stats) {
    return (
      <div
        className={`relative flex min-h-[560px] items-center justify-center overflow-hidden rounded-3xl border ${
          dark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-20 top-20 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 h-60 w-60 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>

        <div className="relative text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-500/10 text-blue-400"
          >
            <Server className="h-8 w-8" />
          </motion.div>

          <p className={`mt-4 text-sm font-black ${dark ? 'text-slate-100' : 'text-slate-900'}`}>
            Memuat Data Dashboard...
          </p>

          <p className={`mt-1 text-xs font-medium ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
            Mengambil data langsung dari database ITOpr.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative space-y-8 pb-12 ${dark ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* ========================= */}
      {/* KONSEP LAMA */}
      {/* ========================= */}

      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl ${
          dark
            ? 'border-slate-800/80 bg-slate-950/90 shadow-black/20'
            : 'border-slate-200/80 bg-white/95 shadow-slate-200/80'
        }`}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute right-8 top-8 h-24 w-24 rounded-full border border-blue-400/20" />
          <div className="absolute right-20 top-14 h-40 w-40 rounded-full border border-emerald-400/10" />
        </div>

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/10"
            >
              <MonitorSmartphone className="h-8 w-8" />
            </motion.div>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                    dark
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  Database Dinamis
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                    dark
                      ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                      : 'border-blue-200 bg-blue-50 text-blue-700'
                  }`}
                >
                  ITOpr SQL Server
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Dashboard Operasional Smart IT
              </h1>

              <p className={`mt-2 max-w-3xl text-xs font-medium leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                Ringkasan operasional IT berdasarkan data terkini dari database: karyawan, komputer,
                tiket, perintah kerja, monitor, pencetak, CCTV, dan lisensi.
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loadingStats}
            className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-xl shadow-blue-500/25 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loadingStats ? 'animate-spin' : 'transition-transform duration-500 group-hover:rotate-180'
              }`}
            />
            Perbarui Data
          </button>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          dark={dark}
          tone="blue"
          icon={Cpu}
          title="Total Komputer"
          value={formatNumber(stats.totalComputers)}
          subtitle={`${formatNumber(stats.activeComputers)} aktif dari TD_computer`}
          delay={0.05}
        />

        <StatCard
          dark={dark}
          tone="emerald"
          icon={Users}
          title="Total Karyawan"
          value={formatNumber(stats.totalEmployees)}
          subtitle="Karyawan aktif dari TD_karyawan"
          delay={0.1}
        />

        <StatCard
          dark={dark}
          tone="violet"
          icon={Wrench}
          title="Total Perintah Kerja"
          value={formatNumber(stats.totalWorkOrders)}
          subtitle={`${formatNumber(stats.closedWorkOrders)} selesai • ${formatNumber(stats.openWorkOrders)} terbuka`}
          delay={0.15}
        />

        <StatCard
          dark={dark}
          tone="amber"
          icon={Ticket}
          title="Total Tiket"
          value={formatNumber(stats.totalTickets)}
          subtitle={`${formatNumber(stats.resolvedTickets)} terselesaikan • ${formatNumber(stats.openTickets)} terbuka`}
          delay={0.2}
        />

        <StatCard
          dark={dark}
          tone="cyan"
          icon={CheckCircle2}
          title="WO Selesai"
          value={formatNumber(stats.closedWorkOrders)}
          subtitle={`${operational.completionRate}% tingkat penyelesaian`}
          delay={0.25}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          dark={dark}
          tone="rose"
          icon={XCircle}
          title="WO Terbuka"
          value={formatNumber(stats.openWorkOrders)}
          subtitle="Perintah kerja belum selesai"
          delay={0.05}
        />

        <StatCard
          dark={dark}
          tone="slate"
          icon={Monitor}
          title="Total Monitor"
          value={formatNumber(stats.totalMonitors)}
          subtitle={`${formatNumber(stats.activeMonitors)} monitor aktif`}
          delay={0.1}
        />

        <StatCard
          dark={dark}
          tone="amber"
          icon={Printer}
          title="Total Pencetak"
          value={formatNumber(stats.totalPrinters)}
          subtitle={`${formatNumber(stats.activePrinters)} pencetak aktif`}
          delay={0.15}
        />

        <StatCard
          dark={dark}
          tone="violet"
          icon={Camera}
          title="Total CCTV"
          value={formatNumber(stats.totalCctvUnits)}
          subtitle="Unit CCTV dari TD_CCTV"
          delay={0.2}
        />

        <StatCard
          dark={dark}
          tone="cyan"
          icon={HardDrive}
          title="Total Lisensi"
          value={formatNumber(stats.totalLicenses)}
          subtitle="Lisensi dari TD_License"
          delay={0.25}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <Panel
            dark={dark}
            title="Ringkasan Operasional"
            subtitle="Ringkasan utama tiket dan perintah kerja"
            icon={Database}
            delay={0.1}
          >
            <div className="space-y-5">
              <MiniProgress
                dark={dark}
                label="Perintah Kerja Selesai"
                value={operational.closedWorkOrders}
                total={operational.totalWorkOrders}
                color="#10b981"
              />

              <MiniProgress
                dark={dark}
                label="Perintah Kerja Terbuka"
                value={operational.openWorkOrders}
                total={operational.totalWorkOrders}
                color="#ef4444"
              />

              <MiniProgress
                dark={dark}
                label="Tiket Terselesaikan"
                value={operational.resolvedTickets}
                total={operational.totalTickets}
                color="#3b82f6"
              />

              <MiniProgress
                dark={dark}
                label="Tiket Terbuka"
                value={operational.openTickets}
                total={operational.totalTickets}
                color="#f59e0b"
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className={`rounded-2xl p-4 ${dark ? 'bg-slate-950/70' : 'bg-slate-50'}`}>
                <p className={`text-[10px] font-black uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Rata-rata Waktu Henti
                </p>
                <p className="mt-2 text-2xl font-black">{formatNumber(stats.averageDowntime)}</p>
                <p className={`text-[11px] font-semibold ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                  menit
                </p>
              </div>

              <div className={`rounded-2xl p-4 ${dark ? 'bg-slate-950/70' : 'bg-slate-50'}`}>
                <p className={`text-[10px] font-black uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Penyelesaian
                </p>
                <p className="mt-2 text-2xl font-black">{operational.completionRate}%</p>
                <p className={`text-[11px] font-semibold ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                  WO selesai
                </p>
              </div>
            </div>
          </Panel>
        </div>

        <div className="xl:col-span-7">
          <Panel
            dark={dark}
            title="Komputer berdasarkan Jenis"
            subtitle="Distribusi jenis komputer dari TD_computer"
            icon={BarChart3}
            delay={0.15}
          >
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.computersByType || []} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={dark ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} stroke={dark ? '#94a3b8' : '#64748b'} />
                  <YAxis tick={{ fontSize: 11 }} stroke={dark ? '#94a3b8' : '#64748b'} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => formatNumber(value)} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {(stats.computersByType || []).map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <Panel
            dark={dark}
            title="Tiket berdasarkan Kategori"
            subtitle="Kategori tiket berdasarkan masalah"
            icon={Ticket}
            delay={0.1}
          >
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.ticketsByCategory || []}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {(stats.ticketsByCategory || []).map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => formatNumber(value)} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="xl:col-span-8">
          <Panel
            dark={dark}
            title="Tren Bulanan Perintah Kerja"
            subtitle="Tren WO selama 12 bulan terakhir dari TD_WO"
            icon={Activity}
            delay={0.15}
          >
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.woMonthlyTrend || []} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="totalWoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="closedWoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={dark ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700 }} stroke={dark ? '#94a3b8' : '#64748b'} />
                  <YAxis tick={{ fontSize: 11 }} stroke={dark ? '#94a3b8' : '#64748b'} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => formatNumber(value)} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                  <Area type="monotone" dataKey="total" name="Total WO" stroke="#3b82f6" fill="url(#totalWoGradient)" strokeWidth={3} />
                  <Area type="monotone" dataKey="closed" name="WO Selesai" stroke="#10b981" fill="url(#closedWoGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <Panel
            dark={dark}
            title="Karyawan berdasarkan Departemen"
            subtitle="Jumlah karyawan aktif per departemen"
            icon={Building2}
            delay={0.1}
          >
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={(stats.employeesByDepartment || []).slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke={dark ? '#1e293b' : '#e2e8f0'} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke={dark ? '#94a3b8' : '#64748b'} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fontWeight: 700 }} stroke={dark ? '#94a3b8' : '#64748b'} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => formatNumber(value)} />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="xl:col-span-5">
          <Panel
            dark={dark}
            title="Ringkasan Aset IT"
            subtitle="Ringkasan aset utama dari database TD"
            icon={BriefcaseBusiness}
            delay={0.15}
          >
            <div className="space-y-4">
              {operational.assetCards.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 + index * 0.05 }}
                    className={`rounded-2xl border p-4 ${
                      dark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-2xl text-white"
                          style={{ backgroundColor: item.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-black">{item.name}</p>
                          <p className={`text-[11px] font-bold ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                            Total {formatNumber(item.value)}
                          </p>
                        </div>
                      </div>

                      <p className="text-xl font-black">{formatNumber(item.value)}</p>
                    </div>

                    <MiniProgress
                      dark={dark}
                      label="Aktif / Tersedia"
                      value={item.active}
                      total={item.value}
                      color={item.color}
                    />
                  </motion.div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>

      {/* ========================= */}
      {/* KONSEP GAMBAR */}
      {/* ========================= */}

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={`rounded-[2rem] border p-6 shadow-xl ${
          dark
            ? 'border-slate-800 bg-slate-950/90'
            : 'border-slate-200 bg-white/95'
        }`}
      >
        <div className="mb-6 text-center">
          <h2 className="text-lg font-black tracking-tight">
            Laporan Ringkasan Perangkat IT VOKSEL {reportPeriod}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">
            <Panel
              dark={dark}
              title="Ringkasan Perangkat IT VOKSEL berdasarkan Jenis dan Status"
              icon={Table2}
              delay={0.05}
            >
              <div className="overflow-x-auto text-[10px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={dark ? 'bg-blue-900/40 text-blue-100' : 'bg-blue-100 text-blue-900'}>
                      <th className="border px-2 py-2 text-left">Perusahaan</th>
                      <th className="border px-2 py-2 text-left">Jenis</th>
                      <th className="border px-2 py-2 text-center" colSpan={3}>Status</th>
                      <th className="border px-2 py-2 text-right">Total Keseluruhan</th>
                    </tr>

                    <tr className={dark ? 'bg-slate-800/70 text-slate-300' : 'bg-slate-50 text-slate-600'}>
                      <th className="border px-2 py-1" />
                      <th className="border px-2 py-1" />
                      <th className="border px-2 py-1 text-center">Y</th>
                      <th className="border px-2 py-1 text-center">N</th>
                      <th className="border px-2 py-1 text-center">P</th>
                      <th className="border px-2 py-1" />
                    </tr>
                  </thead>

                  <tbody>
                    {report.processedTypeStatus.map((row, index) => (
                      <tr key={row.type} className={dark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                        {index === 0 && (
                          <td rowSpan={3} className="border px-2 py-2 align-top font-medium">
                            VOKSEL
                          </td>
                        )}

                        <td className="border px-2 py-2 whitespace-nowrap">
                          {displayType(row.type)}
                        </td>

                        {renderReportCell(row.y)}
                        {renderReportCell(row.n)}
                        {renderReportCell(row.p)}
                        {renderReportCell(row.grandTotal, true)}
                      </tr>
                    ))}

                    <tr className={dark ? 'bg-slate-800' : 'bg-slate-100'}>
                      <td colSpan={2} className="border px-2 py-2 text-left font-black">
                        Total
                      </td>
                      {renderReportCell(report.typeStatusTotal.y, true)}
                      {renderReportCell(report.typeStatusTotal.n, true)}
                      {renderReportCell(report.typeStatusTotal.p, true)}
                      {renderReportCell(report.typeStatusTotal.grandTotal, true)}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={`mt-3 space-y-1 text-[9px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                <p>(*) Y : Aktif</p>
                <p>N : Tidak Aktif</p>
                <p>P : Usulan Penghapusan Aset</p>
              </div>

              <div className="mt-5">
                <div className={`mb-2 text-center text-[11px] font-black ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                  KOMPUTER
                </div>

                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={report.pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={42}
                        outerRadius={75}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {report.pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}

                        <LabelList
                          dataKey="value"
                          position="inside"
                          formatter={(value: any) => (value > 0 ? value : '')}
                          style={{ fontSize: 11, fontWeight: 800, fill: '#ffffff' }}
                        />
                      </Pie>

                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend iconType="rect" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Panel>

            <Panel
              dark={dark}
              title="Ringkasan Perangkat IT VOKSEL berdasarkan Penggunaan"
              icon={BarChart3}
              delay={0.1}
            >
              <div className="overflow-x-auto text-[10px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={dark ? 'bg-blue-900/40 text-blue-100' : 'bg-blue-100 text-blue-900'}>
                      <th className="border px-2 py-2 text-left" rowSpan={2}>Jenis</th>
                      <th className="border px-2 py-2 text-center" rowSpan={2}>Status</th>
                      <th className="border px-2 py-2 text-center" colSpan={2}>Penggunaan</th>
                      <th className="border px-2 py-2 text-right" rowSpan={2}>Total Keseluruhan</th>
                    </tr>

                    <tr className={dark ? 'bg-slate-800/70 text-slate-300' : 'bg-slate-50 text-slate-600'}>
                      <th className="border px-2 py-1 text-center">Pengguna</th>
                      <th className="border px-2 py-1 text-center">Tanpa Pengguna</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.usedRows.map((row) => (
                      <tr key={row.name} className={dark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                        <td className="border px-2 py-2 whitespace-nowrap">{displayType(row.name)}</td>
                        <td className="border px-2 py-2 text-center">Y</td>
                        {renderReportCell(row.User)}
                        {renderReportCell(row['Non-User'])}
                        {renderReportCell(row.total, true)}
                      </tr>
                    ))}

                    <tr className={dark ? 'bg-slate-800' : 'bg-slate-100'}>
                      <td colSpan={2} className="border px-2 py-2 text-left font-black">
                        Total Keseluruhan
                      </td>
                      {renderReportCell(report.usedTotal.user, true)}
                      {renderReportCell(report.usedTotal.nonUser, true)}
                      {renderReportCell(report.usedTotal.grandTotal, true)}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-5 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.usedRows} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#334155' : '#e2e8f0'} />
                    <XAxis
                      dataKey="name"
                      tickFormatter={displayType}
                      tick={{ fontSize: 9 }}
                      stroke={dark ? '#94a3b8' : '#64748b'}
                    />
                    <YAxis tick={{ fontSize: 9 }} stroke={dark ? '#94a3b8' : '#64748b'} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="User" name="Pengguna" stackId="a" fill="#6d8fcf">
                      <LabelList
                        dataKey="User"
                        position="inside"
                        formatter={(value: any) => (value > 0 ? value : '')}
                        style={{ fontSize: 10, fill: '#ffffff', fontWeight: 700 }}
                      />
                    </Bar>
                    <Bar dataKey="Non-User" name="Tanpa Pengguna" stackId="a" fill="#e7a76b">
                      <LabelList
                        dataKey="Non-User"
                        position="inside"
                        formatter={(value: any) => (value > 0 ? value : '')}
                        style={{ fontSize: 10, fill: '#ffffff', fontWeight: 700 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          <div className="lg:col-span-8">
            <Panel
              dark={dark}
              title="Ringkasan Perangkat IT VOKSEL berdasarkan Usia dan Kondisi"
              icon={PieChartIcon}
              delay={0.15}
            >
              <div className="overflow-x-auto pb-4 text-[9px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={dark ? 'bg-blue-900/40 text-blue-100' : 'bg-blue-100 text-blue-900'}>
                      <th className="border px-2 py-2 text-left" rowSpan={3}>Jenis</th>
                      <th className="border px-2 py-2 text-center" rowSpan={3}>Status</th>

                      {REPORT_LOCATIONS.map((loc) => (
                        <th key={loc} className="border px-2 py-1 text-center" colSpan={4}>
                          Lokasi Perangkat di {loc}
                        </th>
                      ))}

                      <th className="border px-2 py-2 text-right" rowSpan={3}>Total Keseluruhan</th>
                      <th className="border px-2 py-2 text-right" rowSpan={3}>Baik (%)</th>
                      <th className="border px-2 py-2 text-right" rowSpan={3}>Usia &gt; 6 Tahun (%)</th>
                    </tr>

                    <tr className={dark ? 'bg-slate-800/70 text-slate-300' : 'bg-slate-50 text-slate-600'}>
                      {REPORT_LOCATIONS.map((loc) => (
                        <React.Fragment key={`${loc}-age`}>
                          <th className="border px-1 py-1 text-center" colSpan={2}>&lt;= 6 Tahun</th>
                          <th className="border px-1 py-1 text-center" colSpan={2}>&gt; 6 Tahun</th>
                        </React.Fragment>
                      ))}
                    </tr>

                    <tr className={dark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500'}>
                      {REPORT_LOCATIONS.map((loc) => (
                        <React.Fragment key={`${loc}-condition`}>
                          <th className="border px-1 py-1 text-center">Baik</th>
                          <th className="border px-1 py-1 text-center">Tidak Baik</th>
                          <th className="border px-1 py-1 text-center">Baik</th>
                          <th className="border px-1 py-1 text-center">Tidak Baik</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {report.ageCondMatrix.map((row) => {
                      const goodPercent = percentage(row.goodTotal, row.grandTotal);
                      const agePercent = percentage(row.ageTotal, row.grandTotal);

                      return (
                        <tr key={row.type} className={dark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                          <td className="border px-2 py-2 whitespace-nowrap font-medium">
                            {displayType(row.type)}
                          </td>

                          <td className="border px-2 py-2 text-center">Y</td>

                          {REPORT_LOCATIONS.map((loc) => (
                            <React.Fragment key={`${row.type}-${loc}`}>
                              {renderReportCell(row[`${loc}_le6_good`])}
                              {renderReportCell(row[`${loc}_le6_notGood`])}
                              {renderReportCell(row[`${loc}_gt6_good`])}
                              {renderReportCell(row[`${loc}_gt6_notGood`])}
                            </React.Fragment>
                          ))}

                          {renderReportCell(row.grandTotal, true)}
                          <td className="border px-2 py-2 text-right">{goodPercent}%</td>
                          <td className="border px-2 py-2 text-right">{agePercent}%</td>
                        </tr>
                      );
                    })}

                    <tr className={dark ? 'bg-slate-800' : 'bg-slate-100'}>
                      <td colSpan={2} className="border px-2 py-2 text-left font-black">
                        Total
                      </td>
                      {REPORT_LOCATIONS.map((loc) => (
                        <React.Fragment key={`total-${loc}`}>
                          {renderReportCell(report.ageCondTotal[`${loc}_le6_good`], true)}
                          {renderReportCell(report.ageCondTotal[`${loc}_le6_notGood`], true)}
                          {renderReportCell(report.ageCondTotal[`${loc}_gt6_good`], true)}
                          {renderReportCell(report.ageCondTotal[`${loc}_gt6_notGood`], true)}
                        </React.Fragment>
                      ))}
                      {renderReportCell(report.ageCondTotal.grandTotal, true)}
                      <td className="border px-2 py-2 text-right font-black">
                        {percentage(report.ageCondTotal.goodTotal, report.ageCondTotal.grandTotal)}%
                      </td>
                      <td className="border px-2 py-2 text-right font-black">
                        {percentage(report.ageCondTotal.ageTotal, report.ageCondTotal.grandTotal)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* The stacked bar chart from the image */}
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.ageChartData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#334155' : '#e2e8f0'} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 9 }}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                      stroke={dark ? '#94a3b8' : '#64748b'}
                    />
                    <YAxis tick={{ fontSize: 9 }} stroke={dark ? '#94a3b8' : '#64748b'} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="PC" stackId="a" fill="#5f8fd6">
                      <LabelList
                        dataKey="PC"
                        position="inside"
                        formatter={(value: any) => (value > 0 ? value : '')}
                        style={{ fontSize: 9, fill: '#ffffff', fontWeight: 700 }}
                      />
                    </Bar>
                    <Bar dataKey="ALL IN ONE" stackId="a" fill="#ed8b36">
                      <LabelList
                        dataKey="ALL IN ONE"
                        position="inside"
                        formatter={(value: any) => (value > 0 ? value : '')}
                        style={{ fontSize: 9, fill: '#ffffff', fontWeight: 700 }}
                      />
                    </Bar>
                    <Bar dataKey="NOTEBOOK" stackId="a" fill="#9a9a9a">
                      <LabelList
                        dataKey="NOTEBOOK"
                        position="inside"
                        formatter={(value: any) => (value > 0 ? value : '')}
                        style={{ fontSize: 9, fill: '#ffffff', fontWeight: 700 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Notes from the image */}
              <div className={`mt-6 text-[10px] p-4 rounded-2xl border ${
                dark ? 'border-amber-900/50 bg-amber-950/20 text-slate-400' : 'border-amber-200 bg-amber-50 text-slate-700'
              }`}>
                <p className="font-bold">(*)</p>
                <p>Sebagian besar perangkat berkondisi Tidak Baik adalah PC berusia lebih dari 6 tahun ({report.noteNotGoodGt6Pc} unit).</p>
                <p>Total perangkat berkondisi Tidak Baik adalah {report.totalNotGood} unit.</p>
              </div>
            </Panel>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
