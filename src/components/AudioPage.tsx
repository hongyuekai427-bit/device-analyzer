import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, Mic, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import { DiagnosticResult } from '../types';
import { getAudioDiagnostics } from '../diagnostics/engine';

export function AudioPage({ baseResults }: { baseResults: DiagnosticResult[] }) {
  const [micTesting, setMicTesting] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [clipping, setClipping] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [micInfo, setMicInfo] = useState<Record<string, any> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number>(0);
  const audioResults = getAudioDiagnostics();

  const stopMicTest = useCallback(() => {
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
    }
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }
    setMicStream(null);
    setMicTesting(false);
    setMicLevel(0);
    setPeakLevel(0);
    setClipping(false);
    setMicInfo(null);
  }, [micStream]);

  const startMicTest = async () => {
    setMicTesting(true);
    setMicError(null);
    setPeakLevel(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Get track info
      const track = stream.getAudioTracks()[0];
      if (track) {
        const settings = track.getSettings();
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        setMicInfo({
          label: track.label,
          sampleRate: settings.sampleRate || audioContext.sampleRate,
          channelCount: settings.channelCount || 1,
          echoCancellation: settings.echoCancellation,
          noiseSuppression: settings.noiseSuppression,
          autoGainControl: settings.autoGainControl,
          capabilities,
        });
      }

      // Monitor levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let peak = 0;

      const monitor = () => {
        analyser.getByteTimeDomainData(dataArray);
        
        let sum = 0;
        let max = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = (dataArray[i] - 128) / 128;
          sum += val * val;
          max = Math.max(max, Math.abs(val));
        }
        
        const rms = Math.sqrt(sum / dataArray.length);
        const level = Math.min(rms * 3, 1);
        peak = Math.max(peak, max);
        
        setMicLevel(level);
        setPeakLevel(peak);
        setClipping(max > 0.98);
        
        animRef.current = requestAnimationFrame(monitor);
      };
      
      monitor();
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setMicError('Microphone permission denied.');
      } else {
        setMicError(err.message || 'Failed to access microphone.');
      }
      setMicTesting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Audio</h1>
        <p className="text-slate-400 text-sm">Audio capabilities, codec support, and microphone testing.</p>
      </div>

      {/* Audio API Results */}
      <div className="mb-6 grid gap-2 sm:grid-cols-2">
        {audioResults.filter(r => !r.name.startsWith('Audio Codec')).map(r => (
          <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border ${
            r.status === 'supported' || r.status === 'available'
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : 'bg-slate-800/30 border-slate-700/30'
          }`}>
            <span className="text-sm text-slate-300">{r.name}</span>
            <span className={`text-xs font-mono ${
              r.status === 'supported' || r.status === 'available' ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              {typeof r.value === 'boolean' ? (r.value ? 'Yes' : 'No') : String(r.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Codec Support */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white mb-3">Audio Codec Support</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {audioResults.filter(r => r.name.startsWith('Audio Codec')).map(r => (
            <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border ${
              r.status === 'supported' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
            }`}>
              <span className="text-sm text-slate-300">{r.name}</span>
              <span className={`text-xs font-medium ${r.status === 'supported' ? 'text-emerald-400' : 'text-red-400'}`}>
                {r.status === 'supported' ? '✓' : '✗'} {typeof r.value === 'string' && r.value !== 'supported' ? r.value : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Microphone Test */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Mic size={16} className="text-blue-400" />
              Microphone Test
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Test microphone input. All data stays local. No recording.</p>
          </div>
          <div className="flex gap-2">
            {micTesting ? (
              <button
                onClick={stopMicTest}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={startMicTest}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm"
              >
                <Mic size={14} />
                Test Microphone
              </button>
            )}
          </div>
        </div>

        {micError && (
          <div className="mb-3 p-3 rounded bg-red-500/5 border border-red-500/20">
            <p className="text-xs text-red-400">{micError}</p>
          </div>
        )}

        {micTesting && (
          <div className="space-y-4">
            {/* Level Meter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">Input Level (RMS)</span>
                <span className="text-xs font-mono text-slate-400">{(micLevel * 100).toFixed(1)}%</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    clipping ? 'bg-red-500' : micLevel > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${micLevel * 100}%` }}
                />
                {/* Clipping indicator */}
                <div className="absolute right-0 top-0 bottom-0 w-px bg-white/20" />
              </div>
              {clipping && (
                <p className="text-xs text-red-400 mt-1">⚠ Clipping detected — reduce input volume</p>
              )}
            </div>

            {/* Peak */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">Peak Level</span>
                <span className="text-xs font-mono text-slate-400">{(peakLevel * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${peakLevel * 100}%` }}
                />
              </div>
            </div>

            {/* Mic Info */}
            {micInfo && (
              <div className="pt-3 border-t border-slate-700/50">
                <h4 className="text-xs text-slate-500 mb-2">Microphone Details</h4>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Label</span>
                    <span className="text-slate-300 font-mono truncate ml-2 max-w-[200px]">{micInfo.label || 'Hidden'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Sample Rate</span>
                    <span className="text-slate-300 font-mono">{micInfo.sampleRate} Hz</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Channels</span>
                    <span className="text-slate-300 font-mono">{micInfo.channelCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Echo Cancellation</span>
                    <span className="text-slate-300 font-mono">{micInfo.echoCancellation ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Noise Suppression</span>
                    <span className="text-slate-300 font-mono">{micInfo.noiseSuppression ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Auto Gain Control</span>
                    <span className="text-slate-300 font-mono">{micInfo.autoGainControl ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
