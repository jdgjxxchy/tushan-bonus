FROM node:22-alpine
COPY ./.output/ .
EXPOSE 3000
CMD [ "node", "./server/index.mjs" ]