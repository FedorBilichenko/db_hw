FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install -y postgresql-10
RUN apt-get install -y curl gnupg2

ENV PGVER 10
RUN echo "host all  all    0.0.0.0/0  md5" >> /etc/postgresql/$PGVER/main/pg_hba.conf
RUN echo "listen_addresses='*'" >> /etc/postgresql/$PGVER/main/postgresql.conf
EXPOSE 5432

COPY ./ /usr/src/app

USER postgres
RUN /etc/init.d/postgresql start &&\
  psql --command "CREATE USER bilichenkofv WITH SUPERUSER PASSWORD 'Klass575428';" &&\
  createdb -O bilichenkofv technopark &&\
  psql < /usr/src/app/db/schema.sql &&\
  /etc/init.d/postgresql stop

USER root

RUN curl -sL https://deb.nodesource.com/setup_11.x | bash
RUN apt-get install -y nodejs

WORKDIR /usr/src/app

RUN npm install

EXPOSE 5000
CMD service postgresql start && npm start