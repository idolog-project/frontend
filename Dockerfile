# syntax=docker/dockerfile:1

# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Manifests first: a source-only change then reuses the cached install layer.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* at build time, so the key has to be here rather than in
# the Cloud Run service. It ends up in the shipped JS either way — that is what
# a Kakao JavaScript key is, and it is restricted by registered domain, not by
# secrecy. Pass it with --build-arg; without it the app falls back to the
# built-in stand-in map.
ARG VITE_KAKAO_MAP_KEY=""
ENV VITE_KAKAO_MAP_KEY=$VITE_KAKAO_MAP_KEY

RUN npm run build

# ---------- serve ----------
FROM nginx:1.29-alpine

# Not conf.d directly: the image's entrypoint runs envsubst over everything in
# templates/ and writes the result to /etc/nginx/conf.d/default.conf, replacing
# the stock config. That indirection is what lets ${PORT} — which Cloud Run sets
# on the container, and may not be 8080 — reach the listen directive.
COPY nginx.conf /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run overrides this; it is here so `docker run -p 8080:8080` works too.
ENV PORT=8080
# Railway backend service's public origin, for example
# https://backend-production-xxxx.up.railway.app.  Railway overrides this.
ENV BACKEND_URL=http://backend:3000
EXPOSE 8080
