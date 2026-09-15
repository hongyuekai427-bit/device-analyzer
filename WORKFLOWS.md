# GitHub Workflows Guide

This project includes two GitHub Actions workflows for continuous integration and deployment.

## Workflows Overview

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Purpose**: Ensures code quality on every push and pull request.

**Triggers**:
- Push to `main` branch
- Pull requests to `main` branch

**Steps**:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Run TypeScript type checking
5. Build production bundle
6. Verify build output

**What it checks**:
- TypeScript compilation errors
- Build process succeeds
- Output files are generated correctly

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)

**Purpose**: Automatically deploys to GitHub Pages on push to main.

**Triggers**:
- Push to `main` branch
- Manual trigger via workflow_dispatch

**Steps**:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Run type checking
5. Build production bundle
6. Configure GitHub Pages
7. Upload build artifact
8. Deploy to GitHub Pages

**Permissions**:
- `contents: read` - Read repository content
- `pages: write` - Write to GitHub Pages
- `id-token: write` - Generate OIDC tokens for deployment

## Setup Instructions

### Initial Setup

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Under "Source", select "GitHub Actions"
   - Save the settings

2. **Verify workflows are enabled**:
   - Go to repository Actions tab
   - Ensure workflows are not disabled

3. **First deployment**:
   - Push to `main` branch
   - The deploy workflow will run automatically
   - Check the Actions tab for progress

### Manual Deployment

You can manually trigger the deploy workflow:

1. Go to Actions tab
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Workflow Files Explained

### CI Workflow

```yaml
name: CI

on:
  pull_request:
    branches: ['main']
  push:
    branches: ['main']
```

This runs on:
- Every push to main (to ensure main is always working)
- Every pull request to main (to catch issues before merge)

**Jobs**:
- `test`: Runs type checking and build verification

### Deploy Workflow

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:
```

This runs on:
- Every push to main (automatic deployment)
- Manual trigger (for re-deployment if needed)

**Concurrency**:
```yaml
concurrency:
  group: 'pages'
  cancel-in-progress: false
```

This ensures:
- Only one deployment runs at a time
- In-progress deployments are not cancelled
- Prevents deployment conflicts

**Jobs**:
1. `build`: Builds the application
2. `deploy`: Deploys to GitHub Pages (depends on build)

## Monitoring Workflows

### View Workflow Runs

1. Go to repository's Actions tab
2. See all workflow runs with status
3. Click on a run to see detailed logs

### View Deployment Status

1. Go to repository's Deployments tab
2. See all deployments with status
3. Click to view deployment details

### Check GitHub Pages

After successful deployment:
1. Go to Settings → Pages
2. See the deployed URL
3. Visit the URL to verify deployment

## Troubleshooting

### Workflow Fails

**Type checking fails**:
```bash
npm run typecheck
```
Fix TypeScript errors locally and push again.

**Build fails**:
```bash
npm run build
```
Fix build errors locally and push again.

**Deployment fails**:
- Check GitHub Pages is enabled
- Verify repository permissions
- Check workflow logs for specific errors

### Deployment Not Updating

1. Check workflow completed successfully
2. Wait 1-2 minutes for GitHub Pages to update
3. Clear browser cache
4. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Workflow Not Running

1. Check workflow file syntax
2. Verify branch name matches trigger
3. Ensure workflows are enabled in Actions tab
4. Check repository permissions

## Customization

### Change Node.js Version

Edit both workflow files:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change this
```

### Add Testing

Add a test step before build:
```yaml
- name: Run tests
  run: npm test
```

### Add Linting

Add a lint step:
```yaml
- name: Lint
  run: npm run lint
```

### Change Deployment Branch

Edit deploy workflow:
```yaml
on:
  push:
    branches: ['production']  # Change from 'main'
```

### Add Preview Deployments

For pull request previews, consider:
- Vercel Preview Deployments
- Netlify Preview Deployments
- GitHub Pages with branch deployments

## Best Practices

1. **Keep workflows fast**: Use caching for dependencies
2. **Fail fast**: Run type checking before build
3. **Clear naming**: Use descriptive step names
4. **Minimal permissions**: Only request needed permissions
5. **Concurrency control**: Prevent conflicting deployments
6. **Manual triggers**: Allow manual workflow runs
7. **Branch protection**: Require CI to pass before merge

## Security Considerations

- Workflows use official GitHub Actions
- Minimal permissions requested
- No secrets required (static site)
- Dependencies installed with `npm ci` (lockfile)
- Build output verified before deployment

## Cost

GitHub Actions provides:
- 2,000 minutes/month free for private repos
- Unlimited minutes for public repos
- This project uses ~2-3 minutes per workflow run

## Support

For workflow issues:
1. Check GitHub Actions documentation
2. Review workflow logs
3. Open an issue in the repository
