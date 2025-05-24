# Use official Node.js LTS image
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Create uploads folder if needed
RUN mkdir -p uploads

# Expose Cloud Run port
ENV PORT 8080
EXPOSE 8080

# Start app
CMD [ "node", "index.js" ]
