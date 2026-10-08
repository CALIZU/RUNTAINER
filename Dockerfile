# RUNTAINER — all-in-one image
# Build:  docker build -t runtainer .
# Run:    docker run -d -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock runtainer
# (Without the socket mount, RUNTAINER starts in demo mode.)

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --from=build /app/dist ./dist
COPY server ./server
EXPOSE 3000
CMD ["node", "server/index.js"]
