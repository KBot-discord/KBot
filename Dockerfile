FROM node:18-alpine
EXPOSE 8600 8601
WORKDIR /app
COPY package.json ./
RUN apk add --update \
	&& apk add --no-cache ca-certificates \
	&& apk add --no-cache --virtual .build-deps git curl build-base python3 g++ make \
	&& npm i \
	&& apk del .build-deps
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
