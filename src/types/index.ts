export type DiagnosticStatus =
  | 'available'
  | 'detected'
  | 'supported'
  | 'unsupported'
  | 'permission-required'
  | 'permission-denied'
  | 'restricted'
  | 'unknown'
  | 'failed'
  | 'not-applicable';

export type Confidence = 'high' | 'medium' | 'low';

export type DiagnosticCategory =
  | 'overview'
  | 'browser'
  | 'system'
  | 'display'
  | 'cpu-memory'
  | 'graphics'
  | 'audio'
  | 'camera'
  | 'network'
  | 'storage'
  | 'battery'
  | 'sensors'
  | 'input'
  | 'gamepad'
  | 'connectivity'
  | 'permissions'
  | 'apis'
  | 'security'
  | 'privacy'
  | 'performance'
  | 'report';

export interface DiagnosticResult {
  id: string;
  category: DiagnosticCategory;
  name: string;
  value?: unknown;
  status: DiagnosticStatus;
  confidence?: Confidence;
  source?: string;
  description?: string;
  technicalDetails?: Record<string, unknown>;
  privacyNote?: string;
  isEstimate?: boolean;
}

export interface DiagnosticGroup {
  id: string;
  category: DiagnosticCategory;
  name: string;
  description: string;
  icon: string;
  results: DiagnosticResult[];
  requiresPermission?: boolean;
  requiresUserAction?: boolean;
  isHeavy?: boolean;
  isExperimental?: boolean;
}

export interface DiagnosticReport {
  schemaVersion: string;
  generatedAt: string;
  userAgent: string;
  categories: Record<string, DiagnosticGroup>;
  scores: {
    webCompatibility: number;
    hardwareExposure: number;
    privacyExposure: number;
    diagnosticCompleteness: number;
  };
}

export interface CategoryInfo {
  id: DiagnosticCategory;
  name: string;
  icon: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'overview', name: 'Overview', icon: 'LayoutDashboard', description: 'High-level device summary' },
  { id: 'browser', name: 'Browser', icon: 'Globe', description: 'Browser information and capabilities' },
  { id: 'system', name: 'System', icon: 'Monitor', description: 'Operating system and platform' },
  { id: 'display', name: 'Display', icon: 'MonitorSmartphone', description: 'Screen, viewport, and display capabilities' },
  { id: 'cpu-memory', name: 'CPU & Memory', icon: 'Cpu', description: 'Processor and memory information' },
  { id: 'graphics', name: 'Graphics', icon: 'Palette', description: 'GPU, WebGL, and WebGPU diagnostics' },
  { id: 'audio', name: 'Audio', icon: 'Volume2', description: 'Audio capabilities and Web Audio API' },
  { id: 'camera', name: 'Camera & Mic', icon: 'Camera', description: 'Media device capabilities' },
  { id: 'network', name: 'Network', icon: 'Wifi', description: 'Network information and connectivity' },
  { id: 'storage', name: 'Storage', icon: 'HardDrive', description: 'Browser storage capabilities' },
  { id: 'battery', name: 'Battery', icon: 'Battery', description: 'Battery status information' },
  { id: 'sensors', name: 'Sensors', icon: 'Activity', description: 'Device sensors and motion' },
  { id: 'input', name: 'Input', icon: 'MousePointer', description: 'Input device capabilities' },
  { id: 'gamepad', name: 'Gamepads', icon: 'Gamepad2', description: 'Game controller detection' },
  { id: 'connectivity', name: 'Connectivity', icon: 'Bluetooth', description: 'Bluetooth, USB, Serial, HID' },
  { id: 'permissions', name: 'Permissions', icon: 'Shield', description: 'Permission status overview' },
  { id: 'apis', name: 'Web APIs', icon: 'Code2', description: 'Web API capability matrix' },
  { id: 'security', name: 'Security', icon: 'Lock', description: 'Security and HTTPS status' },
  { id: 'privacy', name: 'Privacy', icon: 'EyeOff', description: 'Fingerprinting surface analysis' },
  { id: 'performance', name: 'Performance', icon: 'Zap', description: 'Performance metrics and benchmarks' },
  { id: 'report', name: 'Reports', icon: 'FileText', description: 'Export and share diagnostics' },
];
