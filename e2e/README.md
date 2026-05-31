# E2E smoke scenarios

Playwright dependency is intentionally not installed in this restricted environment. The scenarios below are the acceptance set to automate when dependency installation is available:

- LP renders and CTA navigates to Google signin.
- Onboarding wizard reaches diagnosis.
- Reviews list opens detail and generates a reply draft.
- Reply draft can be edited and approved; Google post remains blocked for low-risk constraints unless all approvals and Google connection are valid.
- Reports list opens a generated report.
- Mobile viewport renders app navigation without overlap.
