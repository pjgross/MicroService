FROM node:14-alpine
ENV CI=true
WORKDIR /app
COPY ./package.json ./
RUN npm install && npm cache clean --force
COPY ./ ./

CMD ["npm", "run", "dev"]