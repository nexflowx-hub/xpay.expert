# XPay.Expert — Animated Modular Cube Hero

## Objective

Replace the current world-map visual in the public landing-page hero with a real-time 3D modular cube inspired by the visual rhythm of Resend's homepage, without copying its implementation or proprietary assets.

The component is implemented at:

```text
src/components/landing/animated-cube-hero.tsx
```

It provides:

- continuous slow rotation;
- pointer-responsive parallax;
- floating movement;
- periodic coupling and decoupling of 64 mini-cubes;
- metallic navy material;
- violet, blue and cyan emissive edges;
- animated light pulses;
- bloom, noise and vignette post-processing;
- `prefers-reduced-motion` support;
- a CSS fallback when WebGL is unavailable;
- accessible descriptive text.

## Important visual note

The supplied PNG is a high-quality two-dimensional reference. A flat image cannot provide genuine independent movement, perspective changes or physical separation of its internal blocks. The component therefore reconstructs the object as real 3D geometry while preserving the reference's visual language: dark metallic surfaces, modular mini-cubes, blue-violet illumination and suspended motion.

Keep the PNG as the visual reference for calibration. Do not try to cut it into 2D layers and simulate a fake explosion.

## Dependencies

The feature branch already adds:

```json
{
  "@react-three/drei": "^10.7.7",
  "@react-three/fiber": "^9.6.1",
  "@react-three/postprocessing": "^3.0.4",
  "three": "^0.185.1",
  "@types/three": "^0.185.1"
}
```

Run:

```bash
bun install
```

Commit the updated `bun.lock` after installation.

## Landing-page integration

File:

```text
src/components/landing/landing-page.tsx
```

Add this import beside the other landing imports:

```tsx
import { AnimatedCubeHero } from "@/components/landing/animated-cube-hero";
```

Inside `function Hero()`, replace the current right-side world-map/code visual with:

```tsx
{/* Right: animated modular cube */}
<motion.div
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    duration: 0.8,
    ease: [0.16, 1, 0.3, 1],
    delay: 0.15,
  }}
  className="relative flex items-center"
>
  <AnimatedCubeHero className="h-[420px] w-full sm:h-[500px] lg:h-[560px]" />
</motion.div>
```

The complete hero grid should remain two columns on desktop:

```tsx
<div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,1.1fr)] lg:items-center lg:gap-10 lg:pb-24 lg:pt-24">
  {/* existing left title, subtitle and CTAs */}
  {/* new AnimatedCubeHero on the right */}
</div>
```

Do not move or rewrite the existing hero title, subtitle or CTA logic unless explicitly requested.

## Remove obsolete hero-only code

After replacing the right-hand visual, remove these declarations only when code search confirms that they are no longer used elsewhere:

- `WorldMap`
- `CurrencyFloats`
- `LivePaymentToast`
- hero-only map constants and helpers
- hero-only code block beneath the map, when the product team confirms it should disappear

Do not remove shared components such as `GradientBorder` or `CodeBlock` if another landing section still uses them.

## Interaction behavior

The animation uses a 14-second cycle:

1. assembled and slowly rotating;
2. progressive separation of the mini-cubes;
3. short expanded state;
4. progressive reassembly;
5. stable assembled state.

Pointer movement changes the cube's viewing angle subtly. It must never behave like unrestricted orbit controls.

The animation must not:

- spin rapidly;
- permit users to lose the intended camera framing;
- flash aggressively;
- block the hero copy;
- create horizontal overflow;
- run at full quality on unsupported devices;
- ignore reduced-motion preferences.

## Performance contract

Validate on desktop and mobile.

Required checks:

```bash
bun run lint
bunx tsc --noEmit
bun run build
```

Browser checks:

- no hydration warnings;
- no WebGL errors;
- no failed shader compilation;
- no horizontal overflow at 360 px;
- hero remains readable at 390 × 844;
- cube remains fully visible at 1440 × 900;
- fallback renders when WebGL is unavailable;
- reduced motion produces a stable composition;
- GPU usage drops when the tab is not visible, as handled by the browser animation loop.

## Tuning constants

The main constants are at the top of the component:

```ts
const CUBE_SIZE = 4;
const CUBELET_SIZE = 0.62;
const CUBELET_GAP = 0.12;
```

Recommended limits:

- Keep `CUBE_SIZE` at 4 for 64 mini-cubes on the public homepage.
- Do not increase to 5 (125 mini-cubes) without profiling low-power devices.
- Keep Canvas DPR capped at `1.6`.
- Keep post-processing multisampling disabled because DPR and bloom already provide sufficient quality.

## Acceptance criteria

The integration is accepted when:

1. The original hero title and subtitle remain on the left.
2. The modular cube occupies the right side as the principal hero visual.
3. Rotation is slow and premium.
4. Mini-cubes separate and reconnect smoothly.
5. Violet/blue highlights resemble the supplied reference.
6. No Resend source code or proprietary asset is copied.
7. TypeScript, lint and production build succeed.
8. Mobile and reduced-motion fallbacks work.
