import { DiagnosticResult, DiagnosticCategory, DiagnosticStatus } from '../types';

function safeRun<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

function result(
  id: string,
  category: DiagnosticCategory,
  name: string,
  value: unknown,
  status: DiagnosticStatus,
  extra?: Partial<DiagnosticResult>
): DiagnosticResult {
  return { id, category, name, value, status, ...extra };
}

// ============ BROWSER DIAGNOSTICS ============
export function getBrowserDiagnostics(): DiagnosticResult[] {
  const nav = navigator;
  const results: DiagnosticResult[] = [];

  results.push(result('browser-ua', 'browser', 'User Agent', nav.userAgent, 'available', { source: 'navigator.userAgent', description: 'Full user agent string. Modern browsers increasingly reduce this information for privacy.' }));
  
  const uaData = safeRun(() => (nav as any).userAgentData, null);
  if (uaData) {
    results.push(result('browser-brands', 'browser', 'UA Client Hints - Brands', uaData.brands?.map((b: any) => `${b.brand} ${b.version}`).join(', '), 'available', { source: 'navigator.userAgentData.brands' }));
    results.push(result('browser-mobile', 'browser', 'Mobile', uaData.mobile, 'available', { source: 'navigator.userAgentData.mobile' }));
    results.push(result('browser-platform-hint', 'browser', 'Platform (Client Hints)', uaData.platform, 'available', { source: 'navigator.userAgentData.platform' }));
  } else {
    results.push(result('browser-brands', 'browser', 'UA Client Hints', null, 'unsupported', { description: 'User-Agent Client Hints API not available in this browser.' }));
  }

  results.push(result('browser-platform', 'browser', 'Platform', nav.platform, nav.platform ? 'available' : 'unsupported', { source: 'navigator.platform', description: 'Deprecated in modern browsers. May return generic values.' }));
  results.push(result('browser-vendor', 'browser', 'Vendor', nav.vendor, nav.vendor ? 'available' : 'unsupported', { source: 'navigator.vendor' }));
  results.push(result('browser-language', 'browser', 'Language', nav.language, 'available', { source: 'navigator.language' }));
  results.push(result('browser-languages', 'browser', 'Languages', nav.languages?.join(', '), 'available', { source: 'navigator.languages' }));
  results.push(result('browser-online', 'browser', 'Online', nav.onLine, 'available', { source: 'navigator.onLine' }));
  results.push(result('browser-cookies', 'browser', 'Cookies Enabled', nav.cookieEnabled, 'available', { source: 'navigator.cookieEnabled' }));
  results.push(result('browser-dnt', 'browser', 'Do Not Track', nav.doNotTrack, nav.doNotTrack ? 'available' : 'unknown', { source: 'navigator.doNotTrack', description: 'Deprecated signal. Many browsers ignore this.' }));
  results.push(result('browser-gpc', 'browser', 'Global Privacy Control', (nav as any).globalPrivacyControl, (nav as any).globalPrivacyControl !== undefined ? 'available' : 'unsupported', { source: 'navigator.globalPrivacyControl' }));
  results.push(result('browser-touch', 'browser', 'Max Touch Points', nav.maxTouchPoints, 'available', { source: 'navigator.maxTouchPoints' }));
  results.push(result('browser-pdf', 'browser', 'PDF Viewer Enabled', (nav as any).pdfViewerEnabled, (nav as any).pdfViewerEnabled !== undefined ? 'available' : 'unknown', { source: 'navigator.pdfViewerEnabled' }));
  results.push(result('browser-webdriver', 'browser', 'WebDriver (Automation)', (nav as any).webdriver, 'available', { source: 'navigator.webdriver', description: 'Indicates if browser is controlled by automation. False for normal browsing.' }));
  results.push(result('browser-product', 'browser', 'Product', nav.product, 'available', { source: 'navigator.product' }));
  results.push(result('browser-appname', 'browser', 'App Name', nav.appName, 'available', { source: 'navigator.appName', description: 'Deprecated. Always returns "Netscape" in modern browsers.' }));
  results.push(result('browser-appversion', 'browser', 'App Version', nav.appVersion, 'available', { source: 'navigator.appVersion', description: 'Deprecated. Use User-Agent Client Hints instead.' }));

  return results;
}

// ============ SYSTEM DIAGNOSTICS ============
export function getSystemDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  const nav = navigator;

  results.push(result('sys-platform', 'system', 'Platform', nav.platform, nav.platform ? 'available' : 'unsupported', { source: 'navigator.platform', description: 'May be frozen or generic for privacy reasons.' }));

  const uaData = safeRun(() => (nav as any).userAgentData, null);
  if (uaData) {
    results.push(result('sys-ua-platform', 'system', 'OS Platform (Hints)', uaData.platform, 'available', { source: 'navigator.userAgentData.platform' }));
  }

  const isMobile = nav.userAgent.includes('Mobile') || nav.userAgent.includes('Android') || nav.userAgent.includes('iPhone');
  results.push(result('sys-mobile', 'system', 'Mobile Device', isMobile, 'available', { confidence: 'medium', description: 'Inferred from user agent string. Not guaranteed accurate.' }));

  // Device classification
  let deviceType = 'Desktop';
  if (isMobile) deviceType = 'Mobile';
  else if (nav.maxTouchPoints > 0 && nav.maxTouchPoints <= 10) deviceType = 'Tablet/Laptop';
  else if (nav.maxTouchPoints > 10) deviceType = 'Touch Device';
  
  results.push(result('sys-device-type', 'system', 'Device Classification', deviceType, 'available', { confidence: 'medium', description: 'Classification based on browser-exposed capabilities. Not guaranteed accurate.' }));

  // Timezone
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  results.push(result('sys-timezone', 'system', 'Timezone', tz, 'available', { source: 'Intl.DateTimeFormat().resolvedOptions().timeZone' }));
  results.push(result('sys-tz-offset', 'system', 'Timezone Offset', `${new Date().getTimezoneOffset()} minutes`, 'available', { description: 'Offset from UTC in minutes.' }));
  
  // Locale
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  results.push(result('sys-locale', 'system', 'Locale', locale, 'available', { source: 'Intl.DateTimeFormat().resolvedOptions().locale' }));
  results.push(result('sys-calendar', 'system', 'Calendar', Intl.DateTimeFormat().resolvedOptions().calendar, 'available', { source: 'Intl.DateTimeFormat().resolvedOptions().calendar' }));
  results.push(result('sys-numbering', 'system', 'Numbering System', Intl.DateTimeFormat().resolvedOptions().numberingSystem, 'available', { source: 'Intl.DateTimeFormat().resolvedOptions().numberingSystem' }));

  return results;
}

