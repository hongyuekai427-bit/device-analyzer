import { useState, useEffect } from 'react';
import { HardDrive, Database, Archive, FolderOpen, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { DiagnosticResult } from '../types';

export function StoragePage({ baseResults }: { baseResults: DiagnosticResult[] }) {
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number; persisted: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getEstimate = async () => {
      try {
        if (navigator.storage) {
          const estimate = await navigator.storage.estimate();
          const persisted = navigator.storage.persisted ? await navigator.storage.persisted() : false;
          setStorageEstimate({
            usage: estimate.usage || 0,
            quota: estimate.quota || 0,
            persisted,
          });
        }
      } catch {}
      setLoading(false);
    };
    getEstimate();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Storage</h1>
        <p className="text-slate-400 text-sm">Browser storage capabilities and usage.</p>
      </div>

      {/* Storage APIs */}
      <div className="mb-6 grid gap-2 sm:grid-cols-2">
        {baseResults.filter(r => r.category === 'storage').map(r => (
          <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border ${
            r.status === 'supported' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/30 border-slate-700/30'
          }`}>
            <div className="flex items-center gap-2">
              {r.name.includes('IndexedDB') ? <Database size={14} className="text-blue-400" /> :
               r.name.includes('Cache') ? <Archive size={14} className="text-purple-400" /> :
               r.name.includes('File') ? <FolderOpen size={14} className="text-amber-400" /> :
               <HardDrive size={14} className="text-slate-400" />}
              <span className="text-sm text-slate-300">{r.name}</span>
            </div>
            <span className={`text-xs font-medium ${r.status === 'supported' ? 'text-emerald-400' : 'text-slate-500'}`}>
              {r.status === 'supported' ? '✓' : '✗'}
            </span>
          </div>
        ))}
      </div>

      {/* Storage Estimate */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Database size={16} className="text-blue-400" />
          <h3 className="text-sm font-medium text-white">Storage Estimate</h3>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <RefreshCw size={14} className="animate-spin" />
            <span>Calculating...</span>
          </div>
        ) : storageEstimate ? (
          <div>
            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Origin Usage</div>
                <div className="text-lg font-bold text-white">{formatBytes(storageEstimate.usage)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Origin Quota</div>
                <div className="text-lg font-bold text-white">{formatBytes(storageEstimate.quota)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Persistent</div>
                <div className={`text-lg font-bold ${storageEstimate.persisted ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {storageEstimate.persisted ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            {/* Usage bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Usage</span>
                <span>{storageEstimate.quota > 0 ? ((storageEstimate.usage / storageEstimate.quota) * 100).toFixed(2) : 0}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  style={{ width: `${Math.min((storageEstimate.usage / storageEstimate.quota) * 100, 100)}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              This represents the storage allocated to this website origin only, not your total device storage.
              Browsers typically allocate a percentage of available disk space.
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">StorageManager API not available.</p>
        )}
      </div>

      {/* Info */}
      <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-300 mb-1">Important Distinction</h3>
            <p className="text-xs text-slate-400">
              <strong>Device Memory (RAM)</strong> and <strong>Browser Storage Quota</strong> are different things. 
              RAM is your device's working memory. Storage quota is how much disk space the browser allows this website to use.
              This page shows storage quota, not RAM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ENHANCED PRIVACY PAGE ============
export function PrivacyPage({ baseResults }: { baseResults: DiagnosticResult[] }) {
  const categories = [
    {
      name: 'Browser Identification',
      signals: ['User Agent', 'Platform', 'Vendor', 'Language', 'Browser Version'],
      risk: 'high' as const,
      desc: 'These values are broadly available to all websites and can identify your browser.',
    },
    {
      name: 'Display Characteristics',
      signals: ['Screen Resolution', 'Color Depth', 'Device Pixel Ratio', 'Available Screen Area'],
      risk: 'medium' as const,
      desc: 'Display properties help narrow down device type and model.',
    },
    {
      name: 'Hardware Hints',
      signals: ['CPU Cores', 'Device Memory', 'Touch Points', 'Platform'],
      risk: 'medium' as const,
      desc: 'Hardware information is coarse-grained but still contributes to uniqueness.',
    },
    {
      name: 'Graphics Fingerprint',
      signals: ['WebGL Renderer', 'WebGL Vendor', 'WebGL Extensions', 'Max Texture Size'],
      risk: 'high' as const,
      desc: 'GPU information is one of the strongest fingerprinting signals available to websites.',
    },
    {
      name: 'Locale & Timezone',
      signals: ['Timezone', 'Language', 'Locale', 'Calendar', 'Numbering System'],
      risk: 'medium' as const,
      desc: 'Geographic and cultural indicators that narrow down user location.',
    },
    {
      name: 'Audio Fingerprint',
      signals: ['AudioContext Sample Rate', 'Channel Count', 'Audio Codec Support'],
      risk: 'low' as const,
      desc: 'Audio characteristics can create unique fingerprints through subtle hardware differences.',
    },
    {
      name: 'Permission-Gated (Requires Consent)',
      signals: ['Camera', 'Microphone', 'Location', 'Sensors', 'Bluetooth', 'USB'],
      risk: 'low' as const,
      desc: 'These require explicit user permission. They cannot be accessed without consent.',
    },
    {
      name: 'Storage & Capabilities',
      signals: ['Storage APIs', 'WebGL/WebGPU Support', 'Web API Support Matrix'],
      risk: 'low' as const,
      desc: 'API availability reveals browser engine and version, contributing to uniqueness.',
    },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Privacy & Fingerprinting Analysis</h1>
        <p className="text-slate-400 text-sm">Understanding what websites can learn about you.</p>
      </div>

      {/* Education */}
      <div className="mb-6 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
        <div className="flex items-start gap-3">
          <Eye size={18} className="text-indigo-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-indigo-300 mb-1">What is Browser Fingerprinting?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browser fingerprinting is the practice of collecting information about your browser, device, and capabilities 
              to create a unique identifier. Unlike cookies, fingerprints persist across sessions and cannot be easily deleted. 
              The more unique your combination of attributes, the easier you are to track.
            </p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This page does NOT generate a tracking fingerprint. Instead, it educates you about which information 
              your browser exposes and how it could be combined.
            </p>
          </div>
        </div>
      </div>

      {/* Fingerprinting Surface */}
      <h2 className="text-lg font-semibold text-white mb-3">Potential Fingerprinting Surface</h2>
      <div className="space-y-3 mb-6">
        {categories.map(cat => (
          <div key={cat.name} className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">{cat.name}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-medium uppercase ${getRiskColor(cat.risk)}`}>
                {cat.risk} risk
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">{cat.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {cat.signals.map(signal => (
                <span key={signal} className="text-[11px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-600/30">
                  {signal}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Exposed Values */}
      <h2 className="text-lg font-semibold text-white mb-3">Your Exposed Values</h2>
      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-6">
        <div className="grid gap-2 sm:grid-cols-2">
          {baseResults.filter(r => r.category === 'privacy' && r.id !== 'priv-summary').map(r => (
            <div key={r.id} className="flex items-start gap-2 p-2 rounded bg-slate-800/30">
              <Eye size={12} className="text-amber-400 mt-1 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">{r.name}</div>
                <div className="text-xs font-mono text-slate-300 break-all">{String(r.value)}</div>
                {r.privacyNote && <div className="text-[10px] text-amber-400/70 mt-0.5">{r.privacyNote}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Protection Tips */}
      <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
        <h3 className="text-sm font-medium text-emerald-300 mb-2">Reducing Your Fingerprint</h3>
        <ul className="text-xs text-slate-400 space-y-1.5">
          <li className="flex items-start gap-2"><span className="text-emerald-400">•</span> Use privacy-focused browsers (Firefox, Brave, Tor Browser)</li>
          <li className="flex items-start gap-2"><span className="text-emerald-400">•</span> Enable resistFingerprinting in Firefox (privacy.resistFingerprinting)</li>
          <li className="flex items-start gap-2"><span className="text-emerald-400">•</span> Use standard window sizes instead of maximized</li>
          <li className="flex items-start gap-2"><span className="text-emerald-400">•</span> Disable unnecessary browser extensions</li>
          <li className="flex items-start gap-2"><span className="text-emerald-400">•</span> Keep your browser updated</li>
          <li className="flex items-start gap-2"><span className="text-emerald-400">•</span> Be aware that unique hardware configurations increase identifiability</li>
        </ul>
      </div>
    </div>
  );
}
