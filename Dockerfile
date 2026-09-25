# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Set environment variable for production build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ARG API_URL=https://api.katamereka.id
ARG NEXT_PUBLIC_API_URL=https://api.katamereka.id
ARG NEXT_PUBLIC_SITE_URL=https://katamereka.id
ENV API_URL=https://api.katamereka.id
ENV NEXT_PUBLIC_API_URL=https://api.katamereka.id
ENV NEXT_PUBLIC_SITE_URL=https://katamereka.id

RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV API_URL=https://api.katamereka.id
ENV NEXT_PUBLIC_API_URL=https://api.katamereka.id
ENV NEXT_PUBLIC_SITE_URL=https://katamereka.id

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
