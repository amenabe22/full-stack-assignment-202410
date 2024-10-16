# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend application
COPY . .

# Copy the rest of the backend application
COPY prisma ./prisma/

# Expose the backend port
EXPOSE 5545

# Install the correct Prisma query engine for Linux
RUN npx prisma generate
RUN npm run build

# Start the backend server
CMD ["npm", "run", "dev"]
