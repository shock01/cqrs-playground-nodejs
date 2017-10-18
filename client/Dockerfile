FROM node

ENV SERVICE_NAME client
ENV DB_USER user
ENV DB_PASSWORD password
ENV DB_HOST host
ENV PORT 8000

RUN rm -rf node_modules && \
    apt-get update -qq && \
    apt-get install -y -qq libzmq-dev mariadb-client

ADD app/package.json /tmp/package.json

RUN cd /tmp && npm install

RUN npm install --silent -g supervisor

RUN mkdir -p /usr/local/$SERVICE_NAME && cp -a /tmp/node_modules /usr/local/$SERVICE_NAME

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR /usr/local/$SERVICE_NAME

ADD app .

EXPOSE $PORT

CMD ["sh", "start.sh"]