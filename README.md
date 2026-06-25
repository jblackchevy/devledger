# DevLedger

Open-source real estate development cost control for small development teams.

Built for firms managing LIHTC, HTC, ITC, and mixed-income deals who need Northspyre-level functionality without Northspyre pricing (~$12-15K/year/project).

**License:** AGPL-3.0  
**Status:** Pre-development — PRD complete, build starting

---

## What It Does

- Budget tracking (Anticipated Cost Report, live committed/invoiced/available view)
- Vendor & contract management with COI compliance tracking
- Invoice processing — drag-and-drop PDF + Claude AI extraction
- Draw package assembly with custom template builder
- Cost certification tracking (LIHTC eligible basis, HTC QREs, ITC qualified energy property)
- AI-powered lien waiver validation
- Token-based lender/auditor portals (no login required)

## Stack

Next.js 14 · TypeScript · Prisma · PostgreSQL (Neon) · shadcn/ui · Tailwind · Cloudflare R2 · Anthropic API

## Infrastructure Cost

~$30–40/month total (Vercel Pro + Anthropic API). No per-seat licensing.

## Documentation

- [Product Requirements Document](docs/PRD.md) — full feature spec, MVP scope, data model, competitive analysis

## Getting Started

Coming soon — scaffold in progress.

## License

AGPL-3.0. See [LICENSE](LICENSE).