// ============ DISPLAY DIAGNOSTICS ============
export function getDisplayDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  const screen = window.screen;

  results.push(result('display-screen-w', 'display', 'Screen Width', `${screen.width}px`, 'available', { source: 'window.screen.width' }));
  results.push(result('display-screen-h', 'display', 'Screen Height', `${screen.height}px`, 'available', { source: 'window.screen.height' }));
  results.push(result('display-avail-w', 'display', 'Available Width', `${screen.availWidth}px`, 'available', { source: 'window.screen.availWidth', description: 'Screen width minus taskbar/dock.' }));
  results.push(result('display-avail-h', 'display', 'Available Height', `${screen.availHeight}px`, 'available', { source: 'window.screen.availHeight' }));
  results.push(result('display-color-depth', 'display', 'Color Depth', `${screen.colorDepth}-bit`, 'available', { source: 'window.screen.colorDepth' }));
  results.push(result('display-pixel-depth', 'display', 'Pixel Depth', `${screen.pixelDepth}-bit`, 'available', { source: 'window.screen.pixelDepth' }));
  results.push(result('display-dpr', 'display', 'Device Pixel Ratio', window.devicePixelRatio, 'available', { source: 'window.devicePixelRatio', description: 'Ratio between physical pixels and CSS pixels. Higher values indicate high-DPI/Retina displays.' }));
  results.push(result('display-viewport-w', 'display', 'Viewport Width', `${window.innerWidth}px`, 'available', { source: 'window.innerWidth' }));
  results.push(result('display-viewport-h', 'display', 'Viewport Height', `${window.innerHeight}px`, 'available', { source: 'window.innerHeight' }));
  results.push(result('display-outer-w', 'display', 'Outer Width', `${window.outerWidth}px`, 'available', { source: 'window.outerWidth' }));
  results.push(result('display-outer-h', 'display', 'Outer Height', `${window.outerHeight}px`, 'available', { source: 'window.outerHeight' }));

  // Orientation
  const orientation = safeRun(() => screen.orientation?.type, null);
  results.push(result('display-orientation', 'display', 'Screen Orientation', orientation || 'unknown', orientation ? 'available' : 'unknown', { source: 'screen.orientation.type' }));

  // Visual viewport
  const vv = (window as any).visualViewport;
  if (vv) {
    results.push(result('display-vv-w', 'display', 'Visual Viewport Width', `${vv.width}px`, 'available', { source: 'visualViewport.width' }));
    results.push(result('display-vv-h', 'display', 'Visual Viewport Height', `${vv.height}px`, 'available', { source: 'visualViewport.height' }));
    results.push(result('display-vv-scale', 'display', 'Visual Viewport Scale', vv.scale, 'available', { source: 'visualViewport.scale' }));
  }

  // Media queries
  const queries: [string, string][] = [
    ['(prefers-color-scheme: dark)', 'prefers-color-scheme'],
    ['(prefers-reduced-motion: reduce)', 'prefers-reduced-motion'],
    ['(prefers-contrast: more)', 'prefers-contrast'],
    ['(forced-colors: active)', 'forced-colors'],
    ['(inverted-colors: inverted)', 'inverted-colors'],
    ['(dynamic-range: high)', 'dynamic-range (HDR)'],
    ['(color-gamut: p3)', 'color-gamut (P3)'],
    ['(color-gamut: rec2020)', 'color-gamut (Rec2020)'],
    ['(pointer: fine)', 'pointer (fine)'],
    ['(pointer: coarse)', 'pointer (coarse)'],
    ['(hover: hover)', 'hover (hover)'],
    ['(any-pointer: fine)', 'any-pointer (fine)'],
    ['(orientation: portrait)', 'orientation (portrait)'],
  ];

  queries.forEach(([mq, label]) => {
    const matches = safeRun(() => window.matchMedia(mq).matches, false);
    results.push(result(`display-mq-${label}`, 'display', `Media Query: ${label}`, matches ? 'Matches' : 'No match', 'available', { source: `matchMedia('${mq}')` }));
  });

  // Fullscreen
  results.push(result('display-fullscreen', 'display', 'Fullscreen API', !!document.fullscreenEnabled, document.fullscreenEnabled ? 'supported' : 'unsupported', { source: 'document.fullscreenEnabled' }));

  return results;
}

