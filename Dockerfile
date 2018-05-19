FROM node:8.10.0-alpine

WORKDIR /usr/src/build
COPY . .
RUN yarn install && yarn build

# Set a working directory
WORKDIR /usr/src/app

RUN mv /usr/src/build/build/package.json . && mv /usr/src/build/build/yarn.lock .

RUN yarn install --production --no-progress && mv /usr/src/build/build/* . && rm -rf /usr/src/build

# Run the container under "node" user by default
USER node

CMD [ "node", "server.js" ]
