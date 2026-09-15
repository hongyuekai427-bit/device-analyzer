import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard, Globe, Monitor, MonitorSmartphone, Cpu, Palette,
  Volume2, Camera, Wifi, HardDrive, Battery, Activity, MousePointer,
  Gamepad2, Bluetooth, Shield, Code2, Lock, EyeOff, Zap, FileText,
  Search, ChevronRight, ChevronDown, Copy, Download, RefreshCw,
  Info, AlertTriangle, Check, X, ExternalLink, Moon, Sun, Menu,
  ArrowLeft, ShieldCheck, Eye, Clock, BarChart3, HelpCircle, MapPin
} from 'lucide-react';
import {
  DiagnosticResult, DiagnosticCategory, DiagnosticStatus, CATEGORIES, CategoryInfo
} from './types';
import {
  getBrowserDiagnostics, getSystemDiagnostics, getDisplayDiagnostics,
  getCpuMemoryDiagnostics, getGraphicsDiagnostics, getAudioDiagnostics,
  getNetworkDiagnostics, getStorageDiagnostics, getBatteryDiagnostics,
  getSensorDiagnostics, getInputDiagnostics, getConnectivityDiagnostics,
  getPermissionDiagnostics, getSecurityDiagnostics, getApiDiagnostics,
  getPrivacyDiagnostics, getPerformanceDiagnostics, getMediaCodecDiagnostics
} from './diagnostics/engine';
import { CameraMediaPage, GamepadPage, BatteryPage, PerformanceBenchmarkPage } from './components/InteractivePages';
import { PermissionsCenter, LocationPage, NetworkPage, SensorsPage } from './components/SpecialPages';
import { StoragePage, PrivacyPage } from './components/StoragePrivacyPages';
import { WebApiMatrix, SecurityPage } from './components/ApiSecurityPages';
import { AudioPage } from './components/AudioPage';

// ============ ICON MAP ============
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  LayoutDashboard, Globe, Monitor, MonitorSmartphone, Cpu, Palette,
  Volume2, Camera, Wifi, HardDrive, Battery, Activity, MousePointer,
  Gamepad2, Bluetooth, Shield, Code2, Lock, EyeOff, Zap, FileText,
};

// ============ STATUS HELPERS ============
function getStatusColor(status: DiagnosticStatus): string {
  switch (status) {
    case 'available': case 'detected': case 'supported': return 'text-emerald-400';
    case 'unsupported': return 'text-red-400';
    case 'permission-required': return 'text-amber-400';
    case 'permission-denied': return 'text-red-400';
    case 'restricted': return 'text-orange-400';
    case 'unknown': return 'text-slate-400';
    case 'failed': return 'text-red-400';
    case 'not-applicable': return 'text-slate-500';
    default: return 'text-slate-400';
  }
}

function getStatusBg(status: DiagnosticStatus): string {
  switch (status) {
    case 'available': case 'detected': case 'supported': return 'bg-emerald-500/10 border-emerald-500/20';
    case 'unsupported': return 'bg-red-500/10 border-red-500/20';
    case 'permission-required': return 'bg-amber-500/10 border-amber-500/20';
    case 'permission-denied': return 'bg-red-500/10 border-red-500/20';
    case 'restricted': return 'bg-orange-500/10 border-orange-500/20';
    case 'unknown': return 'bg-slate-500/10 border-slate-500/20';
    case 'failed': return 'bg-red-500/10 border-red-500/20';
    case 'not-applicable': return 'bg-slate-500/10 border-slate-500/20';
    default: return 'bg-slate-500/10 border-slate-500/20';
  }
}

function getStatusLabel(status: DiagnosticStatus): string {
  switch (status) {
    case 'available': return 'Available';
    case 'detected': return 'Detected';
    case 'supported': return 'Supported';
    case 'unsupported': return 'Unsupported';
    case 'permission-required': return 'Permission Required';
    case 'permission-denied': return 'Permission Denied';
    case 'restricted': return 'Restricted';
    case 'unknown': return 'Unknown';
    case 'failed': return 'Failed';
    case 'not-applicable': return 'N/A';
    default: return status;
  }
}

