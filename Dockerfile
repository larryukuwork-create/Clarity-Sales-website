# Multistage build for high-performance and lightweight footprints on Google Cloud Run
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency configs first to cache layers
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the entire codebase
COPY . .

# Build the static frontend bundle & compile full-stack server
RUN npm run build

# Remove development source modules to slim down the production image
RUN npm prune --production

# Final lightweight runner image
FROM node:20-alpine

WORKDIR /app

# Enable high-security least-privileged non-root user
USER node

# Copy package config and only required items for starting the app 
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/index.html ./index.html

# Configure Default Production Variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose standard Cloud Run ingress port
EXPOSE 8080

# Launch server
CMD ["npm", "run", "start"]