// ============ CPU & MEMORY DIAGNOSTICS ============
export function getCpuMemoryDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  const nav = navigator;

  results.push(result('cpu-cores', 'cpu-memory', 'Logical Processors', nav.hardwareConcurrency, nav.hardwareConcurrency ? 'available' : 'unsupported', { source: 'navigator.hardwareConcurrency', description: 'Approximate number of logical CPU cores available to the browser. This is an estimate and may not reflect physical cores.', isEstimate: true }));
  
  const devMem = (nav as any).deviceMemory;
  results.push(result('cpu-device-memory', 'cpu-memory', 'Device Memory (Estimate)', devMem ? `${devMem} GB` : null, devMem ? 'available' : 'unsupported', { source: 'navigator.deviceMemory', description: 'Approximate device memory in GB. This is a privacy-reduced value that may be rounded. Not exact RAM.', isEstimate: true, privacyNote: 'This is a coarse-grained estimate, not exact hardware information.' }));

  // Worker support
  results.push(result('cpu-web-workers', 'cpu-memory', 'Web Workers', typeof Worker !== 'undefined', typeof Worker !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof Worker' }));
  results.push(result('cpu-shared-workers', 'cpu-memory', 'Shared Workers', typeof SharedWorker !== 'undefined', typeof SharedWorker !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof SharedWorker' }));
  results.push(result('cpu-service-workers', 'cpu-memory', 'Service Workers', 'serviceWorker' in navigator, 'serviceWorker' in navigator ? 'supported' : 'unsupported', { source: 'navigator.serviceWorker' }));
  
  // WASM
  results.push(result('cpu-wasm', 'cpu-memory', 'WebAssembly', typeof WebAssembly !== 'undefined', typeof WebAssembly !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof WebAssembly' }));
  
  // SharedArrayBuffer
  results.push(result('cpu-sab', 'cpu-memory', 'SharedArrayBuffer', typeof SharedArrayBuffer !== 'undefined', typeof SharedArrayBuffer !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof SharedArrayBuffer', description: 'Requires cross-origin isolation (COOP/COEP headers).' }));

  // Storage estimate
  if (navigator.storage?.estimate) {
    navigator.storage.estimate().then(est => {
      // This will be handled asynchronously
    }).catch(() => {});
  }

  results.push(result('cpu-limitations', 'cpu-memory', 'Browser Limitations', 'Browsers intentionally limit hardware information for privacy. Exact CPU model, clock speed, temperature, and motherboard cannot be determined.', 'available', { description: 'Web browsers restrict access to detailed hardware information to prevent fingerprinting.' }));

  return results;
}

// ============ GRAPHICS DIAGNOSTICS ============
export function getGraphicsDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  // WebGL
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  if (gl) {
    const isWebGL2 = gl instanceof WebGL2RenderingContext;
    results.push(result('gpu-webgl', 'graphics', 'WebGL', true, 'supported', { source: 'canvas.getContext("webgl")' }));
    results.push(result('gpu-webgl2', 'graphics', 'WebGL 2', isWebGL2, isWebGL2 ? 'supported' : 'unsupported', { source: 'canvas.getContext("webgl2")' }));

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      results.push(result('gpu-renderer', 'graphics', 'GPU Renderer', renderer, 'available', { source: 'WEBGL_debug_renderer_info.UNMASKED_RENDERER_WEBGL', privacyNote: 'This information can be used for fingerprinting. Browsers may restrict this in the future.' }));
      results.push(result('gpu-vendor', 'graphics', 'GPU Vendor', vendor, 'available', { source: 'WEBGL_debug_renderer_info.UNMASKED_VENDOR_WEBGL' }));
    } else {
      results.push(result('gpu-renderer', 'graphics', 'GPU Renderer', null, 'restricted', { description: 'WEBGL_debug_renderer_info extension not available. Browser may be hiding GPU identity.' }));
    }

    results.push(result('gpu-version', 'graphics', 'WebGL Version', gl.getParameter(gl.VERSION), 'available', { source: 'gl.VERSION' }));
    results.push(result('gpu-glsl', 'graphics', 'GLSL Version', gl.getParameter(gl.SHADING_LANGUAGE_VERSION), 'available', { source: 'gl.SHADING_LANGUAGE_VERSION' }));
    results.push(result('gpu-max-texture', 'graphics', 'Max Texture Size', gl.getParameter(gl.MAX_TEXTURE_SIZE), 'available', { source: 'gl.MAX_TEXTURE_SIZE' }));
    results.push(result('gpu-max-cubemap', 'graphics', 'Max Cube Map Size', gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE), 'available', { source: 'gl.MAX_CUBE_MAP_TEXTURE_SIZE' }));
    results.push(result('gpu-max-viewport', 'graphics', 'Max Viewport Dims', gl.getParameter(gl.MAX_VIEWPORT_DIMS), 'available', { source: 'gl.MAX_VIEWPORT_DIMS' }));
    results.push(result('gpu-max-vertex-attribs', 'graphics', 'Max Vertex Attribs', gl.getParameter(gl.MAX_VERTEX_ATTRIBS), 'available', { source: 'gl.MAX_VERTEX_ATTRIBS' }));
    results.push(result('gpu-max-vertex-uniforms', 'graphics', 'Max Vertex Uniforms', gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS), 'available', { source: 'gl.MAX_VERTEX_UNIFORM_VECTORS' }));
    results.push(result('gpu-max-fragment-uniforms', 'graphics', 'Max Fragment Uniforms', gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS), 'available', { source: 'gl.MAX_FRAGMENT_UNIFORM_VECTORS' }));
    results.push(result('gpu-max-varying', 'graphics', 'Max Varying Vectors', gl.getParameter(gl.MAX_VARYING_VECTORS), 'available', { source: 'gl.MAX_VARYING_VECTORS' }));
    results.push(result('gpu-max-texture-units', 'graphics', 'Max Texture Image Units', gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), 'available', { source: 'gl.MAX_TEXTURE_IMAGE_UNITS' }));
    results.push(result('gpu-max-combined-units', 'graphics', 'Max Combined Texture Units', gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS), 'available', { source: 'gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS' }));
    results.push(result('gpu-max-renderbuffer', 'graphics', 'Max Renderbuffer Size', gl.getParameter(gl.MAX_RENDERBUFFER_SIZE), 'available', { source: 'gl.MAX_RENDERBUFFER_SIZE' }));

    const extensions = gl.getSupportedExtensions();
    results.push(result('gpu-extensions', 'graphics', 'WebGL Extensions', extensions?.length || 0, 'available', { source: 'gl.getSupportedExtensions()', description: `${extensions?.length || 0} extensions supported` }));
  } else {
    results.push(result('gpu-webgl', 'graphics', 'WebGL', false, 'unsupported'));
  }

  // WebGPU
  const gpu = (navigator as any).gpu;
  if (gpu) {
    results.push(result('gpu-webgpu', 'graphics', 'WebGPU API', true, 'supported', { source: 'navigator.gpu' }));
    // Try to get adapter info asynchronously
    gpu.requestAdapter().then((adapter: any) => {
      if (adapter) {
        if (adapter.requestAdapterInfo) {
          adapter.requestAdapterInfo().then((info: any) => {
            // Info available through callback
          }).catch(() => {});
        }
        results.push(result('gpu-webgpu-features', 'graphics', 'WebGPU Features', adapter.features?.size || 0, 'available', { description: `${adapter.features?.size || 0} features available` }));
      }
    }).catch(() => {});
  } else {
    results.push(result('gpu-webgpu', 'graphics', 'WebGPU API', false, 'unsupported', { description: 'WebGPU is not available in this browser.' }));
  }

  return results;
}

