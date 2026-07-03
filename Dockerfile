# syntax=docker/dockerfile:1.7

# ----- Base stage (shared by dev and build) --------------------------------
FROM node:22-alpine AS base
WORKDIR /app

# Enable pnpm via corepack; reads `packageManager` from package.json.
RUN corepack enable

# Install all deps (dev + prod) once. Subsequent stages inherit this layer.
COPY package.json pnpm-lock.yaml* ./
RUN pnpm fetch
RUN pnpm install --frozen-lockfile --ignore-scripts

# ----- Build stage (prod bundle + pruned deps) ------------------------------
FROM base AS build
COPY . .
# PUBLIC_* env vars are baked into the bundle by $env/static/public; they
# must be available when `pnpm build` runs, otherwise canonical/OG/sitemap/
# JSON-LD/contact-mailto URLs render empty. Passed as build args from
# docker-compose.prod.yml.
ARG PUBLIC_SITE_URL
ARG PUBLIC_CONTACT_EMAIL
# DATABASE_URL is consumed at module-load by $lib/server/db/client.ts, which
# SvelteKit's postbuild `analyse` step imports to discover server endpoints.
# A placeholder would also work — the build never opens a connection — but
# passing the real value keeps dev and prod build envs identical.
ARG DATABASE_URL
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL} \
	PUBLIC_CONTACT_EMAIL=${PUBLIC_CONTACT_EMAIL} \
	DATABASE_URL=${DATABASE_URL}
RUN pnpm build
COPY .env ./
RUN pnpm prune --prod

# ----- Dev stage (extends base; runs Vite dev server) ------------------------
FROM base AS dev
ENV HOST=0.0.0.0 \
	PORT=5173
COPY . .
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# ----- Runtime stage (slim image that serves the prod bundle) ---------------
FROM node:22-alpine AS runtime
WORKDIR /app

ENV HOST=0.0.0.0 \
	PORT=3000 \
	NODE_ENV=production

# Copy just what the Node server needs at runtime: the build output, the
# production node_modules, and the package manifest.
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Run as the unprivileged `node` user that ships in the base image.
USER node

EXPOSE 3000

CMD ["node", "build"]
