FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist/vhodly-app/browser /app/browser
EXPOSE 3000
ENV PORT=3000
CMD ["sh", "-c", "serve browser -s -l ${PORT}"]