// ============ AUDIO DIAGNOSTICS ============
export function getAudioDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  results.push(result('audio-context', 'audio', 'AudioContext', !!AudioCtx, AudioCtx ? 'supported' : 'unsupported', { source: 'window.AudioContext' }));
  
  results.push(result('audio-offline', 'audio', 'OfflineAudioContext', typeof OfflineAudioContext !== 'undefined', typeof OfflineAudioContext !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof OfflineAudioContext' }));

  if (AudioCtx) {
    try {
      const ctx = new AudioCtx();
      results.push(result('audio-sample-rate', 'audio', 'Sample Rate', `${ctx.sampleRate} Hz`, 'available', { source: 'AudioContext.sampleRate' }));
      results.push(result('audio-channels', 'audio', 'Output Channels', ctx.destination.maxChannelCount, 'available', { source: 'AudioContext.destination.maxChannelCount' }));
      results.push(result('audio-state', 'audio', 'Audio State', ctx.state, 'available', { source: 'AudioContext.state' }));
      results.push(result('audio-audio-worklet', 'audio', 'AudioWorklet', typeof AudioWorkletNode !== 'undefined', typeof AudioWorkletNode !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof AudioWorkletNode' }));
      ctx.close();
    } catch {
      results.push(result('audio-context-create', 'audio', 'AudioContext Creation', null, 'failed', { description: 'Failed to create AudioContext.' }));
    }
  }

  results.push(result('audio-media-recorder', 'audio', 'MediaRecorder', typeof MediaRecorder !== 'undefined', typeof MediaRecorder !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof MediaRecorder' }));

  // Audio codec support
  const audioEl = document.createElement('audio');
  const codecs = [
    ['audio/mpeg', 'MP3'],
    ['audio/mp4; codecs="mp4a.40.2"', 'AAC'],
    ['audio/ogg; codecs="opus"', 'Opus'],
    ['audio/ogg; codecs="vorbis"', 'Vorbis'],
    ['audio/wav; codecs="1"', 'WAV'],
    ['audio/flac', 'FLAC'],
    ['audio/webm; codecs="opus"', 'WebM Opus'],
  ];

  codecs.forEach(([mime, name]) => {
    const support = audioEl.canPlayType(mime);
    results.push(result(`audio-codec-${name}`, 'audio', `Audio Codec: ${name}`, support || 'not supported', support ? 'supported' : 'unsupported', { source: `canPlayType('${mime}')` }));
  });

  return results;
}

// ============ NETWORK DIAGNOSTICS ============
export function getNetworkDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  const nav = navigator;

  results.push(result('net-online', 'network', 'Online Status', nav.onLine, 'available', { source: 'navigator.onLine' }));

  const conn = (nav as any).connection || (nav as any).mozConnection || (nav as any).webkitConnection;
  if (conn) {
    results.push(result('net-effective-type', 'network', 'Effective Connection Type', conn.effectiveType, 'available', { source: 'NetworkInformation.effectiveType', description: 'Estimated connection quality. Values: slow-2g, 2g, 3g, 4g.' }));
    results.push(result('net-downlink', 'network', 'Downlink', conn.downlink ? `${conn.downlink} Mbps` : null, conn.downlink ? 'available' : 'unknown', { source: 'NetworkInformation.downlink', isEstimate: true }));
    results.push(result('net-rtt', 'network', 'Round Trip Time', conn.rtt ? `${conn.rtt} ms` : null, conn.rtt ? 'available' : 'unknown', { source: 'NetworkInformation.rtt', isEstimate: true }));
    results.push(result('net-save-data', 'network', 'Save Data', conn.saveData, 'available', { source: 'NetworkInformation.saveData' }));
    results.push(result('net-type', 'network', 'Connection Type', conn.type || 'unknown', 'available', { source: 'NetworkInformation.type' }));
    if (conn.downlinkMax) {
      results.push(result('net-downlink-max', 'network', 'Max Downlink', `${conn.downlinkMax} Mbps`, 'available', { source: 'NetworkInformation.downlinkMax', isEstimate: true }));
    }
  } else {
    results.push(result('net-info-api', 'network', 'Network Information API', false, 'unsupported', { description: 'Network Information API not available. Detailed network metrics cannot be determined.' }));
  }

  return results;
}

// ============ STORAGE DIAGNOSTICS ============
export function getStorageDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  // localStorage
  let lsAvailable = false;
  try { localStorage.setItem('__test', '1'); localStorage.removeItem('__test'); lsAvailable = true; } catch {}
  results.push(result('storage-local', 'storage', 'localStorage', lsAvailable, lsAvailable ? 'supported' : 'unsupported', { source: 'window.localStorage' }));

  // sessionStorage
  let ssAvailable = false;
  try { sessionStorage.setItem('__test', '1'); sessionStorage.removeItem('__test'); ssAvailable = true; } catch {}
  results.push(result('storage-session', 'storage', 'sessionStorage', ssAvailable, ssAvailable ? 'supported' : 'unsupported', { source: 'window.sessionStorage' }));

  // IndexedDB
  results.push(result('storage-idb', 'storage', 'IndexedDB', typeof indexedDB !== 'undefined', typeof indexedDB !== 'undefined' ? 'supported' : 'unsupported', { source: 'window.indexedDB' }));

  // Cache API
  results.push(result('storage-cache', 'storage', 'Cache API', typeof caches !== 'undefined', typeof caches !== 'undefined' ? 'supported' : 'unsupported', { source: 'window.caches' }));

  // Service Worker
  results.push(result('storage-sw', 'storage', 'Service Worker', 'serviceWorker' in navigator, 'serviceWorker' in navigator ? 'supported' : 'unsupported', { source: 'navigator.serviceWorker' }));

  // StorageManager
  if (navigator.storage) {
    results.push(result('storage-manager', 'storage', 'StorageManager', true, 'supported', { source: 'navigator.storage' }));
    
    navigator.storage.estimate().then(est => {
      // Handled asynchronously
    }).catch(() => {});
    
    if (typeof navigator.storage.persist === 'function') {
      navigator.storage.persisted().then(() => {
        // Handled asynchronously
      }).catch(() => {});
      results.push(result('storage-persist', 'storage', 'Persistent Storage', 'check available', 'available', { source: 'navigator.storage.persist()', description: 'Request persistent storage to prevent eviction.' }));
    }
  } else {
    results.push(result('storage-manager', 'storage', 'StorageManager', false, 'unsupported'));
  }

  // File System Access API
  results.push(result('storage-fs-access', 'storage', 'File System Access API', 'showOpenFilePicker' in window, 'showOpenFilePicker' in window ? 'supported' : 'unsupported', { source: 'window.showOpenFilePicker' }));
  
  // File API
  results.push(result('storage-file-api', 'storage', 'File API', typeof File !== 'undefined', typeof File !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof File' }));
  results.push(result('storage-blob', 'storage', 'Blob API', typeof Blob !== 'undefined', typeof Blob !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof Blob' }));

  return results;
}

// ============ BATTERY DIAGNOSTICS ============
export function getBatteryDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  const hasBattery = typeof (navigator as any).getBattery === 'function';

  if (hasBattery) {
    results.push(result('battery-api', 'battery', 'Battery Status API', true, 'supported', { source: 'navigator.getBattery()', description: 'API available. Click to check battery status.' }));
  } else {
    results.push(result('battery-api', 'battery', 'Battery Status API', false, 'unsupported', { description: 'Battery Status API not available. Many browsers have removed this for privacy reasons.' }));
  }

  return results;
}

// ============ SENSORS DIAGNOSTICS ============
export function getSensorDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  results.push(result('sensor-orientation', 'sensors', 'DeviceOrientationEvent', typeof DeviceOrientationEvent !== 'undefined', typeof DeviceOrientationEvent !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof DeviceOrientationEvent' }));
  results.push(result('sensor-motion', 'sensors', 'DeviceMotionEvent', typeof DeviceMotionEvent !== 'undefined', typeof DeviceMotionEvent !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof DeviceMotionEvent' }));
  
  // Generic Sensor API
  const sensors: [string, string][] = [
    ['Accelerometer', 'Accelerometer'],
    ['LinearAccelerationSensor', 'LinearAccelerationSensor'],
    ['GravitySensor', 'GravitySensor'],
    ['Gyroscope', 'Gyroscope'],
    ['AbsoluteOrientationSensor', 'AbsoluteOrientationSensor'],
    ['RelativeOrientationSensor', 'RelativeOrientationSensor'],
    ['Magnetometer', 'Magnetometer'],
    ['AmbientLightSensor', 'AmbientLightSensor'],
  ];

  sensors.forEach(([name, api]) => {
    const supported = api in window;
    results.push(result(`sensor-${name}`, 'sensors', name, supported, supported ? 'supported' : 'unsupported', { source: `typeof ${api}`, description: `${name} sensor API. Requires permission on most browsers.` }));
  });

  return results;
}

// ============ INPUT DIAGNOSTICS ============
export function getInputDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  results.push(result('input-touch', 'input', 'Touch Support', 'ontouchstart' in window || navigator.maxTouchPoints > 0, ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 'supported' : 'unsupported', { source: 'ontouchstart / maxTouchPoints' }));
  results.push(result('input-max-touch', 'input', 'Max Touch Points', navigator.maxTouchPoints, 'available', { source: 'navigator.maxTouchPoints' }));
  results.push(result('input-pointer-events', 'input', 'Pointer Events', typeof PointerEvent !== 'undefined', typeof PointerEvent !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof PointerEvent' }));
  results.push(result('input-gamepad', 'input', 'Gamepad API', typeof navigator.getGamepads === 'function', typeof navigator.getGamepads === 'function' ? 'supported' : 'unsupported', { source: 'navigator.getGamepads' }));
  results.push(result('input-keyboard', 'input', 'Keyboard API', 'keyboard' in navigator, 'keyboard' in navigator ? 'supported' : 'unsupported', { source: 'navigator.keyboard' }));

  // Check for connected gamepads
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  const connected = Array.from(gamepads).filter(gp => gp !== null);
  results.push(result('input-gamepads-connected', 'input', 'Connected Gamepads', connected.length, 'available', { description: `${connected.length} gamepad(s) detected.` }));

  return results;
}

// ============ CONNECTIVITY DIAGNOSTICS ============
export function getConnectivityDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  results.push(result('conn-bluetooth', 'connectivity', 'Web Bluetooth', 'bluetooth' in navigator, 'bluetooth' in navigator ? 'supported' : 'unsupported', { source: 'navigator.bluetooth', description: 'Web Bluetooth API. Requires user gesture and device selection.' }));
  results.push(result('conn-hid', 'connectivity', 'WebHID', 'hid' in navigator, 'hid' in navigator ? 'supported' : 'unsupported', { source: 'navigator.hid', description: 'WebHID API for Human Interface Devices.' }));
  results.push(result('conn-serial', 'connectivity', 'Web Serial', 'serial' in navigator, 'serial' in navigator ? 'supported' : 'unsupported', { source: 'navigator.serial', description: 'Web Serial API for serial port access.' }));
  results.push(result('conn-usb', 'connectivity', 'WebUSB', 'usb' in navigator, 'usb' in navigator ? 'supported' : 'unsupported', { source: 'navigator.usb', description: 'WebUSB API for USB device access.' }));
  results.push(result('conn-midi', 'connectivity', 'Web MIDI', 'requestMIDIAccess' in navigator, 'requestMIDIAccess' in navigator ? 'supported' : 'unsupported', { source: 'navigator.requestMIDIAccess', description: 'Web MIDI API for musical instrument communication.' }));
  results.push(result('conn-nfc', 'connectivity', 'Web NFC', 'NDEFReader' in window, 'NDEFReader' in window ? 'supported' : 'unsupported', { source: 'typeof NDEFReader' }));
  results.push(result('conn-webrtc', 'connectivity', 'WebRTC', typeof RTCPeerConnection !== 'undefined', typeof RTCPeerConnection !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof RTCPeerConnection' }));
  results.push(result('conn-websocket', 'connectivity', 'WebSocket', typeof WebSocket !== 'undefined', typeof WebSocket !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof WebSocket' }));
  results.push(result('conn-webrtc-data', 'connectivity', 'WebTransport', typeof (window as any).WebTransport !== 'undefined', typeof (window as any).WebTransport !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof WebTransport' }));

  return results;
}

// ============ PERMISSIONS DIAGNOSTICS ============
export async function getPermissionDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  const permissions = navigator.permissions;

  if (!permissions) {
    results.push(result('perm-api', 'permissions', 'Permissions API', false, 'unsupported', { description: 'Permissions API not available in this browser.' }));
    return results;
  }

  results.push(result('perm-api', 'permissions', 'Permissions API', true, 'supported', { source: 'navigator.permissions' }));

  const permissionNames = [
    'geolocation', 'notifications', 'camera', 'microphone',
    'clipboard-read', 'clipboard-write', 'persistent-storage',
    'push', 'midi', 'accelerometer', 'gyroscope', 'magnetometer',
  ];

  for (const name of permissionNames) {
    try {
      const status = await permissions.query({ name: name as PermissionName });
      results.push(result(`perm-${name}`, 'permissions', name, status.state, 'available', { source: `permissions.query({name: '${name}'})`, description: `Current state: ${status.state}` }));
    } catch {
      results.push(result(`perm-${name}`, 'permissions', name, null, 'unsupported', { description: `Permission '${name}' not queryable in this browser.` }));
    }
  }

  return results;
}

// ============ SECURITY DIAGNOSTICS ============
export function getSecurityDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  results.push(result('sec-https', 'security', 'HTTPS', location.protocol === 'https:', location.protocol === 'https:' ? 'available' : 'unknown', { source: 'location.protocol', description: 'Whether the page is served over HTTPS.' }));
  results.push(result('sec-secure-context', 'security', 'Secure Context', window.isSecureContext, window.isSecureContext ? 'available' : 'unknown', { source: 'window.isSecureContext', description: 'Secure contexts enable powerful web features.' }));
  results.push(result('sec-crypto', 'security', 'Web Crypto API', typeof crypto !== 'undefined', typeof crypto !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof crypto' }));
  results.push(result('sec-subtle-crypto', 'security', 'SubtleCrypto', typeof crypto?.subtle !== 'undefined', typeof crypto?.subtle !== 'undefined' ? 'supported' : 'unsupported', { source: 'crypto.subtle' }));
  results.push(result('sec-webauthn', 'security', 'WebAuthn', typeof PublicKeyCredential !== 'undefined', typeof PublicKeyCredential !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof PublicKeyCredential', description: 'Web Authentication API for passwordless login.' }));
  
  // Cross-origin isolation
  results.push(result('sec-coi', 'security', 'Cross-Origin Isolated', (window as any).crossOriginIsolated, (window as any).crossOriginIsolated ? 'available' : 'unknown', { source: 'crossOriginIsolated', description: 'Required for SharedArrayBuffer and some high-precision APIs.' }));

  return results;
}

// ============ WEB API CAPABILITY MATRIX ============
export function getApiDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  const apis: [string, string, boolean][] = [
    ['Web Workers', 'Web Workers for background threads', typeof Worker !== 'undefined'],
    ['Shared Workers', 'Workers shared across browsing contexts', typeof SharedWorker !== 'undefined'],
    ['Service Workers', 'Background script for offline/caching', 'serviceWorker' in navigator],
    ['WebAssembly', 'Binary instruction format', typeof WebAssembly !== 'undefined'],
    ['WebGL', '3D graphics rendering', !!document.createElement('canvas').getContext('webgl')],
    ['WebGL 2', 'WebGL version 2', !!document.createElement('canvas').getContext('webgl2')],
    ['WebGPU', 'Next-gen graphics API', !!(navigator as any).gpu],
    ['Web Audio', 'Audio processing', !!(window.AudioContext || (window as any).webkitAudioContext)],
    ['WebCodecs', 'Low-level codec access', typeof (window as any).VideoDecoder !== 'undefined'],
    ['WebRTC', 'Real-time communication', typeof RTCPeerConnection !== 'undefined'],
    ['WebTransport', 'Low-latency transport', typeof (window as any).WebTransport !== 'undefined'],
    ['WebSocket', 'Full-duplex communication', typeof WebSocket !== 'undefined'],
    ['Server-Sent Events', 'One-way server push', typeof EventSource !== 'undefined'],
    ['Fetch API', 'Modern HTTP requests', typeof fetch !== 'undefined'],
    ['Streams API', 'Readable/Writable streams', typeof ReadableStream !== 'undefined'],
    ['Compression Streams', 'Built-in compression', typeof CompressionStream !== 'undefined'],
    ['File API', 'File handling', typeof File !== 'undefined'],
    ['File System Access', 'Advanced file system access', 'showOpenFilePicker' in window],
    ['IndexedDB', 'Client-side database', typeof indexedDB !== 'undefined'],
    ['Cache API', 'Request/response caching', typeof caches !== 'undefined'],
    ['BroadcastChannel', 'Cross-tab communication', typeof BroadcastChannel !== 'undefined'],
    ['Web Locks', 'Resource locking', typeof (navigator as any).locks !== 'undefined'],
    ['Notifications', 'System notifications', 'Notification' in window],
    ['Push API', 'Push notifications', 'PushManager' in window],
    ['Clipboard API', 'Clipboard access', typeof navigator.clipboard !== 'undefined'],
    ['Web Share', 'Native sharing', typeof navigator.share === 'function'],
    ['Fullscreen', 'Fullscreen mode', !!document.fullscreenEnabled],
    ['Picture-in-Picture', 'PiP video', 'pictureInPictureEnabled' in document],
    ['Screen Capture', 'Screen/tab capture', typeof (navigator as any).mediaDevices?.getDisplayMedia === 'function'],
    ['Media Capture', 'Camera/microphone', typeof (navigator as any).mediaDevices?.getUserMedia === 'function'],
    ['MediaRecorder', 'Media recording', typeof MediaRecorder !== 'undefined'],
    ['Gamepad', 'Game controller input', typeof navigator.getGamepads === 'function'],
    ['Web MIDI', 'MIDI devices', 'requestMIDIAccess' in navigator],
    ['Web Bluetooth', 'Bluetooth access', 'bluetooth' in navigator],
    ['WebHID', 'HID devices', 'hid' in navigator],
    ['Web Serial', 'Serial ports', 'serial' in navigator],
    ['WebUSB', 'USB devices', 'usb' in navigator],
    ['WebXR', 'VR/AR experiences', typeof (navigator as any).xr !== 'undefined'],
    ['Geolocation', 'Location services', 'geolocation' in navigator],
    ['Device Orientation', 'Device tilt', typeof DeviceOrientationEvent !== 'undefined'],
    ['Device Motion', 'Device movement', typeof DeviceMotionEvent !== 'undefined'],
    ['ResizeObserver', 'Element resize detection', typeof ResizeObserver !== 'undefined'],
    ['IntersectionObserver', 'Element visibility', typeof IntersectionObserver !== 'undefined'],
    ['MutationObserver', 'DOM mutation detection', typeof MutationObserver !== 'undefined'],
    ['Performance API', 'Performance metrics', typeof performance !== 'undefined'],
    ['Navigation API', 'Navigation events', typeof (window as any).navigation !== 'undefined'],
    ['History API', 'Browser history', typeof history !== 'undefined' && typeof history.pushState === 'function'],
    ['URL API', 'URL parsing', typeof URL !== 'undefined'],
    ['Web Crypto', 'Cryptography', typeof crypto !== 'undefined'],
    ['WebAuthn', 'Web authentication', typeof PublicKeyCredential !== 'undefined'],
    ['Payment Request', 'Payment handling', typeof PaymentRequest !== 'undefined'],
    ['Wake Lock', 'Prevent screen sleep', typeof (navigator as any).wakeLock !== 'undefined'],
    ['Screen Orientation', 'Orientation control', typeof screen.orientation !== 'undefined'],
    ['Badging API', 'App badge', 'setAppBadge' in navigator],
    ['EyeDropper', 'Color picker', typeof (window as any).EyeDropper !== 'undefined'],
    ['Local Font Access', 'System fonts', typeof (navigator as any).fonts !== 'undefined'],
    ['View Transitions', 'Page transitions', typeof (document as any).startViewTransition === 'function'],
    ['Popover API', 'Popover elements', typeof HTMLElement.prototype.togglePopover === 'function'],
    ['Dialog Element', 'Modal dialogs', typeof HTMLDialogElement !== 'undefined'],
    ['Shadow DOM', 'Encapsulated DOM', typeof HTMLElement.prototype.attachShadow === 'function'],
    ['Custom Elements', 'Custom HTML elements', typeof customElements !== 'undefined'],
    ['OffscreenCanvas', 'Canvas without DOM', typeof OffscreenCanvas !== 'undefined'],
    ['Web Animations', 'Animation API', typeof Element.prototype.animate === 'function'],
    ['Media Source Extensions', 'Adaptive streaming', typeof MediaSource !== 'undefined'],
    ['Encrypted Media Extensions', 'DRM content', typeof (navigator as any).requestMediaKeySystemAccess === 'function'],
    ['Idle Detection', 'User idle state', typeof (window as any).IdleDetector !== 'undefined'],
    ['Contact Picker', 'Contact selection', typeof (navigator as any).contacts !== 'undefined'],
    ['Origin Private FS', 'Private file storage', typeof (navigator as any).storage?.getDirectory === 'function'],
  ];

  apis.forEach(([name, desc, supported]) => {
    results.push(result(`api-${name.toLowerCase().replace(/\s+/g, '-')}`, 'apis', name, supported, supported ? 'supported' : 'unsupported', { description: desc }));
  });

  return results;
}

// ============ PRIVACY / FINGERPRINTING ANALYSIS ============
export function getPrivacyDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  results.push(result('priv-screen', 'privacy', 'Screen Size Exposure', `${screen.width}x${screen.height}`, 'available', { privacyNote: 'Screen dimensions can contribute to fingerprinting. This is broadly available to all websites.', description: 'Screen dimensions are available to all websites without permission.' }));
  results.push(result('priv-timezone', 'privacy', 'Timezone Exposure', Intl.DateTimeFormat().resolvedOptions().timeZone, 'available', { privacyNote: 'Timezone narrows down geographic location estimate.' }));
  results.push(result('priv-language', 'privacy', 'Language Exposure', navigator.language, 'available', { privacyNote: 'Language preference can help identify user demographics.' }));
  results.push(result('priv-cpu', 'privacy', 'CPU Concurrency Exposure', navigator.hardwareConcurrency, 'available', { privacyNote: 'Logical processor count is a fingerprinting signal.' }));
  
  const privDevMem = (navigator as any).deviceMemory;
  if (privDevMem) {
    results.push(result('priv-memory', 'privacy', 'Memory Exposure', `${privDevMem} GB`, 'available', { privacyNote: 'Device memory hint is a fingerprinting signal, though it is coarse-grained.' }));
  }

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      results.push(result('priv-gpu', 'privacy', 'GPU Renderer Exposure', renderer, 'available', { privacyNote: 'GPU renderer string is a strong fingerprinting signal. It reveals specific hardware.' }));
    }
  }

  results.push(result('priv-plugins', 'privacy', 'Plugins Exposure', navigator.plugins?.length || 0, 'available', { privacyNote: 'Browser plugins can be a fingerprinting vector.' }));
  results.push(result('priv-touch', 'privacy', 'Touch Capability Exposure', navigator.maxTouchPoints, 'available', { privacyNote: 'Touch capability helps classify device type.' }));
  results.push(result('priv-webdriver', 'privacy', 'Automation Detection', (navigator as any).webdriver, 'available', { privacyNote: 'WebDriver flag indicates automated browsing.' }));

  // Summary
  results.push(result('priv-summary', 'privacy', 'Fingerprinting Surface Summary', 'Multiple identifying signals exposed', 'available', { description: 'Your browser exposes several signals that can be combined to create a unique fingerprint. This is inherent to how browsers work. Privacy-focused browsers reduce these signals.' }));

  return results;
}

// ============ PERFORMANCE DIAGNOSTICS ============
export function getPerformanceDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  results.push(result('perf-now', 'performance', 'Performance.now()', typeof performance.now === 'function', typeof performance.now === 'function' ? 'supported' : 'unsupported', { source: 'performance.now()' }));
  results.push(result('perf-observer', 'performance', 'PerformanceObserver', typeof PerformanceObserver !== 'undefined', typeof PerformanceObserver !== 'undefined' ? 'supported' : 'unsupported', { source: 'typeof PerformanceObserver' }));

  // Navigation timing
  const navEntries = performance.getEntriesByType('navigation');
  if (navEntries.length > 0) {
    const nav = navEntries[0] as PerformanceNavigationTiming;
    results.push(result('perf-dns', 'performance', 'DNS Lookup Time', `${Math.round(nav.domainLookupEnd - nav.domainLookupStart)} ms`, 'available', { source: 'PerformanceNavigationTiming', isEstimate: true }));
    results.push(result('perf-connect', 'performance', 'TCP Connection Time', `${Math.round(nav.connectEnd - nav.connectStart)} ms`, 'available', { source: 'PerformanceNavigationTiming', isEstimate: true }));
    results.push(result('perf-ttfb', 'performance', 'Time to First Byte', `${Math.round(nav.responseStart - nav.requestStart)} ms`, 'available', { source: 'PerformanceNavigationTiming', isEstimate: true }));
    results.push(result('perf-dom-interactive', 'performance', 'DOM Interactive', `${Math.round(nav.domInteractive)} ms`, 'available', { source: 'PerformanceNavigationTiming' }));
    results.push(result('perf-dom-complete', 'performance', 'DOM Complete', `${Math.round(nav.domComplete)} ms`, 'available', { source: 'PerformanceNavigationTiming' }));
    results.push(result('perf-load', 'performance', 'Page Load Time', `${Math.round(nav.loadEventEnd - nav.startTime)} ms`, 'available', { source: 'PerformanceNavigationTiming' }));
  }

  // Memory info (Chrome only)
  const perfMemory = (performance as any).memory;
  if (perfMemory) {
    results.push(result('perf-js-heap', 'performance', 'JS Heap Used', `${Math.round(perfMemory.usedJSHeapSize / 1048576)} MB`, 'available', { source: 'performance.memory.usedJSHeapSize', description: 'JavaScript heap memory currently in use. Chrome/Chromium only.' }));
    results.push(result('perf-js-heap-total', 'performance', 'JS Heap Total', `${Math.round(perfMemory.totalJSHeapSize / 1048576)} MB`, 'available', { source: 'performance.memory.totalJSHeapSize' }));
    results.push(result('perf-js-heap-limit', 'performance', 'JS Heap Limit', `${Math.round(perfMemory.jsHeapSizeLimit / 1048576)} MB`, 'available', { source: 'performance.memory.jsHeapSizeLimit' }));
  }

  // Paint timing
  const paintEntries = performance.getEntriesByType('paint');
  paintEntries.forEach(entry => {
    results.push(result(`perf-paint-${entry.name}`, 'performance', entry.name, `${Math.round(entry.startTime)} ms`, 'available', { source: 'PerformancePaintTiming' }));
  });

  results.push(result('perf-note', 'performance', 'Performance Note', 'Metrics are affected by browser, extensions, CPU load, network, and thermal state. Not permanent device properties.', 'available', { description: 'Performance metrics vary based on current conditions.' }));

  return results;
}

// ============ MEDIA CODEC DIAGNOSTICS ============
export function getMediaCodecDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  const videoEl = document.createElement('video');

  const videoCodecs: [string, string][] = [
    ['video/mp4; codecs="avc1.42E01E"', 'H.264 (Baseline)'],
    ['video/mp4; codecs="avc1.64001E"', 'H.264 (High)'],
    ['video/mp4; codecs="hev1.1.6.L93.B0"', 'HEVC/H.265'],
    ['video/webm; codecs="vp8"', 'VP8'],
    ['video/webm; codecs="vp9"', 'VP9'],
    ['video/webm; codecs="vp09.00.10.08"', 'VP9 (Profile 0)'],
    ['video/webm; codecs="av01.0.01M.08"', 'AV1'],
    ['video/ogg; codecs="theora"', 'Theora'],
  ];

  videoCodecs.forEach(([mime, name]) => {
    const support = videoEl.canPlayType(mime);
    results.push(result(`media-video-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, 'camera', `Video: ${name}`, support || 'not supported', support ? 'supported' : 'unsupported', { source: `canPlayType('${mime}')` }));
  });

  // MediaSource
  if (typeof MediaSource !== 'undefined') {
    results.push(result('media-mse', 'camera', 'Media Source Extensions', true, 'supported', { source: 'typeof MediaSource' }));
    
    const mseCodecs: [string, string][] = [
      ['video/mp4; codecs="avc1.42E01E"', 'MSE H.264'],
      ['video/webm; codecs="vp8"', 'MSE VP8'],
      ['video/webm; codecs="vp9"', 'MSE VP9'],
      ['video/webm; codecs="av01.0.01M.08"', 'MSE AV1'],
    ];

    mseCodecs.forEach(([mime, name]) => {
      const supported = MediaSource.isTypeSupported(mime);
      results.push(result(`media-mse-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, 'camera', name, supported, supported ? 'supported' : 'unsupported', { source: `MediaSource.isTypeSupported('${mime}')` }));
    });
  }

  return results;
}
