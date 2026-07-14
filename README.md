# Extended Bandoneon

A full-stack multimedia platform documenting extended techniques of the bandoneon — built as part of a PhD research project at the Sibelius Academy, Helsinki. Combines a curated sound bank, video demonstrations, academic articles, and a podcast into a scalable digital archive.

**Live site:** [extendedbandoneon.com](https://www.extendedbandoneon.com/)

## Features

- **Sound bank** — searchable, tag-filtered audio library with cursor-based pagination and infinite scroll, lazy-loaded custom audio player ([WaveSurfer.js](https://wavesurfer.xyz/)) with waveform visualization and client-side blob streaming for downloads.
- **Articles & techniques** — structured content for extended bandoneon techniques and research articles, with embedded video and image support.
- **Podcast** — sortable episode listing with embedded audio players.
- **Authentication** — email/password registration with email verification, JWT-based sessions, and password reset flow.
- **Admin dashboard** — protected content management for sound and article uploads, with WAV→MP3 conversion on ingestion.
- **Multilingual** — English, Spanish and Finnish locales.
- **SEO** — SSR/SSG via Next.js, JSON-LD structured data (`AudioObject`, `Article`), auto-generated sitemap.
- **Tested** — Jest unit and integration tests covering API routes, the database layer, and utilities.

## Tech stack

**Frontend:** `Next.js 15` (App Router) · `React 19` · `TypeScript` · `Tailwind CSS` · `DaisyUI` · `Framer Motion` · `TanStack Query`

**Backend:** `Next.js API routes` · `MySQL` (`mysql2`) · `JWT` (`jsonwebtoken`, `bcryptjs`) · `Cloudinary` (audio/image storage) · `fluent-ffmpeg` (audio conversion) · `Resend` + `react-email` (transactional email)

**Testing & tooling:** `Jest` · `ESLint` · `next-sitemap`

## Getting started

```bash
git clone https://github.com/manuK1777/extended-bandoneon.git
cd extended-bandoneon
npm install
```

Create a `.env.local` with the required environment variables (MySQL connection, Cloudinary credentials, JWT secret, Resend API key), then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test          # full Jest suite
npm run test:db    # database layer tests only
```

## Project structure

```
app/
├── (with-header-footer)/   # public pages: soundbank, articles, techniques, podcast, about
├── admin/                   # protected content-management dashboard
├── api/                      # route handlers: auth, sounds, articles, filters, admin uploads
└── es/                        # Spanish locale routes

components/                    # UI components (auth, dashboard, navigation, audio player...)
lib/
├── db/                         # MySQL connection + data models
└── wavesurfer/                  # audio player integration

utils/                           # cloudinary, auth, audio, tag helpers
__tests__/                        # Jest unit + integration tests
```

---

*Independent project — Sibelius Academy of Helsinki, PhD research on extended bandoneon techniques.*
