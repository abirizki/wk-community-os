# WK Community OS - Deployment Environment
# This Dockerfile creates a standardized environment for managing the
# Google Apps Script project using `clasp`. It does not run the application itself,
# as the application is serverless and runs on Google's infrastructure.

# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install clasp globally
RUN npm install -g @google/clasp

# Copy the application source code into the container
COPY . .

# Copy the clasp configuration file (must be generated outside the container first)
# This file contains the scriptId and is created after `clasp clone` or `clasp create`.
COPY .clasp.json .

# The default command does nothing. This container is meant to be used interactively
# or with specific commands (e.g., `docker run --rm -v $(pwd):/usr/src/app wk-os-dev-env clasp push -f`).
CMD [ "bash" ]