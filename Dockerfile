FROM node:8.10.0-alpine

WORKDIR /usr/src/build
COPY . .
RUN yarn install && yarn build

# Set a working directory
WORKDIR /usr/src/app

RUN mv /usr/src/build/build/package.json .
RUN mv /usr/src/build/build/yarn.lock .

# Install Node.js dependencies
RUN yarn install --production --no-progress

# Copy application files
RUN mv /usr/src/build/build/* .

RUN rm -rf /usr/src/build

# Run the container under "node" user by default
USER node

CMD [ "node", "server.js" ]
