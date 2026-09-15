import { useState, useEffect } from 'react';
import {
  Shield, MapPin, Wifi, RefreshCw, Check, X, AlertTriangle,
  Camera, Mic, Bell, Clipboard, Navigation, Bluetooth, Usb,
  Fingerprint, Eye, EyeOff
} from 'lucide-react';
import { DiagnosticResult, DiagnosticStatus } from '../types';

// ============ PERMISSIONS CENTER ============
export function PermissionsCenter({ baseResults }: { baseResults: DiagnosticResult[] }) {
  const [permissions, setPermissions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const permissionList = [
    { name: 'geolocation', label: 'Geolocation', icon: MapPin, desc: 'Access to device location' },
    { name: 'camera', label: 'Camera', icon: Camera, desc: 'Access to camera device' },
    { name: 'microphone', label: 'Microphone', icon: Mic, desc: 'Access to microphone' },
    { name: 'notifications', label: 'Notifications', icon: Bell, desc: 'Show system notifications' },
    { name: 'clipboard-read', label: 'Clipboard Read', icon: Clipboard, desc: 'Read from clipboard' },
    { name: 'clipboard-write', label: 'Clipboard Write', icon: Clipboard, desc: 'Write to clipboard' },
    { name: 'persistent-storage', label: 'Persistent Storage', icon: Shield, desc: 'Prevent storage eviction' },
    { name: 'accelerometer', label: 'Accelerometer', icon: Navigation, desc: 'Device acceleration sensor' },
    { name: 'gyroscope', label: 'Gyroscope', icon: Navigation, desc: 'Device rotation sensor' },
    { name: 'magnetometer', label: 'Magnetometer', icon: Navigation, desc: 'Magnetic field sensor' },
  ];

  useEffect(() => {
    const query = async () => {
      setLoading(true);
      const results: Record<string, string> = {};

      if (!navigator.permissions) {
        permissionList.forEach(p => { results[p.name] = 'unsupported'; });
        setPermissions(results);
        setLoading(false);
        return;
      }

      for (const perm of permissionList) {
        try {
          const status = await navigator.permissions.query({ name: perm.name as PermissionName });
          results[perm.name] = status.state;
        } catch {
          results[perm.name] = 'unsupported';
        }
      }

      setPermissions(results);
      setLoading(false);
    };

    query();
  }, []);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'granted': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'denied': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'prompt': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'unsupported': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Permissions Center</h1>
        <p className="text-slate-400 text-sm">Current permission states. This page does NOT request any permissions.</p>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-blue-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">How Permissions Work</h3>
            <p className="text-xs text-slate-400">
              <strong>Granted:</strong> Already allowed. <strong>Prompt:</strong> Will ask when needed. <strong>Denied:</strong> Blocked. 
              <strong> Unsupported:</strong> Browser doesn't support querying this permission.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <RefreshCw size={14} className="animate-spin" />
          <span>Querying permissions...</span>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {permissionList.map(perm => {
            const state = permissions[perm.name] || 'unknown';
            const Icon = perm.icon;
            return (
              <div key={perm.name} className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <Icon size={18} className="text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200">{perm.label}</div>
                  <div className="text-xs text-slate-500">{perm.desc}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded border font-medium capitalize ${getStateColor(state)}`}>
                  {state}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ LOCATION PAGE ============
export function LocationPage() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('unknown');

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(status => {
        setPermissionState(status.state);
      }).catch(() => {});
    }
  }, []);

  const testLocation = () => {
    setLoading(true);
    setError(null);
    setLocation(null);

    if (!navigator.geolocation) {
      setError('Geolocation API not available in this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos);
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied by user.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError(err.message || 'Unknown error.');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Location</h1>
        <p className="text-slate-400 text-sm">Geolocation testing. Location data stays in your browser.</p>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-300 mb-1">Sensitive Data</h3>
            <p className="text-xs text-slate-400">
              Location is highly sensitive personal data. This test requires your explicit permission. 
              Your location is NOT stored, transmitted, or shared. You can clear the result at any time.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs text-slate-500">Permission: <span className="capitalize text-slate-300">{permissionState}</span></span>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={testLocation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-all disabled:opacity-50"
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <MapPin size={16} />}
          <span>{loading ? 'Getting Location...' : 'Test Location'}</span>
        </button>
        {location && (
          <button
            onClick={clearLocation}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all"
          >
            <X size={16} />
            <span>Clear Result</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {location && (
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <h3 className="text-sm font-medium text-white mb-3">Location Result</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Latitude</div>
              <div className="text-sm font-mono text-slate-200">{location.coords.latitude.toFixed(6)}°</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Longitude</div>
              <div className="text-sm font-mono text-slate-200">{location.coords.longitude.toFixed(6)}°</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Accuracy</div>
              <div className="text-sm font-mono text-slate-200">±{location.coords.accuracy.toFixed(0)} m</div>
            </div>
            {location.coords.altitude !== null && (
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Altitude</div>
                <div className="text-sm font-mono text-slate-200">{location.coords.altitude?.toFixed(1)} m</div>
              </div>
            )}
            {location.coords.altitudeAccuracy !== null && (
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Altitude Accuracy</div>
                <div className="text-sm font-mono text-slate-200">±{location.coords.altitudeAccuracy?.toFixed(0)} m</div>
              </div>
            )}
            {location.coords.heading !== null && (
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Heading</div>
                <div className="text-sm font-mono text-slate-200">{location.coords.heading?.toFixed(1)}°</div>
              </div>
            )}
            {location.coords.speed !== null && (
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Speed</div>
                <div className="text-sm font-mono text-slate-200">{location.coords.speed?.toFixed(2)} m/s</div>
              </div>
            )}
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Timestamp</div>
              <div className="text-sm font-mono text-slate-200">{new Date(location.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ NETWORK PAGE ============
export function NetworkPage({ baseResults }: { baseResults: DiagnosticResult[] }) {
  const [latency, setLatency] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);
  const [latencies, setLatencies] = useState<number[]>([]);

  const testLatency = async () => {
    setTesting(true);
    const newLatencies: number[] = [];

    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      try {
        await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
        const elapsed = performance.now() - start;
        newLatencies.push(Math.round(elapsed));
      } catch {
        newLatencies.push(-1);
      }
    }

    setLatencies(newLatencies);
    const valid = newLatencies.filter(l => l >= 0);
    if (valid.length > 0) {
      setLatency(Math.round(valid.reduce((a, b) => a + b, 0) / valid.length));
    }
    setTesting(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Network</h1>
        <p className="text-slate-400 text-sm">Network information and connectivity tests.</p>
      </div>

      {/* Base results */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {baseResults.filter(r => r.category === 'network').map(r => (
          <div key={r.id} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <div className="text-xs text-slate-500 mb-0.5">{r.name}</div>
            <div className="text-sm font-medium text-slate-200">
              {typeof r.value === 'boolean' ? (r.value ? 'Yes' : 'No') : String(r.value)}
            </div>
            {r.isEstimate && (
              <span className="text-[10px] text-amber-400">Estimate</span>
            )}
          </div>
        ))}
      </div>

      {/* Latency test */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-white">Connection Latency Test</h3>
            <p className="text-xs text-slate-500 mt-0.5">Measures round-trip time to this website. Not a general internet speed test.</p>
          </div>
          <button
            onClick={testLatency}
            disabled={testing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-all disabled:opacity-50"
          >
            <Wifi size={14} className={testing ? 'animate-pulse' : ''} />
            <span>{testing ? 'Testing...' : 'Test'}</span>
          </button>
        </div>

        {latency !== null && (
          <div className="mt-3">
            <div className="text-3xl font-bold text-white mb-1">{latency} <span className="text-lg text-slate-400">ms</span></div>
            <div className="text-xs text-slate-500">Average of {latencies.filter(l => l >= 0).length} requests to this origin</div>
            <div className="flex gap-1 mt-2">
              {latencies.map((l, i) => (
                <div key={i} className={`text-xs px-2 py-1 rounded ${l >= 0 ? 'bg-slate-700/50 text-slate-300' : 'bg-red-500/10 text-red-400'}`}>
                  {l >= 0 ? `${l}ms` : 'fail'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Connection quality */}
      <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
        <h3 className="text-sm font-medium text-white mb-2">Connection Quality Guide</h3>
        <div className="space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;50ms: Excellent</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /> 50-100ms: Good</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> 100-200ms: Fair</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500" /> 200-500ms: Poor</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> &gt;500ms: Very Poor</div>
        </div>
      </div>
    </div>
  );
}

// ============ SENSORS PAGE ============
export function SensorsPage({ baseResults }: { baseResults: DiagnosticResult[] }) {
  const [orientation, setOrientation] = useState<{ alpha: number; beta: number; gamma: number } | null>(null);
  const [motion, setMotion] = useState<{ x: number; y: number; z: number } | null>(null);
  const [monitoring, setMonitoring] = useState(false);

  const startMonitoring = () => {
    setMonitoring(true);

    const handleOrientation = (e: DeviceOrientationEvent) => {
      setOrientation({
        alpha: e.alpha || 0,
        beta: e.beta || 0,
        gamma: e.gamma || 0,
      });
    };

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (acc) {
        setMotion({ x: acc.x || 0, y: acc.y || 0, z: acc.z || 0 });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  };

  const stopMonitoring = () => {
    setMonitoring(false);
    setOrientation(null);
    setMotion(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Sensors</h1>
        <p className="text-slate-400 text-sm">Device sensor availability and live testing.</p>
      </div>

      {/* Sensor availability */}
      <div className="mb-6 grid gap-2 sm:grid-cols-2">
        {baseResults.filter(r => r.category === 'sensors').map(r => (
          <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border ${
            r.status === 'supported' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/30 border-slate-700/30'
          }`}>
            <span className="text-sm text-slate-300">{r.name}</span>
            <span className={`text-xs font-medium ${r.status === 'supported' ? 'text-emerald-400' : 'text-slate-500'}`}>
              {r.status === 'supported' ? '✓ Available' : '✗ Unavailable'}
            </span>
          </div>
        ))}
      </div>

      {/* Live test */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-white">Live Sensor Test</h3>
            <p className="text-xs text-slate-500 mt-0.5">Requires a device with sensors (phone/tablet). Data stays local.</p>
          </div>
          <button
            onClick={monitoring ? stopMonitoring : startMonitoring}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
              monitoring
                ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
            }`}
          >
            {monitoring ? <X size={14} /> : <Navigation size={14} />}
            <span>{monitoring ? 'Stop' : 'Start'}</span>
          </button>
        </div>

        {monitoring && (
          <div className="grid gap-4 sm:grid-cols-2">
            {orientation && (
              <div>
                <h4 className="text-xs text-slate-500 mb-2">Device Orientation</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Alpha (Z-axis)</span>
                    <span className="font-mono text-slate-200">{orientation.alpha.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Beta (X-axis)</span>
                    <span className="font-mono text-slate-200">{orientation.beta.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Gamma (Y-axis)</span>
                    <span className="font-mono text-slate-200">{orientation.gamma.toFixed(1)}°</span>
                  </div>
                </div>
              </div>
            )}
            {motion && (
              <div>
                <h4 className="text-xs text-slate-500 mb-2">Acceleration (m/s²)</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">X</span>
                    <span className="font-mono text-slate-200">{motion.x.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Y</span>
                    <span className="font-mono text-slate-200">{motion.y.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Z</span>
                    <span className="font-mono text-slate-200">{motion.z.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            {!orientation && !motion && (
              <p className="text-sm text-slate-500">Waiting for sensor data... Move your device.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
