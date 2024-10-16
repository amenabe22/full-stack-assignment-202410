# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend application
COPY . .

# Expose the frontend port
EXPOSE 3344

# Start the frontend server
CMD ["npm", "run", "dev"]
