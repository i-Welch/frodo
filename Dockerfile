# Build stage
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY tsconfig.json ./
COPY src/ ./src/
RUN bun build src/index.ts --target=bun --outdir=dist

# Production stage
FROM oven/bun:1-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY legal/ ./legal/
RUN addgroup --system --gid 1001 app && adduser --system --uid 1001 --ingroup app app
USER app
EXPOSE 3000
CMD ["bun", "dist/index.js"]
