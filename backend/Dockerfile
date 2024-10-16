# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

RUN npm i ts-node typescript

# Copy the rest of the backend application
COPY . .

# Copy the rest of the backend application
COPY prisma ./prisma/

# Expose the backend port
EXPOSE 5000

# Install the correct Prisma query engine for Linux
RUN npx prisma generate

# Start the backend server
CMD ["npm", "run", "dev"]
