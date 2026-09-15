# Contributing to Device Intelligence

Thank you for your interest in contributing to Device Intelligence! This guide will help you get started.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/device-intelligence.git
   cd device-intelligence
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:5173`

## Project Structure

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

## Adding a New Diagnostic

### 1. Define the Diagnostic

Open `src/diagnostics/engine.ts` and add your diagnostic function:

```typescript
export function getNewCategoryDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  // Example: Check for a Web API
  const apiAvailable = typeof (window as any).newAPI !== 'undefined';
  
  results.push({
    id: 'new-api-check',
    category: 'new-category',
    name: 'New API',
    value: apiAvailable,
    status: apiAvailable ? 'supported' : 'unsupported',
    source: 'typeof window.newAPI',
    description: 'Description of what this API does',
  });

  return results;
}
```

### 2. Register the Category

Add your category to `src/types/index.ts`:

```typescript
export const CATEGORIES: CategoryInfo[] = [
  // ... existing categories
  {
    id: 'new-category',
    name: 'New Category',
    icon: 'NewIcon',
    description: 'Description of this category'
  },
];
```

### 3. Integrate in App.tsx

Import your diagnostic function and add it to the diagnostics array in `App.tsx`:

```typescript
import { getNewCategoryDiagnostics } from './diagnostics/engine';

// In the useEffect that runs diagnostics:
const results = [
  ...getBrowserDiagnostics(),
  // ... other diagnostics
  ...getNewCategoryDiagnostics(),
];
```

### 4. Create a Custom Page (Optional)

If your category needs interactive elements, create a component in `src/components/`:

```typescript
// src/components/NewCategoryPage.tsx
export function NewCategoryPage({ baseResults }: { baseResults: DiagnosticResult[] }) {
  return (
    <div>
      <h1>New Category</h1>
      {/* Your custom UI */}
    </div>
  );
}
```

Then integrate it in `App.tsx`:

```typescript
{activeCategory === 'new-category' && (
  <NewCategoryPage baseResults={allResults} />
)}
```

## Diagnostic Result Statuses

Use the appropriate status for your diagnostic:

- `available` - Value is available and detected
- `detected` - Something was detected
- `supported` - API/feature is supported
- `unsupported` - API/feature is not supported
- `permission-required` - Requires user permission
- `permission-denied` - User denied permission
- `restricted` - Browser restricts access
- `unknown` - Cannot determine
- `failed` - Test failed
- `not-applicable` - Not applicable in this context

## Privacy Guidelines

When adding diagnostics:

1. **Never request permissions automatically** - Always require explicit user action
2. **Stop media tracks immediately** after testing
3. **Add privacy notes** for sensitive data:
   ```typescript
   privacyNote: 'This information can be used for fingerprinting'
   ```
4. **Mark estimates clearly**:
   ```typescript
   isEstimate: true
   ```
5. **Never fabricate values** - Use appropriate status codes instead

## Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Add JSDoc comments for complex logic
- Keep functions focused and small
- Handle errors gracefully

## Testing

Before submitting a PR:

```bash
# Type check
npm run typecheck

# Build
npm run build

# Test in browser
npm run dev
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all checks pass
4. Update documentation if needed
5. Submit a pull request

### PR Checklist

- [ ] Code builds without errors
- [ ] Type checking passes
- [ ] Tested in multiple browsers (Chrome, Firefox, Safari)
- [ ] Mobile responsive (if UI changes)
- [ ] Privacy notes added for sensitive data
- [ ] No hardcoded values or fake data
- [ ] Documentation updated

## Browser Compatibility

Test your changes in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

Use feature detection, not user agent sniffing:

```typescript
// Good
if ('newAPI' in window) { ... }

// Bad
if (navigator.userAgent.includes('Chrome')) { ... }
```

## Questions?

Open an issue if you need help or want to discuss a feature before implementing it.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
