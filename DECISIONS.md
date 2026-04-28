# DECISIONS.md

This document outlines the key design and architectural decisions made while building the Trading Behavior Platform for the NevUp Hackathon 2026. Each decision focuses on balancing performance, usability, and compliance with the problem constraints.

---

## 1. Frontend Framework: React (Vite) over Next.js

**Decision:** Used React with Vite instead of Next.js.

**Why:**
- Faster development startup and build times (<2s) improved iteration speed during the hackathon.
- No requirement for SSR or backend rendering in Track 3.
- Simpler architecture aligns with the “System of Engagement” requirement (pure frontend).
- Vite provides better DX (hot reload, minimal config).

---

## 2. No Component Library (Custom UI System)

**Decision:** Built all UI components from scratch using CSS Modules.

**Why:**
- The problem explicitly forbids component libraries.
- Ensures full control over interaction design and animations.
- Avoids unnecessary bundle size overhead.
- Allows tailoring UI specifically for behavioral storytelling rather than generic UI patterns.

---

## 3. Mobile-First Design (375px Baseline)

**Decision:** Designed all layouts starting from 375px viewport.

**Why:**
- Hard requirement in the spec.
- Forces simplicity and clarity in UX.
- Ensures accessibility and usability across all devices.
- Prevents later layout breakage when scaling down.

---

## 4. State Management: Local Component State + Hooks

**Decision:** Avoided global state libraries (Redux, Zustand).

**Why:**
- Application scope is limited and predictable.
- Reduces complexity and boilerplate.
- React hooks (useState, useEffect) are sufficient and performant.
- Improves readability and maintainability.

---

## 5. API Layer Abstraction

**Decision:** Centralized API logic in `services/api.ts`.

**Why:**
- Ensures consistent JWT handling across requests.
- Simplifies error handling and retry logic.
- Decouples UI from networking logic.
- Makes future backend changes easier to integrate.

---

## 6. Server-Sent Events (SSE) for Real-Time Coaching

**Decision:** Used EventSource with a custom `useSSE` hook.

**Why:**
- SSE is lightweight and ideal for unidirectional streaming (AI coaching).
- Matches the requirement for token-by-token streaming.
- Easier to implement than WebSockets for this use case.
- Custom hook enables reuse and encapsulates reconnection logic.

---

## 7. Exponential Backoff Reconnection Strategy

**Decision:** Implemented retry logic with exponential backoff for SSE.

**Why:**
- Prevents server overload during repeated failures.
- Provides better UX compared to immediate retries.
- Required by problem statement (“graceful degradation”).
- Avoids frozen or blank UI states.

---

## 8. Custom SVG Heatmap (No Library)

**Decision:** Built heatmap using SVG instead of chart libraries.

**Why:**
- Explicit requirement: no heatmap libraries allowed.
- SVG provides fine-grained control over rendering and interactions.
- Better accessibility (focusable elements, keyboard navigation).
- Lightweight compared to canvas for this scale (90 cells).

---

## 9. Interaction-Driven UX (Behavioral Focus)

**Decision:** Designed UI around user reflection rather than raw data.

**Why:**
- Core requirement: “make the trader feel understood, not just informed” :contentReference[oaicite:0]{index=0}
- Prioritized emotional tagging, reflection, and storytelling.
- Step-based debrief reduces cognitive overload.
- Encourages user engagement and insight generation.

---

## 10. Multi-Step Debrief Flow

**Decision:** Implemented a 5-step guided flow instead of a single form.

**Why:**
- Breaks complex input into manageable chunks.
- Improves completion rates.
- Allows focused transitions and animations.
- Matches behavioral coaching patterns (reflection → insight → action).

---

## 11. Accessibility-First Design

**Decision:** Built full keyboard navigability and ARIA support.

**Why:**
- Explicit requirement in the spec.
- Improves usability for all users.
- Ensures Lighthouse accessibility score ≥ 90.
- Future-proofs the application for compliance standards (WCAG).

---

## 12. Explicit UI States (Loading, Error, Empty)

**Decision:** Every data component implements all three states.

**Why:**
- Required by problem statement.
- Prevents user confusion during async operations.
- Improves perceived performance.
- Enables better debugging and resilience.

---

## 13. JWT-Based Authentication Handling

**Decision:** Stored JWT in localStorage and injected into every request.

**Why:**
- Matches provided authentication scheme.
- Keeps frontend stateless.
- Simplifies API integration.
- Enables consistent tenancy validation.

---

## 14. Row-Level Tenancy Enforcement

**Decision:** Enforced userId === jwt.sub in API layer.

**Why:**
- Critical scoring requirement.
- Prevents cross-user data access.
- Aligns with backend contract.
- Ensures security correctness.

---

## 15. Performance Optimization Strategy

**Decision:** Focused on lightweight components and minimal re-renders.

**Why:**
- Required Lighthouse score ≥ 90.
- Avoided heavy libraries.
- Used memoization where needed.
- Reduced unnecessary DOM updates.

---

## 16. CSS Modules for Styling

**Decision:** Used CSS Modules instead of global CSS or frameworks.

**Why:**
- Scoped styles prevent conflicts.
- Keeps styles maintainable in large components.
- Lightweight compared to full CSS frameworks.
- Works well with Vite build optimization.

---

## 17. Component-Based Architecture

**Decision:** Broke UI into reusable, isolated components.

**Why:**
- Improves code readability and reusability.
- Enables independent testing.
- Aligns with React best practices.
- Reduces complexity in large flows.

---

## 18. Separation of Concerns

**Decision:** Organized code into:
- components/
- hooks/
- services/
- utils/

**Why:**
- Clear separation of logic layers.
- Easier debugging and scaling.
- Maintains clean architecture.
- Improves onboarding for reviewers.

---

## 19. Deployment Strategy (Vercel + API Proxy)

**Decision:** Used Vercel with API routes fallback.

**Why:**
- Simplifies deployment (single platform).
- No separate backend hosting required.
- Handles routing issues in SPA.
- Ensures reviewers can access app reliably.

---

## 20. Developer Experience Optimization

**Decision:** Prioritized fast builds, clear structure, and minimal setup.

**Why:**
- Hackathon time constraints.
- Easier debugging and iteration.
- Reduces cognitive load during development.
- Improves code quality under time pressure.

---

## Conclusion

The architecture prioritizes:
- **User experience over raw data display**
- **Performance and reliability**
- **Strict adherence to constraints**
- **Clean, scalable frontend design**

The system is designed not just to display trading data, but to guide users toward behavioral insight and improvement.
