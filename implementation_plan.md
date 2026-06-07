# Add 3D Visual Integration

## Goal Description
Integrate the `triple_attractor_flower_sim.html` 3D simulation into the portfolio site. Ensure the HTML is served statically via Next.js and displayed within the "3D Lab" section.

## User Review Required
- Verify the 3D visual loads correctly after restarting the dev server.
- Adjust iframe dimensions or styling if needed for better appearance.

## Open Questions
- None.

## Proposed Changes
### Component
- [NEW] [TripleAttractor.tsx](file:///c:/Users/k%20bhageeratha%20reddy/OneDrive/Documents/3d-portfolio/app/components/TripleAttractor.tsx)

### Page Update
- [MODIFY] [app/page.tsx](file:///c:/Users/k%20bhageeratha%20reddy/OneDrive/Documents/3d-portfolio/app/page.tsx)
  - Import `TripleAttractor`.
  - Replace the placeholder `ParallaxCard` visual with `<TripleAttractor />` inside the lab-feature section.

### Static Asset
- Ensure `triple_attractor_flower_sim.html` exists in `public/` (already present).

## Verification Plan
- Run `npm run dev` and navigate to `http://localhost:3000`.
- Confirm the iframe loads the simulation without 404.
- Check console for errors.

### Automated Tests
- None applicable.

### Manual Verification
- Visual inspection of the 3D simulation.
- Ensure responsiveness on different screen sizes.
