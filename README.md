# FandomVerse

Interactive fandom-universe site with a space-themed monolith home, category browsing, title details, favourites, notes, and GitHub Pages deployment.

## This revision
- Centered monolith shatter transition with a roughly one-second zoom/shatter before navigation.
- Small press/fade transitions for buttons and a subtle page-enter transition on navigation.
- Monolith cover images are cropped into consistent portrait artwork and aligned with `object-fit: cover`.
- Monolith platforms and labels remain attached to each moving monolith.
- Category cards use the cleaned portrait assets where the previous screenshot-style monolith images were being reused.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

The included GitHub Actions workflow publishes the Vite `dist/` build to GitHub Pages.
