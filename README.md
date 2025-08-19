# blogdatqbox (Next.js + Bun + Prisma + Postgres)
UI estilo blog de OpenAI (hero, tarjetas, dark mode), API v1 con JWT, newsletter, SSR + TanStack.

## Setup rápido
cp .env.example .env.local
bun install
bun run prisma:generate
bun run prisma:migrate --name init
bun run db:seed
bun run dev

## Docker (enganche a tu Postgres en app-network)
docker compose -f docker-compose.override.yml up -d --build
