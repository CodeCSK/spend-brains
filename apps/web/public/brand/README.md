# Spendbrains brand assets

Drop exported logo files **here** (`apps/web/public/brand/`). The app loads them automatically.

## Required files

| File | Format | Size / notes |
|------|--------|--------------|
| `logo-mark.svg` | SVG | Square artboard; octopus + brain mark; works at 32×32 |
| `logo-mark-mono.svg` | SVG | Single color (lavender `#6a428a` or `#1a1122`) for light backgrounds |
| `logo-lockup.svg` | SVG | Mark + “Spendbrains” wordmark, horizontal |
| `logo-lockup-on-dark.svg` | SVG | Light mark + wordmark for dark backgrounds |
| `logo-mark-512.png` | PNG | 512×512, transparent — source for favicon generators |
| `favicon.ico` | ICO | 32×32 (copy to `public/favicon.ico`) |
| `apple-touch-icon.png` | PNG | 180×180 (copy to `public/apple-touch-icon.png`) |

**Optional:** `logo-mark@2x.png` (256×256) for crisp retina fallback if SVG is complex.

After adding files, reload the dev server. `AppLogo` uses `logo-mark.svg`; `index.html` uses favicon paths.

## Free tools to create logos

| Tool | Best for | Free tier | Export |
|------|----------|-----------|--------|
| [Figma](https://figma.com) | Custom octopus + brain (recommended) | Yes (personal) | SVG, PNG |
| [Inkscape](https://inkscape.org) | Free desktop vector editor | Fully free | SVG, PNG |
| [Canva](https://canva.com) | Quick concepts, templates | Yes (limited) | PNG; SVG on Pro |
| [Adobe Express](https://express.adobe.com) | Simple logo maker | Yes (limited) | PNG, SVG |
| [SVG Repo](https://www.svgrepo.com) | Octopus/brain icon **bases** (check license) | Free icons | SVG |
| [RealFaviconGenerator](https://realfavicongenerator.net) | Favicon pack from your PNG | Free | ICO, PNG |

**Suggested workflow:** Sketch on paper → draw in **Figma** or **Inkscape** → export SVG → run **RealFaviconGenerator** with `logo-mark-512.png`.

## Brand colors (already in app)

Use `--color-lavender-purple-*` from `src/styles/tokens.css` — primary `#6a428a`, text `#1a1122`.

## Concept

**Spendbrains** — octopus with a brain in place of its head. Keep the mark simple enough to read at favicon size (16–32px).
