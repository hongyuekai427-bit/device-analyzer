import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Mic, RefreshCw, AlertTriangle, Check, X, Volume2, Activity } from 'lucide-react';
import { DiagnosticResult } from '../types';
import { getMediaCodecDiagnostics } from '../diagnostics/engine';

// ============ CAMERA & MEDIA PAGE ============
export function CameraMediaPage({ baseResults }: { baseResults: DiagnosticResult[] }) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [testing, setTesting] = useState(false);
  const [cameraCapabilities, setCameraCapabilities] = useState<Record<string, any> | null>(null);
  const [micCapabilities, setMicCapabilities] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const codecResults = getMediaCodecDiagnostics();

  const testMediaDevices = async () => {
    setTesting(true);
    setError(null);
    try {
      // Request camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setPermissionState('granted');

      // Get devices
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceList);

      // Camera capabilities
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        setCameraCapabilities({
          label: videoTrack.label,
          settings: {
            width: settings.width,
            height: settings.height,
            frameRate: settings.frameRate,
            facingMode: settings.facingMode,
            deviceId: settings.deviceId?.substring(0, 8) + '...',
          },
          capabilities: {
            width: capabilities.width,
            height: capabilities.height,
            frameRate: capabilities.frameRate,
            facingMode: capabilities.facingMode,
            aspectRatio: capabilities.aspectRatio,
          },
        });
      }

      // Mic capabilities
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        const settings = audioTrack.getSettings();
        const capabilities = audioTrack.getCapabilities ? audioTrack.getCapabilities() : {};
        setMicCapabilities({
          label: audioTrack.label,
          settings: {
            sampleRate: settings.sampleRate || settings.echoCancellation,
            channelCount: settings.channelCount,
            echoCancellation: settings.echoCancellation,
            noiseSuppression: settings.noiseSuppression,
            autoGainControl: settings.autoGainControl,
          },
          capabilities: {
            sampleRate: capabilities.sampleRate,
            channelCount: capabilities.channelCount,
            echoCancellation: capabilities.echoCancellation,
            noiseSuppression: capabilities.noiseSuppression,
            latency: (capabilities as any).latency,
          },
        });
      }

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setPermissionState('denied');
        setError('Permission denied by user.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera or microphone found.');
      } else {
        setError(err.message || 'Failed to access media devices.');
      }
    } finally {
      setTesting(false);
    }
  };

  const enumerateWithoutPermission = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceList);
    } catch {}
  };

  useEffect(() => {
    enumerateWithoutPermission();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Camera & Microphone</h1>
        <p className="text-slate-400 text-sm">Media device capabilities and codec support.</p>
      </div>

      {/* Permission Notice */}
      <div className="mb-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-blue-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Privacy Notice</h3>
            <p className="text-xs text-slate-400">
              Testing camera and microphone requires your explicit permission. All data stays in your browser. 
              No audio or video is recorded or transmitted. Tracks are stopped immediately after testing.
            </p>
          </div>
        </div>
      </div>

      {/* Test Button */}
      <div className="mb-6">
        <button
          onClick={testMediaDevices}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-all disabled:opacity-50"
        >
          {testing ? <RefreshCw size={16} className="animate-spin" /> : <Camera size={16} />}
          <span>{testing ? 'Testing...' : 'Test Camera & Microphone'}</span>
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
        {permissionState === 'granted' && (
          <p className="mt-2 text-sm text-emerald-400 flex items-center gap-1">
            <Check size={14} /> Permission granted
          </p>
        )}
      </div>

      {/* Devices List */}
      {devices.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white mb-3">Enumerated Devices</h3>
          <div className="grid gap-2">
            {devices.map((device, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                {device.kind === 'videoinput' ? <Camera size={16} className="text-purple-400" /> :
                 device.kind === 'audioinput' ? <Mic size={16} className="text-blue-400" /> :
                 <Volume2 size={16} className="text-green-400" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-200 truncate">
                    {device.label || `${device.kind} (label hidden - grant permission to see)`}
                  </div>
                  <div className="text-xs text-slate-500">{device.kind}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Camera Capabilities */}
      {cameraCapabilities && (
        <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Camera size={16} className="text-purple-400" />
            <h3 className="text-sm font-medium text-white">Camera Capabilities</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(cameraCapabilities.settings).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-slate-200 font-mono text-xs">{value !== undefined ? String(value) : 'N/A'}</span>
              </div>
            ))}
          </div>
          {cameraCapabilities.capabilities && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="text-xs text-slate-500 mb-2">Supported Ranges</div>
              <div className="grid gap-1">
                {Object.entries(cameraCapabilities.capabilities).map(([key, value]) => (
                  <div key={key} className="text-xs text-slate-400">
                    <span className="text-slate-500">{key}:</span>{' '}
                    <span className="font-mono">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mic Capabilities */}
      {micCapabilities && (
        <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Mic size={16} className="text-blue-400" />
            <h3 className="text-sm font-medium text-white">Microphone Capabilities</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(micCapabilities.settings).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-slate-200 font-mono text-xs">{value !== undefined ? String(value) : 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supported Constraints */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white mb-3">Supported Constraints</h3>
        <div className="flex flex-wrap gap-2">
          {(() => {
            try {
              const constraints = navigator.mediaDevices.getSupportedConstraints();
              return Object.entries(constraints).filter(([, v]) => v).map(([key]) => (
                <span key={key} className="text-xs px-2 py-1 rounded bg-slate-800/50 border border-slate-700/30 text-slate-300 font-mono">
                  {key}
                </span>
              ));
            } catch {
              return <span className="text-sm text-slate-500">Unable to enumerate constraints</span>;
            }
          })()}
        </div>
      </div>

      {/* Media Codecs */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Video Codec Support</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {codecResults.map(r => (
            <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border ${
              r.status === 'supported' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
            }`}>
              <span className="text-sm text-slate-300">{r.name}</span>
              <span className={`text-xs font-medium ${r.status === 'supported' ? 'text-emerald-400' : 'text-red-400'}`}>
                {r.status === 'supported' ? '✓' : '✗'} {typeof r.value === 'string' ? r.value : r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ GAMEPAD PAGE ============
export function GamepadPage() {
  const [gamepads, setGamepads] = useState<(Gamepad | null)[]>([]);
  const [buttonStates, setButtonStates] = useState<Record<string, boolean[]>>({});
  const [axisValues, setAxisValues] = useState<Record<string, number[]>>({});
  const animRef = useRef<number>(0);

  const poll = useCallback(() => {
    const gps = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
    setGamepads(gps);
    
    const buttons: Record<string, boolean[]> = {};
    const axes: Record<string, number[]> = {};
    gps.forEach(gp => {
      if (gp) {
        buttons[gp.id] = gp.buttons.map(b => b.pressed);
        axes[gp.id] = Array.from(gp.axes);
      }
    });
    setButtonStates(buttons);
    setAxisValues(axes);
    animRef.current = requestAnimationFrame(poll);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (!animRef.current) {
        animRef.current = requestAnimationFrame(poll);
      }
    };
    window.addEventListener('gamepadconnected', handler);
    window.addEventListener('gamepaddisconnected', handler);
    
    // Initial poll
    poll();
    
    return () => {
      window.removeEventListener('gamepadconnected', handler);
      window.removeEventListener('gamepaddisconnected', handler);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [poll]);

  const connected = gamepads.filter(gp => gp !== null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Gamepad Tester</h1>
        <p className="text-slate-400 text-sm">Real-time game controller visualization.</p>
      </div>

      {connected.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
            <Activity size={32} className="text-slate-600" />
          </div>
          <p className="text-slate-400 text-sm mb-2">No gamepads detected</p>
          <p className="text-slate-500 text-xs">Connect a controller and press any button to activate it.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {connected.map(gp => gp && (
            <div key={gp.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-white">{gp.id}</h3>
                  <p className="text-xs text-slate-500">Mapping: {gp.mapping || 'standard'} • Index: {gp.index}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Connected</span>
              </div>

              {/* Buttons */}
              <div className="mb-4">
                <h4 className="text-xs text-slate-500 mb-2">Buttons ({gp.buttons.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {gp.buttons.map((btn, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono transition-all ${
                        buttonStates[gp.id]?.[i]
                          ? 'bg-indigo-500/30 border border-indigo-500/50 text-indigo-300'
                          : 'bg-slate-800 border border-slate-700/50 text-slate-600'
                      }`}
                      title={`Button ${i}: ${btn.value.toFixed(2)}`}
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </div>

              {/* Axes */}
              <div>
                <h4 className="text-xs text-slate-500 mb-2">Axes ({gp.axes.length})</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(axisValues[gp.id] || []).map((value, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-12">Axis {i}</span>
                      <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-1/2 w-px bg-slate-600" />
                        <div
                          className={`absolute inset-y-0 rounded-full transition-all ${
                            value >= 0 ? 'bg-indigo-500/50 left-1/2' : 'bg-purple-500/50 right-1/2'
                          }`}
                          style={{ width: `${Math.abs(value) * 50}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-400 w-14 text-right">{value.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vibration */}
              {gp.vibrationActuator && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <span className="text-xs text-emerald-400">✓ Vibration actuator supported</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ BATTERY PAGE ============
export function BatteryPage({ baseResults }: { baseResults: DiagnosticResult[] }) {
  const [battery, setBattery] = useState<any>(null);
  const [monitoring, setMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBattery = async () => {
    try {
      if (typeof (navigator as any).getBattery !== 'function') {
        setError('Battery Status API not available in this browser.');
        return;
      }
      const batt = await (navigator as any).getBattery();
      const update = () => {
        setBattery({
          level: Math.round(batt.level * 100),
          charging: batt.charging,
          chargingTime: batt.chargingTime === Infinity ? '∞' : `${Math.round(batt.chargingTime / 60)} min`,
          dischargingTime: batt.dischargingTime === Infinity ? '∞' : `${Math.round(batt.dischargingTime / 60)} min`,
        });
      };
      update();
      
      if (monitoring) {
        batt.addEventListener('chargingchange', update);
        batt.addEventListener('levelchange', update);
        batt.addEventListener('chargingtimechange', update);
        batt.addEventListener('dischargingtimechange', update);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get battery info.');
    }
  };

  useEffect(() => {
    checkBattery();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Battery Status</h1>
        <p className="text-slate-400 text-sm">Battery information where available.</p>
      </div>

      {error ? (
        <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
          <p className="text-xs text-slate-500 mt-2">
            Many browsers have removed the Battery Status API for privacy reasons, as it can be used for fingerprinting.
          </p>
        </div>
      ) : battery ? (
        <div className="space-y-4">
          {/* Battery Level */}
          <div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
            <div className="text-5xl font-bold text-white mb-2">{battery.level}%</div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className={`h-full rounded-full transition-all ${
                  battery.level > 50 ? 'bg-emerald-500' : battery.level > 20 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${battery.level}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              {battery.charging ? (
                <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ⚡ Charging
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded bg-slate-700/50 text-slate-400 border border-slate-600/30">
                  On Battery
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <div className="text-xs text-slate-500 mb-1">Charging Time</div>
              <div className="text-sm font-medium text-slate-200">{battery.chargingTime}</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <div className="text-xs text-slate-500 mb-1">Discharging Time</div>
              <div className="text-sm font-medium text-slate-200">{battery.dischargingTime}</div>
            </div>
          </div>

          <button
            onClick={() => setMonitoring(!monitoring)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 hover:bg-slate-800 transition-all"
          >
            <RefreshCw size={14} className={monitoring ? 'animate-spin' : ''} />
            <span>{monitoring ? 'Stop Monitoring' : 'Enable Live Monitoring'}</span>
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">Loading battery information...</p>
        </div>
      )}
    </div>
  );
}

// ============ PERFORMANCE BENCHMARK PAGE ============
export function PerformanceBenchmarkPage({ baseResults }: { baseResults: DiagnosticResult[] }) {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [cancelled, setCancelled] = useState(false);

  const runBenchmark = async () => {
    setRunning(true);
    setResults(null);
    setCancelled(false);

    const benchResults: Record<string, number> = {};

    // Arithmetic benchmark
    const arithStart = performance.now();
    let sum = 0;
    for (let i = 0; i < 10000000; i++) {
      sum += Math.sqrt(i) * Math.sin(i);
    }
    benchResults['Arithmetic (10M ops)'] = Math.round(performance.now() - arithStart);

    if (cancelled) { setRunning(false); return; }

    // String processing
    const strStart = performance.now();
    let str = '';
    for (let i = 0; i < 100000; i++) {
      str += 'a';
      if (str.length > 1000) str = str.slice(-500);
    }
    benchResults['String Processing (100K ops)'] = Math.round(performance.now() - strStart);

    if (cancelled) { setRunning(false); return; }

    // JSON parsing
    const jsonStart = performance.now();
    const jsonData = JSON.stringify({ data: Array.from({ length: 10000 }, (_, i) => ({ id: i, value: Math.random() })) });
    for (let i = 0; i < 100; i++) {
      JSON.parse(jsonData);
    }
    benchResults['JSON Parse (100 × 10K)'] = Math.round(performance.now() - jsonStart);

    if (cancelled) { setRunning(false); return; }

    // Array operations
    const arrStart = performance.now();
    const arr = Array.from({ length: 1000000 }, () => Math.random());
    arr.sort((a, b) => a - b);
    arr.reduce((a, b) => a + b, 0);
    benchResults['Array Sort+Reduce (1M)'] = Math.round(performance.now() - arrStart);

    if (cancelled) { setRunning(false); return; }

    // Crypto
    if (crypto.subtle) {
      const cryptoStart = performance.now();
      const data = new TextEncoder().encode('benchmark-data-' + 'x'.repeat(1000));
      for (let i = 0; i < 100; i++) {
        await crypto.subtle.digest('SHA-256', data);
      }
      benchResults['SHA-256 Hash (100 × 1KB)'] = Math.round(performance.now() - cryptoStart);
    }

    setResults(benchResults);
    setRunning(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Performance Benchmarks</h1>
        <p className="text-slate-400 text-sm">Optional client-side benchmarks. Results vary based on current system load.</p>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-300 mb-1">Notice</h3>
            <p className="text-xs text-slate-400">
              These benchmarks temporarily increase CPU usage. Results are relative and affected by browser state, 
              extensions, thermal throttling, and background processes. They do NOT identify your CPU model.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={runBenchmark}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-all disabled:opacity-50"
        >
          <Activity size={16} className={running ? 'animate-pulse' : ''} />
          <span>{running ? 'Running...' : 'Run Benchmarks'}</span>
        </button>
        {running && (
          <button
            onClick={() => setCancelled(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all"
          >
            <X size={16} />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Base Performance Metrics */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white mb-3">Navigation Timing</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {baseResults.filter(r => r.category === 'performance' && r.source?.includes('PerformanceNavigationTiming')).map(r => (
            <div key={r.id} className="flex justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <span className="text-sm text-slate-400">{r.name}</span>
              <span className="text-sm font-mono text-slate-200">{String(r.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark Results */}
      {results && (
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Benchmark Results</h3>
          <div className="space-y-3">
            {Object.entries(results).map(([name, time]) => {
              const maxTime = Math.max(...Object.values(results));
              const percentage = (time / maxTime) * 100;
              return (
                <div key={name} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-slate-300">{name}</span>
                    <span className="text-sm font-mono text-indigo-400">{time} ms</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Lower is better. Results are relative to your current system state.
          </p>
        </div>
      )}
    </div>
  );
}
