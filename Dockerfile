# FROM node:16.14.0-alpine3.15
FROM node@sha256:425c81a04546a543da824e67c91d4a603af16fbc3d875ee2f276acf8ec2b1577
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
# COPY . .
EXPOSE 3000
CMD [ "yarn", "start"]