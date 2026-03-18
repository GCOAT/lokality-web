# Project Specification — Lokality

> AI assistants: read this file to understand what you're building. See also `AI_INSTRUCTIONS.md` and `docs/`.

---

## Project Overview

**Lokality** is a location-based digital archive and interactive tour guide platform that enables users to explore destinations through curated tours, historical archives, and educational content. The app combines real-world navigation, multimedia storytelling, and gamified learning to create immersive destination experiences — preserving and sharing the cultural heritage, history, and stories of the places that matter most.

The landing page promotes the Lokality mobile app, currently in beta (TestFlight for iOS). It is based in **St. Croix, USVI**.

---

## People

### Founders

| Name | Role | Email |
|------|------|-------|
| Torhera Durand | Founder | torhera.durand@lokality.co |
| Amali Krigger | Co-Founder | amali.krigger@lokality.co |
| Israel Dennie | Co-Founder | israel.dennie@lokality.co |

### Contact

- **General email:** info@lokality.co

### Social Media

- Instagram (placeholder URL)
- Facebook (placeholder URL)

---

## Pages

### Landing Page

Single-page site with the following sections:

1. **Navbar** — site navigation with anchor links to each section
2. **Hero** — headline + subheadline introducing Lokality, with a primary CTA to join the TestFlight beta
3. **About** — what Lokality is and why it exists (cultural heritage, location-based storytelling, St. Croix roots)
4. **Founders** — professional headshots (placeholder images for now) and short bios for each of the three founders
5. **Sign Up / Newsletter** — email capture form for updates and early access (submits to leads API)
6. **Footer** — social media links (Instagram, Facebook), contact email, copyright/legal

---

## Design Intent

**Deferred.** Infrastructure and scaffolding first — get everything wired up and working before visual design.

- Placeholder content and minimal styling during the scaffolding phase
- A dedicated design pass will happen after end-to-end functionality is verified
- Reference material for the design phase will be added to `design-refs/` later
- No colors, fonts, spacing, or visual polish until the design phase

---

## Features

**Kore tier:** v2 (full-stack — Lambda + DynamoDB + S3 + SES)

### Backend features used

- **Leads API** — newsletter signup form submits email to leads table
- **SES email** — confirmation email sent on signup (dev: SES sandbox; prod: verified sender)
- **Content API** — CMS-lite content blocks loaded from DynamoDB (about text, founder bios, etc.)
- **Presigned URL / S3** — media uploads for founder headshots and other images (admin-only)

### Frontend features

- Single-page landing with section navigation
- Newsletter signup form wired to leads API
- Dynamic content loading from content API (optional — can be static initially)
- Responsive layout (mobile-first)

---

## Constraints

- **Mobile-first** — must work well on phones; primary audience will visit from mobile
- **iOS beta** — TestFlight is the primary CTA; APK available for Android beta testers on request
- **No custom domain yet** — GitHub Pages default URL during scaffolding; custom domain added after design phase
- **WCAG 2.1 AA** — accessibility baseline per Kore standards
- **AWS profile:** `gcoat-admin`, region `us-east-1`
- **No visual polish yet** — structure and API wiring only during scaffolding phase


