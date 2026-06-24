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
RUN pnpm build
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
