FROM node:20-slim

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build the frontend (Vite)
RUN npm run build

# Ensure production environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose the server port
EXPOSE 3000

# Start the server (which serves build + API)
CMD ["npm", "start"]
