# RRM Industrial Rubber

This repository now contains the first implementation slice for a B2B industrial rubber platform focused on:

- A professional public catalog for rubber products and variants
- Product detail pages with 3D-viewer placeholders and application context
- Quote-first customer intake instead of public price display
- A server-gated owner workspace for private pricing, chemistry, and cost controls
- Prisma schema groundwork for products, customers, RFQs, quotes, costs, manufacturing records, and competitor intelligence
- CSV normalization helpers for bulk product imports

## Current Routes

- `/` public home page
- `/products` catalog listing
- `/products/[slug]` product detail pages
- `/industries` industry/application entry page
- `/rfq` quote workflow surface
- `/owner-access` owner sign-in page
- `/admin` protected owner workspace shell

## Environment Setup

Copy `.env.example` to `.env` and update the values before production use.

```bash
cp .env.example .env
```

For local development, the repository now includes a `compose.yaml` file that starts PostgreSQL on the same `DATABASE_URL` used by Prisma.

```bash
docker compose up -d postgres
```

Required variables:

- `DATABASE_URL`
- `OWNER_ACCESS_CODE`
- `SESSION_SECRET`

## Development

Fastest local entrypoint:

```bash
python start.py
```

`start.py` will:

- create `.env` if it is missing
- fill in local defaults for required env vars
- install Node dependencies when needed
- start a Prisma-managed local PostgreSQL server when the configured local database is down
- fall back to the bundled PostgreSQL container when Docker Compose is available
- run `prisma db push`
- launch `npm run dev`

If Docker is not installed, `start.py` will still work through Prisma's built-in local Postgres support or with any already-running PostgreSQL server that matches `DATABASE_URL`.

Manual steps are still available if you prefer them:

Install dependencies and start the app:

```bash
npm install
npx prisma db push
npm run dev
```

If you are using the included local PostgreSQL container, wait for it to become healthy before running `npx prisma db push`.

Open `http://localhost:3000`.

## Validation Commands

```bash
npm run lint
npm run build
npm run db:validate
```

Prisma 7 uses `prisma.config.ts` for datasource URLs. The schema is stored at `prisma/schema.prisma`.

## Data Foundation

Current implementation uses typed seed data in `src/lib/site-data.ts` to drive the public pages and owner dashboard preview.

The database contract is defined in `prisma/schema.prisma` for:

- Products, variants, and dimensions
- Product assets and regional price books
- Customers, RFQs, and quotes
- Internal cost entries
- Owner-only manufacturing records
- Private competitor tracking
- Import batches

CSV normalization helpers live in `src/lib/imports/csv.ts`.

## Next Recommended Slice

1. Add Prisma client wiring and connect public/admin flows to the database.
2. Persist RFQs and customer records instead of using static preview content.
3. Replace the 3D placeholder with uploaded GLB/GLTF assets.
4. Add admin modules for products, customers, quotes, and private manufacturing notes.
