# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.14.0

################################################################################
# Stage 1: Base settings for the Node environment
FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

################################################################################
# Stage 2: Install ALL dependencies (including devDependencies like Vite/Refine CLI)
FROM base as development-deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps --no-save

################################################################################
# Stage 3: Compile the application into static HTML/JS/CSS assets
FROM development-deps as build

# 1. Define the build arguments Vite needs during compilation
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_UPLOAD_PRESET
ARG VITE_CLOUDINARY_UPLOAD_URL
ARG VITE_BACKEND_BASE_URL

# 2. Assign those arguments to environment variables so Vite can read them
ENV VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME
ENV VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET
ENV VITE_CLOUDINARY_UPLOAD_URL=$VITE_CLOUDINARY_UPLOAD_URL
ENV VITE_BACKEND_BASE_URL=$VITE_BACKEND_BASE_URL

COPY . .
RUN npm run build

################################################################################
# Stage 4: Install ONLY production dependencies (includes the 'serve' utility)
FROM base as production-deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm install --omit=dev --legacy-peer-deps --no-save

################################################################################
# Stage 5: Final Production Runner using Vercel's 'serve'
FROM base as final

# Use production node environment
ENV NODE_ENV production

# Run the application as a non-root user for container security
USER node

# Copy package.json so the start scripts are visible to npm
COPY package.json .

# Copy production packages (keeps image slim)
COPY --from=production-deps /usr/src/app/node_modules ./node_modules

# Copy the static folder built by Vite/Refine
COPY --from=build /usr/src/app/dist ./dist

# Expose port 5173 to match the serve script configuration
EXPOSE 5173

# Run the 'serve' command defined in your package.json script
CMD ["npm", "run", "start"]
