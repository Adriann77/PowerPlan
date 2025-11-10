# PowerPlan Frontend

## Overview

The React Native client is being rebuilt from scratch to support PowerPlan's training management experience. The legacy movie-demo scaffold and assets have been removed, and the project now exposes a clean baseline ready for new features.

## Project Structure

```
app/                 Expo Router entry points
src/
  components/        Shared UI primitives (placeholder)
  features/          Domain-specific modules (e.g., promptPack)
  navigation/        Navigation types and helpers
  providers/         Global context providers (e.g., AppProvider)
  screens/           Screen-level components
  services/          API clients, data access layers
  store/             State management and persistence
  theme/             Global styles and design tokens
  utils/             Reusable helpers
assets/
  fonts/             Typography assets
react-native-prompt-pack/  Prompt templates and related documentation
```

## Development Workflow

- Work on feature branches derived from `frontend`, e.g., `feature/auth-flow`, `feature/training-plan`.
- For cross-cutting or infrastructure changes, use `chore/*` or `refactor/*` prefixes.
- Merge via pull requests after linting, type-checking, and testing; keep `frontend` deployable.

## Immediate Next Steps

- Define detailed scope for the Prompt Pack module (automation goals, data format, tooling).
- Introduce navigation scaffolding (auth stack, main app stack) and connect to the new directory layout.
- Wire up global providers: TanStack Query, theme management, authentication session handling.
- Establish UI foundations: typography, color system, reusable primitives.
- Draft mock screens for auth, dashboard, and workout logging to drive component library needs.

## Prompt Pack Notes

The prompt pack directory currently contains documentation only. Once the scope is clarified, populate it with prompt templates, metadata files, and integration scripts. Create a dedicated feature branch when implementation starts.
