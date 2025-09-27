# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) where applicable.

## [Unreleased]

### Added
- Baseline quality report capturing current install, lint, typecheck, test and build status.
- Architectural decision record describing the new shared configuration packages.
- Shared tooling packages for TypeScript, ESLint, Prettier and Jest foundations.
- Repository directories for quality metrics, ADRs, migrations and runbooks.
- Git keepers for migrations and runbooks to maintain directory structure.
- Root Prettier configuration pointing to the shared preset.
- Updated TypeScript and ESLint configs to consume workspace presets.
- ADR 0002 documenting the enforcement of strict lint/type settings and CI gates.
- Publish runbook describing safe GitHub Packages authentication for releases.

### Changed
- Replaced the Next.js TypeScript config with an `.mjs` variant to unblock `next lint` and let Next manage app compiler settings.
- Normalised wizard infrastructure to rely on strongly typed module input and removed duplicate step registrations.
- Tuned Turbo test outputs to avoid false cache warnings while coverage instrumentation is not yet enabled.
- Hardened the shared TypeScript compiler defaults with additional strictness flags and introduced stricter ESLint rules for imports.
- Replaced the validation workflow with a single matrix job that disables telemetry, installs with a frozen lockfile, and blocks on lint, typecheck, test and build failures.
- Refreshed the baseline quality report to reflect the current green installation, lint, typecheck, test and build status, while documenting outstanding bundle-size and coverage risks.
- Removed the repository-level `.npmrc`; publishing now generates scoped auth config in CI to avoid local token requirements.

### Fixed
- Resolved merge artefacts across shared calculation, schema, PDF and tooling modules so TypeScript and ESLint parse cleanly.
- Restored review, PDF preview and storage utilities after conflict markers to ensure runtime components compile again.
- Cleaned B1 calculation tests to eliminate duplicate suites and reinstate deterministic assertions.
