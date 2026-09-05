# ASTRA Development Guidelines & Behavioral Rules

## 1. Project Nature: Software / Tool Only
- **CRITICAL**: We are building a forensic intelligence software suite, CLI tool, background telemetry daemon, and core analytics engine.
- **NO Consumer Web Apps or Mobile Apps**: Do not scaffold web frontends, mobile layouts, or React web apps for consumers. All interfaces are forensic CLI tools, analyst terminal utilities, headless services, or automated background processors.

## 2. Mandatory Automatic Git Push Rule
- **CRITICAL**: Every time code, configuration, or documentation changes are made in the repository, automatically stage, commit, and push all changes to GitHub:
  ```powershell
  git add .
  git commit -m "<descriptive message>"
  git push origin main
  ```
- Do not require the user to manually ask to push changes.

## 3. Planning First
- Always produce or update the implementation plan before writing substantial code blocks.
- Ensure all architectural components adhere to the 4 pillars (INFRA-SCAN, MGRD, CMTBP, CAA) and DACS engine.
