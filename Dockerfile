FROM node:22-slim
COPY .output/ .
EXPOSE 3000
CMD [ "node", "./server/index.mjs" ]