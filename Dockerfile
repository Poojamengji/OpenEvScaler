FROM node:20-slim

# Install Python 3 and pip for OpenEnv Evaluation
RUN apt-get update && \
    apt-get install -y python3 python3-pip python-is-python3 && \
    rm -rf /var/lib/apt/lists/*
RUN ln -sf /usr/bin/python3 /usr/bin/python || true
RUN ln -sf /usr/bin/python3 /usr/local/bin/python || true

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Install inference dependencies
RUN pip3 install --no-cache-dir requests openai --break-system-packages || pip3 install --no-cache-dir requests openai

# Build the frontend (Vite)
RUN npm run build

# Ensure production environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose the server port
EXPOSE 3000

# Start the server (which serves build + API)
CMD ["npm", "start"]
