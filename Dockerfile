FROM ubuntu:20.04

# Use bash for the shell
SHELL ["/bin/bash", "-c"]

WORKDIR /usr/src/app

# Install Node v15.12.0
ENV NODE_VER="15.12.0"
RUN ARCH= && \
    dpkgArch="$(dpkg --print-architecture)" && \
    case "${dpkgArch##*-}" in \
    amd64) ARCH='x64';; \
    ppc64el) ARCH='ppc64le';; \
    s390x) ARCH='s390x';; \
    arm64) ARCH='arm64';; \
    armhf) ARCH='armv7l';; \
    i386) ARCH='x86';; \
    *) echo "unsupported architecture"; exit 1 ;; \
    esac && \
    echo "Etc/UTC" > /etc/localtime && \
    apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates wget python && \
    cd ~ && \
    wget -q https://nodejs.org/download/release/v$NODE_VER/node-v$NODE_VER-linux-$ARCH.tar.gz && \
    tar xf node-v$NODE_VER-linux-$ARCH.tar.gz && \
    rm node-v$NODE_VER-linux-$ARCH.tar.gz && \
    mv node-v$NODE_VER-linux-$ARCH /opt/node

ENV PATH="${PATH}:/opt/node/bin"

#install Yarn
RUN npm install -g yarn

#testing
RUN cat /etc/hosts

#copy over repo
COPY package.json yarn.lock /usr/src/app/
COPY src/prisma /usr/src/app/src/

#make .env file with docker container hostname
RUN echo DATABASE_URL=\'postgresql://postgres:postgres@db:5432/postgres?schema=public\' > .env

#Build App
RUN yarn install

COPY . .

RUN mkdir public/uploads
RUN yarn prisma generate
RUN chmod 777 ./setup.sh

ENTRYPOINT ["./setup.sh"]
