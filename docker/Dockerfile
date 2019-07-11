FROM keymetrics/pm2:10-alpine

COPY . /opt/etl/script-recovery
RUN apk add --no-cache git
RUN npm install -g babel-cli
RUN rm -rf /opt/etl/conf
RUN  cd /opt/etl/script-recovery && npm install
RUN apk add --no-cache tzdata
ENV TZ Africa/Nairobi
EXPOSE 3000

CMD ["pm2-docker", "start", "/opt/etl/script-recovery/pm2.json" ]
