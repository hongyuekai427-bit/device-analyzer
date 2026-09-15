# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security issues seriously. If you discover a security vulnerability, please follow these guidelines:

### What to Report

- Security vulnerabilities in the code
- Privacy concerns or data leaks
- XSS or injection vulnerabilities
- Insecure permission handling
- Any issue that could compromise user privacy

### What NOT to Report

- General bugs (use GitHub Issues)
- Feature requests
- Browser compatibility issues
- Missing diagnostics

### How to Report

**Option 1: GitHub Security Advisory (Preferred)**
1. Go to the repository's Security tab
2. Click "Report a vulnerability"
3. Fill out the form with details

**Option 2: Email**
Send details to: [security@example.com](mailto:security@example.com)

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)
- Your contact information for follow-up

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Regular updates**: At least weekly until resolved
- **Resolution timeline**: Depends on severity
  - Critical: 24-72 hours
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next release

### Disclosure Policy

- We follow responsible disclosure
- We will credit reporters (unless they prefer anonymity)
- We request 90 days before public disclosure
- Security advisories will be published on GitHub

## Security Measures

This project implements several security measures:

1. **No Server-Side Code**: Entirely client-side, no backend vulnerabilities
2. **No External Dependencies**: All code is bundled, no CDN risks
3. **No Analytics**: No tracking or data collection
4. **Explicit Permissions**: All permission requests require user action
5. **Local Processing**: All data stays in the browser
6. **No eval()**: No dynamic code execution
7. **Content Security Policy**: Strict CSP headers
8. **Input Sanitization**: All user inputs are sanitized

## Privacy as Security

Since this is a privacy-focused tool, privacy issues are treated as security issues:

- Unintended data exposure
- Fingerprinting beyond what's necessary
- Permission requests without user consent
- Data transmission without disclosure

## Bug Bounty

Currently, we do not offer a bug bounty program. However, we greatly appreciate responsible disclosure and will credit security researchers in our release notes.

## Security Updates

Security updates will be:
- Published as GitHub Security Advisories
- Included in release notes
- Backported to supported versions when feasible

## Contact

For security concerns: security@example.com  
For general questions: Use GitHub Issues
