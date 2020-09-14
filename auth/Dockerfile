# a base stage for all future stages with only prod dependencies and
# no code yet, cannot use alpine for testing
FROM node:14 as base
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production \
  && npm cache clean --force
ENV PATH /app/node_modules/.bin:$PATH

# a dev stage. to test run the following command
# docker run registry.gitlab.com/microservice_example/ticketing/auth:dev npm run test:ci 
FROM base as dev
ENV NODE_ENV=development
RUN npm install --only=development
COPY . .
CMD ["npm","start"]

# get typescript to generate js files
FROM dev as build
RUN tsc

# build as small an image as possible and copy the generated js files from bbuild stage
# only an idiot uses npm to run in production
FROM node:14-alpine as prod
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production \
  && npm cache clean --force
ENV PATH /app/node_modules/.bin:$PATH
COPY --from=build /app/dist .
CMD ["node", "index.js"]