// ============ DIAGNOSTIC CARD ============
function DiagnosticCard({ result, advanced }: { result: DiagnosticResult; advanced: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-lg border ${getStatusBg(result.status)} p-3 transition-all`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-200">{result.name}</span>
            {result.isEstimate && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Estimate</span>
            )}
          </div>
          {advanced && result.source && (
            <code className="text-[11px] text-slate-500 mt-0.5 block font-mono">{result.source}</code>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs font-medium ${getStatusColor(result.status)}`}>
            {getStatusLabel(result.status)}
          </span>
          {result.technicalDetails && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded hover:bg-white/5 text-slate-400"
              aria-label="Toggle details"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-1.5">
        {result.value !== null && result.value !== undefined && (
          <div className={`text-sm ${advanced ? 'font-mono text-slate-300' : 'text-slate-400'} break-all`}>
            {typeof result.value === 'boolean' ? (result.value ? 'Yes' : 'No') : String(result.value)}
          </div>
        )}
        {result.description && !expanded && (
          <div className="text-xs text-slate-500 mt-1">{result.description}</div>
        )}
        {result.privacyNote && (
          <div className="text-xs text-amber-400/80 mt-1 flex items-start gap-1">
            <Eye size={11} className="mt-0.5 shrink-0" />
            <span>{result.privacyNote}</span>
          </div>
        )}
      </div>

      {expanded && result.technicalDetails && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <pre className="text-xs font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(result.technicalDetails, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ============ CATEGORY PAGE ============
function CategoryPage({ category, results, advanced }: { category: CategoryInfo; results: DiagnosticResult[]; advanced: boolean }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Info size={48} className="mx-auto mb-3 opacity-50" />
        <p>No diagnostics available for this category.</p>
      </div>
    );
  }

  const supported = results.filter(r => r.status === 'available' || r.status === 'supported' || r.status === 'detected').length;
  const total = results.length;
  const percentage = Math.round((supported / total) * 100);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">{category.name}</h1>
        <p className="text-slate-400 text-sm">{category.description}</p>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${percentage}%` }} />
            </div>
            <span className="text-xs text-slate-400">{supported}/{total} supported ({percentage}%)</span>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {results.map(r => (
          <DiagnosticCard key={r.id} result={r} advanced={advanced} />
        ))}
      </div>
    </div>
  );
}

// ============ DASHBOARD ============
function Dashboard({ allResults, scores }: { allResults: DiagnosticResult[]; scores: Record<string, number> }) {
  const getVal = (id: string) => allResults.find(r => r.id === id);

  const overviewItems = [
    { label: 'Browser', value: getVal('browser-platform')?.value || 'Unknown', icon: Globe },
    { label: 'Platform', value: getVal('sys-platform')?.value || 'Unknown', icon: Monitor },
    { label: 'Screen', value: `${screen.width}×${screen.height}`, icon: MonitorSmartphone },
    { label: 'DPR', value: window.devicePixelRatio, icon: MonitorSmartphone },
    { label: 'Viewport', value: `${window.innerWidth}×${window.innerHeight}`, icon: MonitorSmartphone },
    { label: 'CPU Cores', value: navigator.hardwareConcurrency || 'Unknown', icon: Cpu },
    { label: 'Device Memory', value: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'Unknown', icon: HardDrive },
    { label: 'Online', value: navigator.onLine ? 'Yes' : 'No', icon: Wifi },
    { label: 'Touch', value: navigator.maxTouchPoints > 0 ? `Yes (${navigator.maxTouchPoints} points)` : 'No', icon: MousePointer },
    { label: 'WebGL', value: !!document.createElement('canvas').getContext('webgl') ? 'Supported' : 'No', icon: Palette },
    { label: 'WebGPU', value: !!(navigator as any).gpu ? 'Supported' : 'No', icon: Palette },
    { label: 'Secure', value: window.isSecureContext ? 'Yes' : 'No', icon: Lock },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/20">
            <LayoutDashboard size={24} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white mb-1">Device Intelligence</h1>
            <p className="text-sm text-slate-400 mb-3">
              Comprehensive browser & device capability analysis. All processing happens locally in your browser.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck size={14} />
              <span>Privacy-first • No data sent to servers • No tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Web Compatibility', value: scores.webCompatibility, desc: 'APIs supported', color: 'emerald' },
          { label: 'Hardware Exposure', value: scores.hardwareExposure, desc: 'Hardware info exposed', color: 'amber' },
          { label: 'Privacy Exposure', value: scores.privacyExposure, desc: 'Fingerprinting signals', color: 'orange' },
          { label: 'Completeness', value: scores.diagnosticCompleteness, desc: 'Diagnostics ran', color: 'blue' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold text-${s.color}-400`}>{s.value}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Overview Grid */}
      <h2 className="text-lg font-semibold text-white mb-3">Quick Overview</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {overviewItems.map(item => (
          <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <item.icon size={18} className="text-slate-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-slate-500">{item.label}</div>
              <div className="text-sm font-medium text-slate-200 truncate">{String(item.value)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* GPU Info */}
      {getVal('gpu-renderer') && (
        <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={16} className="text-purple-400" />
            <span className="text-sm font-medium text-white">Graphics</span>
          </div>
          <div className="text-sm text-slate-300">{String(getVal('gpu-renderer')?.value || 'Unknown GPU')}</div>
          <div className="text-xs text-slate-500 mt-1">
            WebGL: {getVal('gpu-webgl2')?.status === 'supported' ? 'WebGL 2' : 'WebGL 1'} • 
            WebGPU: {getVal('gpu-webgpu')?.status === 'supported' ? 'Available' : 'Not available'}
          </div>
        </div>
      )}

      {/* Device Classification */}
      <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-2">
          <Monitor size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-white">Device Classification</span>
        </div>
        <div className="text-sm text-slate-300">{String(getVal('sys-device-type')?.value || 'Unknown')}</div>
        <div className="text-xs text-slate-500 mt-1">Based on browser-exposed capabilities. Not guaranteed accurate.</div>
      </div>
    </div>
  );
}

// ============ REPORT PAGE ============
function ReportPage({ allResults }: { allResults: DiagnosticResult[] }) {
  const [includeSensitive, setIncludeSensitive] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateReport = useCallback(() => {
    const report: any = {
      schemaVersion: '1.0',
      generatedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toLocaleString(),
      categories: {} as Record<string, any[]>,
    };

    allResults.forEach(r => {
      if (!includeSensitive && (r.category === 'privacy' || r.privacyNote)) return;
      if (!report.categories[r.category]) report.categories[r.category] = [];
      report.categories[r.category].push({
        name: r.name,
        value: r.value,
        status: r.status,
        ...(r.description && { description: r.description }),
      });
    });

    return report;
  }, [allResults, includeSensitive]);

  const copyReport = async () => {
    const report = generateReport();
    const text = JSON.stringify(report, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJSON = () => {
    const report = generateReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `device-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTXT = () => {
    const report = generateReport();
    let text = `Device Intelligence Report\n`;
    text += `Generated: ${report.timestamp}\n`;
    text += `${'='.repeat(50)}\n\n`;

    Object.entries(report.categories).forEach(([cat, items]) => {
      text += `[${cat.toUpperCase()}]\n`;
      (items as any[]).forEach((item: any) => {
        text += `  ${item.name}: ${item.value} (${item.status})\n`;
      });
      text += '\n';
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `device-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Reports & Export</h1>
      <p className="text-slate-400 text-sm mb-6">Export your diagnostic results in various formats.</p>

      {/* Privacy controls */}
      <div className="mb-6 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-300 mb-1">Report Privacy</h3>
            <p className="text-xs text-slate-400 mb-3">
              By default, sensitive information (privacy analysis, permission states) is excluded from exports.
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSensitive}
                onChange={e => setIncludeSensitive(e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-300">Include sensitive fields (privacy analysis, permissions)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Export buttons */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={copyReport}
          className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
        >
          {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} className="text-slate-400" />}
          <div className="text-left">
            <div className="text-sm font-medium text-white">{copied ? 'Copied!' : 'Copy Report'}</div>
            <div className="text-xs text-slate-500">JSON to clipboard</div>
          </div>
        </button>

        <button
          onClick={downloadJSON}
          className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
        >
          <Download size={20} className="text-slate-400" />
          <div className="text-left">
            <div className="text-sm font-medium text-white">Download JSON</div>
            <div className="text-xs text-slate-500">Machine-readable format</div>
          </div>
        </button>

        <button
          onClick={downloadTXT}
          className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
        >
          <FileText size={20} className="text-slate-400" />
          <div className="text-left">
            <div className="text-sm font-medium text-white">Download TXT</div>
            <div className="text-xs text-slate-500">Human-readable format</div>
          </div>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
        >
          <ExternalLink size={20} className="text-slate-400" />
          <div className="text-left">
            <div className="text-sm font-medium text-white">Print Report</div>
            <div className="text-xs text-slate-500">Print-friendly version</div>
          </div>
        </button>
      </div>

      {/* Schema info */}
      <div className="mt-6 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
        <h3 className="text-sm font-medium text-white mb-2">Report Schema v1.0</h3>
        <p className="text-xs text-slate-400">
          Reports follow a versioned JSON schema. Fields include: schemaVersion, generatedAt, userAgent, 
          timestamp, and categorized diagnostic results. The schema evolves without breaking old reports.
        </p>
      </div>
    </div>
  );
}

// ============ SEARCH ============
function SearchOverlay({ 
  results, 
  onSelect, 
  onClose 
}: { 
  results: DiagnosticResult[]; 
  onSelect: (category: DiagnosticCategory) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return results.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.source?.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      String(r.value).toLowerCase().includes(q)
    ).slice(0, 20);
  }, [query, results]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-slate-700/50">
          <Search size={20} className="text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search diagnostics, APIs, capabilities..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
          />
          <kbd className="text-xs text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        {filtered.length > 0 && (
          <div className="max-h-96 overflow-y-auto p-2">
            {filtered.map(r => (
              <button
                key={r.id}
                onClick={() => { onSelect(r.category); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 text-left transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{r.name}</div>
                  <div className="text-xs text-slate-500 truncate">{r.description || r.source || r.category}</div>
                </div>
                <span className={`text-xs font-medium ${getStatusColor(r.status)}`}>
                  {getStatusLabel(r.status)}
                </span>
              </button>
            ))}
          </div>
        )}
        {query && filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">No results found</div>
        )}
      </div>
    </div>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [activeCategory, setActiveCategory] = useState<DiagnosticCategory>('overview');
  const [allResults, setAllResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [advanced, setAdvanced] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [batteryInfo, setBatteryInfo] = useState<any>(null);

  // Run all diagnostics
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const results: DiagnosticResult[] = [
          ...getBrowserDiagnostics(),
          ...getSystemDiagnostics(),
          ...getDisplayDiagnostics(),
          ...getCpuMemoryDiagnostics(),
          ...getGraphicsDiagnostics(),
          ...getAudioDiagnostics(),
          ...getNetworkDiagnostics(),
          ...getStorageDiagnostics(),
          ...getBatteryDiagnostics(),
          ...getSensorDiagnostics(),
          ...getInputDiagnostics(),
          ...getConnectivityDiagnostics(),
          ...getSecurityDiagnostics(),
          ...getApiDiagnostics(),
          ...getPrivacyDiagnostics(),
          ...getPerformanceDiagnostics(),
          ...getMediaCodecDiagnostics(),
        ];

        // Async permissions
        try {
          const permResults = await getPermissionDiagnostics();
          results.push(...permResults);
        } catch {}

        setAllResults(results);
      } catch (err) {
        console.error('Diagnostic error:', err);
      } finally {
        setLoading(false);
      }
    };

    run();

    // Battery
    if (typeof (navigator as any).getBattery === 'function') {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryInfo({
          level: Math.round(battery.level * 100),
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        });
      }).catch(() => {});
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Compute scores
  const scores = useMemo(() => {
    const total = allResults.length;
    if (total === 0) return { webCompatibility: 0, hardwareExposure: 0, privacyExposure: 0, diagnosticCompleteness: 0 };

    const apiResults = allResults.filter(r => r.category === 'apis');
    const supportedApis = apiResults.filter(r => r.status === 'supported').length;
    const webCompatibility = apiResults.length > 0 ? Math.round((supportedApis / apiResults.length) * 100) : 0;

    const hardwareResults = allResults.filter(r => ['cpu-memory', 'graphics', 'display'].includes(r.category));
    const exposedHardware = hardwareResults.filter(r => r.status === 'available' || r.status === 'supported').length;
    const hardwareExposure = hardwareResults.length > 0 ? Math.round((exposedHardware / hardwareResults.length) * 100) : 0;

    const privacyResults = allResults.filter(r => r.category === 'privacy');
    const exposedSignals = privacyResults.filter(r => r.status === 'available').length;
    const privacyExposure = privacyResults.length > 0 ? Math.round((exposedSignals / privacyResults.length) * 100) : 0;

    const successful = allResults.filter(r => !['failed'].includes(r.status)).length;
    const diagnosticCompleteness = Math.round((successful / total) * 100);

    return { webCompatibility, hardwareExposure, privacyExposure, diagnosticCompleteness };
  }, [allResults]);

  // Get results for current category
  const categoryResults = useMemo(() => {
    if (activeCategory === 'overview') return [];
    if (activeCategory === 'report') return [];
    return allResults.filter(r => r.category === activeCategory);
  }, [allResults, activeCategory]);

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory)!;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Running diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 h-screen sticky top-0">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Device Intelligence</h1>
              <p className="text-[10px] text-slate-500">v1.0.0</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {CATEGORIES.map(cat => {
            const Icon = ICON_MAP[cat.icon] || Globe;
            const isActive = activeCategory === cat.id;
            const count = allResults.filter(r => r.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all mb-0.5 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1 truncate">{cat.name}</span>
                {count > 0 && (
                  <span className="text-[10px] text-slate-600">{count}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => setAdvanced(!advanced)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
          >
            <Code2 size={14} />
            <span>{advanced ? 'Normal Mode' : 'Advanced Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-800">
            <Menu size={20} className="text-slate-300" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Shield size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">Device Intelligence</span>
          </div>
          <button onClick={() => setSearchOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-800">
            <Search size={20} className="text-slate-300" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 overflow-y-auto">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-white">Navigation</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-slate-800">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <nav className="p-2">
              {CATEGORIES.map(cat => {
                const Icon = ICON_MAP[cat.icon] || Globe;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-all mb-0.5 ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-14 lg:pt-0">
        {/* Top bar */}
        <div className="hidden lg:flex items-center justify-between px-6 py-3 border-b border-slate-800/50 bg-slate-900/30 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <button onClick={() => setActiveCategory('overview')} className="hover:text-white transition-colors">
              Home
            </button>
            <ChevronRight size={14} />
            <span className="text-white">{currentCategory.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-all"
            >
              <Search size={14} />
              <span>Search...</span>
              <kbd className="text-[10px] text-slate-600 border border-slate-700 rounded px-1">⌘K</kbd>
            </button>
            <button
              onClick={() => { setLoading(true); setTimeout(() => { window.location.reload(); }, 100); }}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              title="Refresh diagnostics"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6 max-w-6xl">
          {activeCategory === 'overview' && (
            <Dashboard allResults={allResults} scores={scores} />
          )}
          {activeCategory === 'report' && (
            <ReportPage allResults={allResults} />
          )}
          {activeCategory === 'camera' && (
            <CameraMediaPage baseResults={allResults} />
          )}
          {activeCategory === 'gamepad' && (
            <GamepadPage />
          )}
          {activeCategory === 'battery' && (
            <BatteryPage baseResults={allResults} />
          )}
          {activeCategory === 'performance' && (
            <PerformanceBenchmarkPage baseResults={allResults} />
          )}
          {activeCategory === 'permissions' && (
            <PermissionsCenter baseResults={allResults} />
          )}
          {activeCategory === 'sensors' && (
            <SensorsPage baseResults={allResults} />
          )}
          {activeCategory === 'network' && (
            <NetworkPage baseResults={allResults} />
          )}
          {activeCategory === 'input' && (
            <div>
              <CategoryPage category={currentCategory} results={categoryResults} advanced={advanced} />
            </div>
          )}
          {activeCategory === 'system' && (
            <div>
              <CategoryPage category={currentCategory} results={categoryResults} advanced={advanced} />
              <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-red-400" />
                  <h3 className="text-sm font-medium text-white">Location Test</h3>
                </div>
                <p className="text-xs text-slate-400 mb-3">Location testing requires explicit permission. Data stays local.</p>
                <button
                  onClick={() => setActiveCategory('overview')}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Use the dedicated Location section in Connectivity for testing →
                </button>
              </div>
            </div>
          )}
          {activeCategory === 'connectivity' && (
            <div>
              <CategoryPage category={currentCategory} results={categoryResults} advanced={advanced} />
              <div className="mt-6">
                <LocationPage />
              </div>
            </div>
          )}
          {activeCategory === 'storage' && (
            <StoragePage baseResults={allResults} />
          )}
          {activeCategory === 'privacy' && (
            <PrivacyPage baseResults={allResults} />
          )}
          {activeCategory === 'apis' && (
            <WebApiMatrix baseResults={allResults} />
          )}
          {activeCategory === 'security' && (
            <SecurityPage baseResults={allResults} />
          )}
          {activeCategory === 'audio' && (
            <AudioPage baseResults={allResults} />
          )}
          {activeCategory !== 'overview' && activeCategory !== 'report' && activeCategory !== 'camera' && activeCategory !== 'gamepad' && activeCategory !== 'battery' && activeCategory !== 'performance' && activeCategory !== 'permissions' && activeCategory !== 'sensors' && activeCategory !== 'network' && activeCategory !== 'input' && activeCategory !== 'system' && activeCategory !== 'connectivity' && activeCategory !== 'storage' && activeCategory !== 'privacy' && activeCategory !== 'apis' && activeCategory !== 'security' && activeCategory !== 'audio' && (
            <CategoryPage category={currentCategory} results={categoryResults} advanced={advanced} />
          )}
        </div>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 z-40">
          <div className="flex items-center justify-around py-2">
            {[
              { id: 'overview' as DiagnosticCategory, icon: LayoutDashboard, label: 'Home' },
              { id: 'browser' as DiagnosticCategory, icon: Globe, label: 'Browser' },
              { id: 'graphics' as DiagnosticCategory, icon: Palette, label: 'GPU' },
              { id: 'apis' as DiagnosticCategory, icon: Code2, label: 'APIs' },
              { id: 'report' as DiagnosticCategory, icon: FileText, label: 'Report' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${
                  activeCategory === item.id ? 'text-indigo-400' : 'text-slate-500'
                }`}
              >
                <item.icon size={18} />
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Search Overlay */}
      {searchOpen && (
        <SearchOverlay
          results={allResults}
          onSelect={setActiveCategory}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}
