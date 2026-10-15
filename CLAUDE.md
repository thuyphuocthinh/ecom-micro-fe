# CLAUDE.md — ecom-ui

Frontend for the Ecom e-commerce platform. Micro-frontend monorepo: React + TypeScript + Vite, wired together at runtime via Module Federation.

## Tech Stack
- Core: React 19, TypeScript, Vite
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
  api/        @ecom/api — the one API client (token/session, response unwrapping, ApiError,
              Idempotency-Key) and TypeScript types generated from the backend's Swagger
```

**All backend calls go through `@ecom/api`** (`api.get("/orders")`, never a hand-written `fetch`). **Errors are reported in one place:** every failed call goes to `api.onError` (the shell shows a toast) with `error.userMessage`, a friendly Vietnamese sentence with no codes or technical words. Pages never catch an API error just to show it; pass `silent: true` only when the page handles the failure itself. Form fields show only the Zod validation errors, never backend errors. A new backend error code a customer can meet needs a sentence in `packages/api/src/error-messages.ts`. Use `createIdempotencyKey()` once per attempt to place an order or pay and send the same key on every retry. When the backend API changes: `pnpm --filter @ecom/api fetch-openapi` (backend running) then `pnpm --filter @ecom/api generate`.

## Commands
| Purpose | Command |
|---|---|
| Run everything (integration dev) | `pnpm dev` |
| Run a single app in isolation | `pnpm --filter <catalog\|checkout\|shell> dev` |
| Build all (Turborepo cached) | `pnpm build` |
| Lint | `pnpm lint` |
| Unit tests / type check | `pnpm test` / `pnpm typecheck` |

## Onboarding — how to use AI when joining this project
1. Have the AI read [`../docs/architecture.md`](../docs/architecture.md) and this file first, then explain back the Shell/Remote split and how Module Federation loads `remoteEntry.js` at runtime. Verify it understands this is runtime integration, not a build-time merge.
2. Ask it to trace one cross-app interaction (e.g. adding a product in Catalog updates the cart count in Shell's header) to see the `window.dispatchEvent` communication pattern in practice.
3. Read an existing spec under `specs/features/` (or the active work in `specs/active/`) next to the page/component it describes, to see how spec sections map to the component tree.
4. Run `pnpm install && pnpm dev` at the repo root and confirm `localhost:3000` renders the fully integrated app before making changes.
5. Check recent commits (`git log --oneline -20`) for current conventions and active work.

## New Feature Workflow — Spec-Driven Development with `speckit-ai` (mandatory)
This project enforces SDD with `speckit-ai` (same flow as the backend), plus the frontend rules in [`../.agents/skills/frontend-spec-driven/SKILL.md`](../.agents/skills/frontend-spec-driven/SKILL.md). Read [`specs/_workflow.md`](specs/_workflow.md) first. Summary — do not skip steps:

1. **Start a work and write the spec first:** `npx speckit-ai start "<title>"` (add `--affects=<feature>` to change an existing feature). The spec is `specs/active/<work>/targets/<feature>.md` and must contain:
   - User Journey & Page Flow, with a Mermaid state diagram
   - Component Tree (Container/Form/Modal/etc. breakdown)
   - State & Data Fetching — local vs. global state, and which API endpoints are called
   - Acceptance Criteria in Given–When–Then (BDD) format, focused on UI/UX behavior
2. **Stop and get the spec approved** before writing any TSX/JSX/CSS. No exceptions.
3. **Plan and tasks:** `plan.md`, then `tasks.md`.
4. **Implement strictly against the approved Component Tree and state design.**
5. **Review and finish:** write `review.md`, then `npx speckit-ai lint` and `npx speckit-ai done`.
6. **Changing an existing page/feature?** `npx speckit-ai start "<title>" --affects=<feature>`, update the state diagram/component tree/acceptance criteria, get that re-approved, then change the code.

## Which app owns a change
- Product listing, filters, search, PDP → `apps/catalog`
- Cart, shipping, payment, order confirmation → `apps/checkout`
- Nav, header, global auth state, cross-app shell → `apps/shell`
- Home page, login/register, and the account pages (profile, my orders, order detail, address book) → `apps/shell`
- Reusable, presentation-only components → `packages/ui` (never app-specific logic)

**Design tokens and base components live in `@ecom/ui`** (`packages/ui`). Each app's `index.css` imports Tailwind, then `@import "@ecom/ui/theme.css";`. Use the token classes (`bg-brand`, `text-ink`, `rounded-control`, `font-head`...), never raw hex colours, and the components `Button`, `TextField`, `PasswordField`, `CodeInput`, `Tag`, `Card`, `SkipLink`, `Spinner` (and `buttonClasses()` / `linkClasses()` for links) instead of rebuilding them. The values are copied from `store.css` of the canvas "Ecom storefront"; change them in `packages/ui/src/theme.css` only. A link that must look like a button: `<Link className={buttonClasses({ variant: "primary" })}>`.

## Speed and correctness rules (from the `frontend-fixes` work)
- **Images are lazy by default** (`Image` from `@ecom/ui` sets `loading="lazy"` and `decoding="async"`). A picture that is on screen at once (the main photo of a product) passes `loading="eager"` and `fetchPriority="high"`.
- **A typed filter never writes the URL on every key.** Use `useDebouncedSearchParam(name)` (shell `hooks/common`): the box follows the keys, the URL is written once after 300 ms and with `replace`. `useDebouncedValue` is the plain version for a value that is not in the URL.
- **Independent requests start together.** Do not make one query wait for another that it does not need (the cart count does not wait for `/users/me`).
- **Leaving (logout, expired session) forgets only the person's data:** `clearUserData(queryClient)` (`utils/query-cache.ts`), never `queryClient.clear()`. A new query root that belongs to the person must be added to `USER_QUERY_ROOTS`.
- **Lists keep the previous results while the next ones load** (`placeholderData: keepPreviousData`, the grid is dimmed and `aria-busy`); the skeleton is only for the first load. Slow-changing data gets a `staleTime`.
- **Pages of other apps are loaded ahead** when the browser is idle and on hover or focus: `usePrefetchRemotes`, `prefetchOnIntent(path)` (shell `libs/remote-loaders.ts`). A new remote page is added to `REMOTE_KEYS` and to the loaders.
- **Links of the store come from `utils/category-link.ts`** (`searchHrefForCategory(id)`, `SALE_HREF`, `productHref(id)`): a category link carries the id the API gave, never a made-up name. The search page reads `q`, `category`, `onSale`, `inStock`, `minPrice`, `maxPrice`, `sort`.
- **One `<main id="main">` per page, owned by the layout** (`StoreLayout`, `AuthLayout`, `CatalogLayout`, `CheckoutLayout`). Pages use `<div>` or `<section>`.
- **Nothing is made up.** No sample products, ratings or counts when the API has none: show an empty or an error state.

## Commit Convention
Conventional Commits, enforced by commitlint + a Husky pre-commit hook that lints and formats staged files automatically.
