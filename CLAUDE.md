# CLAUDE.md — ecom-ui

Frontend for the Ecom e-commerce platform. Micro-frontend monorepo: React + TypeScript + Vite, wired together at runtime via Module Federation.

## Tech Stack
- Core: React, TypeScript, Vite
- Styling: TailwindCSS
- Micro-frontend runtime: `@module-federation/vite`
- Monorepo tooling: Turborepo + pnpm workspaces
- Lint/format: oxlint/ESLint + Prettier, enforced via Husky pre-commit + commitlint (Conventional Commits)

Full architecture write-up: [`../docs/architecture.md`](../docs/architecture.md) — read it before adding a page or cross-app feature. It covers the Shell/Catalog/Checkout split, Module Federation runtime integration, dependency sharing, and cross-app communication.

## Project Structure
```
apps/
  shell/      Host app — header, footer, nav, auth/global state, loads remotes   (port 3000)
  catalog/    Remote — product listing, search, detail                          (port 3001)
  checkout/   Remote — cart, shipping, payment                                  (port 3002)
packages/
  ui/         Shared design system (components, hooks) — consumed via pnpm symlink
```

## Commands
| Purpose | Command |
|---|---|
| Run everything (integration dev) | `pnpm dev` |
| Run a single app in isolation | `pnpm --filter <catalog\|checkout\|shell> dev` |
| Build all (Turborepo cached) | `pnpm build` |
| Lint | `pnpm lint` |

## Onboarding — how to use AI when joining this project
1. Have the AI read [`../docs/architecture.md`](../docs/architecture.md) and this file first, then explain back the Shell/Remote split and how Module Federation loads `remoteEntry.js` at runtime. Verify it understands this is runtime integration, not a build-time merge.
2. Ask it to trace one cross-app interaction (e.g. adding a product in Catalog updates the cart count in Shell's header) to see the `window.dispatchEvent` communication pattern in practice.
3. Read an existing spec under [`../docs/specs/`](../docs/specs/) next to the page/component it describes, to see how spec sections map to the component tree.
4. Run `pnpm install && pnpm dev` at the repo root and confirm `localhost:3000` renders the fully integrated app before making changes.
5. Check recent commits (`git log --oneline -20`) for current conventions and active work.

## New Feature Workflow — Spec-Driven Development (mandatory)
This project enforces SDD via [`../.agents/skills/frontend-spec-driven/SKILL.md`](../.agents/skills/frontend-spec-driven/SKILL.md). Summary — do not skip steps:

1. **Write the spec first**, in `../docs/specs/<page-or-feature>_spec.md`. It must contain:
   - User Journey & Page Flow, with a Mermaid state diagram
   - Component Tree (Container/Form/Modal/etc. breakdown)
   - State & Data Fetching — local vs. global state, and which API endpoints are called
   - Acceptance Criteria in Given–When–Then (BDD) format, focused on UI/UX behavior
2. **Stop and get the spec approved** before writing any TSX/JSX/CSS. No exceptions.
3. **Implement strictly against the approved Component Tree and state design.**
4. **Changing an existing page/feature?** Open the matching `*_spec.md` first, update the state diagram/component tree/acceptance criteria, get that re-approved, then change the code.

## Which app owns a change
- Product listing, filters, search, PDP → `apps/catalog`
- Cart, shipping, payment → `apps/checkout`
- Nav, header, global auth state, cross-app shell → `apps/shell`
- Reusable, presentation-only components → `packages/ui` (never app-specific logic)

## Commit Convention
Conventional Commits, enforced by commitlint + a Husky pre-commit hook that lints and formats staged files automatically.
