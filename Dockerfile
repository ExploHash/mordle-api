# === Build Stage ===

# Use the official Node.js image as the base for the build stage
FROM node:18 AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json /app/

# Install all dependencies including development dependencies
RUN npm ci

# Copy the rest of the project files to the container
COPY . /app/

# Build the TypeScript code
RUN npm run build

# Prune development dependencies
RUN npm prune --production


# === Serve Stage ===

# Use a lightweight Node.js image as the base for the serve stage
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json /app/

# Copy the built files from the build stage
COPY --from=build /app/dist /app/dist

# Copy dependencies from the build stage
COPY --from=build /app/node_modules /app/node_modules

# Copy resources from the build stage
COPY --from=build /app/res /app/res

# Expose the port your server listens on
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]