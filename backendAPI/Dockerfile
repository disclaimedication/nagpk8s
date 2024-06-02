## Below file uses multistage build to reduce the size of docker image 
# Using Node as the ase image
FROM node:18-alpine AS builder

# Setting working directory
WORKDIR /app

# Copying dependencies
COPY package*.json ./

# Installing dependencies
RUN npm install

# Copying the main application code
COPY server.js .

## Here is the second image
FROM node:18-alpine

# Setting working directory
WORKDIR /app

# Copying only production dependencies and application code
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app .

# Exposing port and starting teh application
EXPOSE 8080
CMD [ "npm", "start" ]
