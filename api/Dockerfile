FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./ 
RUN npm ci --only=production

COPY . .

# Let PORT be configured at runtime (compose sets 3001)
ENV PORT=3001
CMD ["node", "index.js"]
