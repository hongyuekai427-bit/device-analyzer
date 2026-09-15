# Device Intelligence

> Open-source, privacy-first browser diagnostic tool that shows what your browser can learn about your device and what Web Platform capabilities are available — entirely client-side.

![Device Intelligence](https://img.shields.io/badge/Status-Production%20Ready-emerald)
![Privacy](https://img.shields.io/badge/Privacy-First-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

Device Intelligence is a comprehensive web application that inspects everything a normal web browser can legitimately expose about your current device, browser, operating environment, hardware capabilities, network environment, media capabilities, permissions, storage capabilities, sensors, graphics stack, and supported Web APIs.

**Key principles:**
- 🔒 **Privacy-first**: All processing happens locally in your browser
- 🚫 **No server required**: Works entirely client-side
- 📊 **Technically honest**: Never fabricates hardware values
- 🎯 **Comprehensive**: Tests 100+ Web Platform APIs
- 📱 **Responsive**: Works on desktop, tablet, and mobile
- ♿ **Accessible**: Keyboard navigation and screen reader support

## Features

### Diagnostic Categories

1. **Overview** — High-level device summary with compatibility scores
2. **Browser** — User agent, client hints, navigator properties
3. **System** — OS, platform, timezone, locale information
4. **Display** — Screen, viewport, DPR, media queries, HDR
5. **CPU & Memory** — Logical processors, device memory, worker support
6. **Graphics** — WebGL/WebGPU parameters, GPU info, extensions
7. **Audio** — AudioContext, codecs, microphone testing
8. **Camera & Microphone** — Media devices, capabilities, constraints
9. **Network** — Connection type, latency testing
10. **Storage** — localStorage, IndexedDB, Cache API, quota
11. **Battery** — Battery Status API (where available)
12. **Sensors** — Orientation, motion, accelerometer, gyroscope
13. **Input** — Touch, pointer, keyboard capabilities
14. **Gamepads** — Real-time gamepad visualization
15. **Connectivity** — Bluetooth, USB, Serial, HID, MIDI, WebRTC
16. **Permissions** — Permission state overview
17. **Web APIs** — 70+ API capability matrix
18. **Security** — HTTPS, secure context, crypto, WebAuthn
19. **Privacy** — Fingerprinting surface analysis
20. **Performance** — Navigation timing, benchmarks
21. **Reports** — Export as JSON, TXT, clipboard, or print

### Scores

- **Web Compatibility**: Percentage of tested APIs supported
- **Hardware Exposure**: How much hardware info the browser exposes
- **Privacy Exposure**: How many fingerprinting signals are available
- **Diagnostic Completeness**: How many diagnostics ran successfully

## Privacy Model

This application:
- ❌ Does NOT upload any data to servers
- ❌ Does NOT use analytics or tracking
- ❌ Does NOT use cookies for tracking
- ❌ Does NOT require an account
- ❌ Does NOT send camera/microphone data anywhere
- ❌ Does NOT store location data
- ✅ Processes everything locally in your browser
- ✅ Requests permissions only after explicit user action
- ✅ Stops media tracks immediately after testing

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome/Edge 90+ | ✅ Full |
| Firefox 90+ | ✅ Full |
| Safari 15+ | ✅ Full |
| iOS Safari 15+ | ✅ Full |
| Samsung Internet | ✅ Full |

Some APIs are browser-specific and will show as "Unsupported" where not available. This is expected behavior.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## Architecture

```
src/
├── App.tsx                    # Main application with navigation
├── types/index.ts             # TypeScript type definitions
├── diagnostics/engine.ts      # Core diagnostic engine
├── components/
│   ├── InteractivePages.tsx   # Camera, Gamepad, Battery, Benchmark
│   ├── SpecialPages.tsx       # Permissions, Location, Network, Sensors
│   ├── StoragePrivacyPages.tsx # Storage, Privacy analysis
│   └── ApiSecurityPages.tsx   # Web API matrix, Security
└── index.css                  # Global styles
```

### Diagnostic Engine

The diagnostic engine is separated from UI components. Each diagnostic returns a strongly-typed `DiagnosticResult`:

```typescript
type DiagnosticResult = {
  id: string;
  category: string;
  name: string;
  value?: unknown;
  status: 'available' | 'supported' | 'unsupported' | ...;
  confidence?: 'high' | 'medium' | 'low';
  source?: string;
  description?: string;
  privacyNote?: string;
  isEstimate?: boolean;
};
```

### Adding a New Diagnostic

1. Add the diagnostic function in `src/diagnostics/engine.ts`
2. Use the `result()` helper to create a typed result
3. Always handle API unavailability gracefully
4. Never fabricate values — use appropriate status codes
5. Add privacy notes where relevant

## Deployment

### GitHub Pages

The application is designed for static hosting:

1. **Configure the base path** in `vite.config.js`:
   ```javascript
   base: '/your-repo-name/'
   ```
   Replace `your-repo-name` with your actual GitHub repository name.

2. Build: `npm run build`
3. Deploy the `dist/` directory
4. No server configuration needed
5. Works with GitHub Pages subpath routing

**Important**: The `base` path in `vite.config.js` must match your repository name for GitHub Pages deployment to work correctly.

### GitHub Actions

A deployment workflow is included that:
- Runs on push to `main`
- Installs dependencies
- Type-checks the project
- Builds the production bundle
- Deploys to GitHub Pages

## Limitations

Browsers intentionally limit what websites can learn about devices:

- ❌ Cannot determine exact CPU model
- ❌ Cannot determine physical core count
- ❌ Cannot determine CPU clock speed
- ❌ Cannot determine exact GPU model (only renderer string)
- ❌ Cannot determine exact RAM (only coarse estimate)
- ❌ Cannot determine motherboard/BIOS information
- ❌ Cannot determine exact storage capacity

These limitations are by design for user privacy.

## License

MIT License — see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

If you discover a security issue, please see [SECURITY.md](SECURITY.md) for responsible disclosure guidelines.
