import { useState } from 'react';
import { Code2, Check, X, Search, Filter, ExternalLink, Lock, Shield, Globe, AlertTriangle } from 'lucide-react';
import { DiagnosticResult } from '../types';

// ============ WEB API MATRIX ============
export function WebApiMatrix({ baseResults }: { baseResults: DiagnosticResult[] }) {
  const [filter, setFilter] = useState<'all' | 'supported' | 'unsupported'>('all');
  const [search, setSearch] = useState('');

  const apiResults = baseResults.filter(r => r.category === 'apis');
  
  const filtered = apiResults.filter(r => {
    if (filter === 'supported' && r.status !== 'supported') return false;
    if (filter === 'unsupported' && r.status === 'supported') return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const supported = apiResults.filter(r => r.status === 'supported').length;
  const total = apiResults.length;

  // Group by category
  const groups: Record<string, DiagnosticResult[]> = {};
  filtered.forEach(r => {
    const group = r.name.includes('Web') ? 'Web Platform' :
                  r.name.includes('Media') || r.name.includes('Audio') ? 'Media' :
                  r.name.includes('File') || r.name.includes('Storage') || r.name.includes('Cache') || r.name.includes('IndexedDB') ? 'Storage' :
                  r.name.includes('Worker') || r.name.includes('Worker') ? 'Workers' :
                  r.name.includes('Bluetooth') || r.name.includes('HID') || r.name.includes('Serial') || r.name.includes('USB') || r.name.includes('MIDI') ? 'Device Access' :
                  r.name.includes('Sensor') || r.name.includes('Orientation') || r.name.includes('Motion') || r.name.includes('Geolocation') ? 'Sensors' :
                  r.name.includes('Crypto') || r.name.includes('Auth') || r.name.includes('Payment') ? 'Security' :
                  r.name.includes('Observer') || r.name.includes('Performance') || r.name.includes('Navigation') || r.name.includes('History') ? 'DOM & Navigation' :
                  r.name.includes('Canvas') || r.name.includes('Animation') || r.name.includes('Shadow') || r.name.includes('Custom') ? 'Graphics & Components' :
                  'Other';
    if (!groups[group]) groups[group] = [];
    groups[group].push(r);
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Web API Capability Matrix</h1>
        <p className="text-slate-400 text-sm">Comprehensive test of {total} Web Platform APIs.</p>
        <div className="flex items-center gap-3 mt-3">
          <div className="h-2 w-48 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(supported / total) * 100}%` }} />
          </div>
          <span className="text-sm text-slate-400">{supported}/{total} supported ({Math.round((supported / total) * 100)}%)</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search APIs..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'supported', 'unsupported'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* API Groups */}
      {Object.entries(groups).sort().map(([group, results]) => (
        <div key={group} className="mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Code2 size={14} className="text-indigo-400" />
            {group}
            <span className="text-xs text-slate-500">({results.filter(r => r.status === 'supported').length}/{results.length})</span>
          </h3>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(r => (
              <div
                key={r.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  r.status === 'supported'
                    ? 'bg-emerald-500/5 border-emerald-500/15 hover:border-emerald-500/30'
                    : 'bg-slate-800/20 border-slate-700/20 hover:border-slate-600/30'
                }`}
              >
                {r.status === 'supported' ? (
                  <Check size={14} className="text-emerald-400 shrink-0" />
                ) : (
                  <X size={14} className="text-slate-600 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs truncate ${r.status === 'supported' ? 'text-slate-200' : 'text-slate-500'}`}>
                    {r.name}
                  </div>
                  {r.description && (
                    <div className="text-[10px] text-slate-600 truncate">{r.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">No APIs match your filter.</div>
      )}
    </div>
  );
}

// ============ SECURITY PAGE ============
export function SecurityPage({ baseResults }: { baseResults: DiagnosticResult[] }) {
  const securityResults = baseResults.filter(r => r.category === 'security');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Security</h1>
        <p className="text-slate-400 text-sm">Security context and cryptographic capabilities.</p>
      </div>

      {/* Security Status */}
      <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            window.isSecureContext ? 'bg-emerald-500/20' : 'bg-red-500/20'
          }`}>
            {window.isSecureContext ? (
              <Shield size={20} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={20} className="text-red-400" />
            )}
          </div>
          <div>
            <h3 className={`text-sm font-medium ${window.isSecureContext ? 'text-emerald-300' : 'text-red-300'}`}>
              {window.isSecureContext ? 'Secure Context' : 'Not a Secure Context'}
            </h3>
            <p className="text-xs text-slate-400">
              {window.isSecureContext
                ? 'This page is served over HTTPS. Powerful web features are available.'
                : 'This page is not in a secure context. Some web features are restricted.'}
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {securityResults.map(r => (
            <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border ${
              r.status === 'available' || r.status === 'supported'
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-slate-800/30 border-slate-700/30'
            }`}>
              <div>
                <div className="text-sm text-slate-300">{r.name}</div>
                {r.description && <div className="text-[10px] text-slate-500 mt-0.5">{r.description}</div>}
              </div>
              <span className={`text-xs font-medium ${
                r.status === 'available' || r.status === 'supported' ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                {r.status === 'available' || r.status === 'supported' ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Educational */}
      <div className="space-y-3">
        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <h3 className="text-sm font-medium text-blue-300 mb-1">Transport Security vs. Overall Security</h3>
          <p className="text-xs text-slate-400">
            HTTPS provides <strong>transport security</strong> — data between your browser and the server is encrypted. 
            However, overall website security also depends on: Content Security Policy (CSP), proper CORS configuration, 
            secure cookie flags, HSTS headers, and more. A site can be HTTPS but still have security issues.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
          <h3 className="text-sm font-medium text-purple-300 mb-1">Cross-Origin Isolation</h3>
          <p className="text-xs text-slate-400">
            Cross-origin isolation (via COOP and COEP headers) enables powerful features like SharedArrayBuffer. 
            It prevents a document from sharing a browsing context group with cross-origin documents, 
            reducing side-channel attack surface.
            {window.crossOriginIsolated
              ? ' This page IS cross-origin isolated.'
              : ' This page is NOT cross-origin isolated.'}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <h3 className="text-sm font-medium text-emerald-300 mb-1">Web Crypto API</h3>
          <p className="text-xs text-slate-400">
            The Web Crypto API provides low-level cryptographic primitives directly in the browser. 
            It supports hashing (SHA-256, SHA-512), signing (HMAC, RSA-PSS, ECDSA), encryption (AES-GCM, AES-CBC), 
            and key derivation (PBKDF2, HKDF). All operations are performed securely without exposing key material.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <h3 className="text-sm font-medium text-amber-300 mb-1">WebAuthn</h3>
          <p className="text-xs text-slate-400">
            Web Authentication (WebAuthn) enables passwordless login using public-key cryptography. 
            It supports security keys (YubiKey), platform authenticators (Touch ID, Windows Hello), 
            and passkeys. {typeof PublicKeyCredential !== 'undefined'
              ? 'Your browser supports WebAuthn.'
              : 'Your browser does not appear to support WebAuthn.'}
          </p>
        </div>
      </div>
    </div>
  );
}
