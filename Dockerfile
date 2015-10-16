FROM ubuntu

# Install requirements for compiling ZeroMQ
RUN apt-get update -y && apt-get install -y \
    git \
    libtool \
    pkg-config \
    build-essential \
    autoconf \
    automake \
    uuid-dev \
    wget \
    libzmq-dev

# Compile latest libsodium and ZeroMQ 4.1.3
WORKDIR /tmp
RUN git clone git://github.com/jedisct1/libsodium.git && cd libsodium && ./autogen.sh && ./configure && make install && ldconfig && cd .. && rm -rf libsodium
RUN wget http://download.zeromq.org/zeromq-4.1.3.tar.gz && tar -xvf zeromq-4.1.3.tar.gz && cd zeromq-* && ./autogen.sh && ./configure && make install && ldconfig && cd .. && rm -rf zeromq*

# Install and set up Node and Npm
RUN apt-get install -y \
    nodejs \
    npm

RUN ln -s /usr/bin/nodejs /usr/bin/node

# Clean up APT when done.
RUN apt-get purge -y \
    git \
    libtool \
    pkg-config \
    build-essential \
    autoconf \
    automake \
    uuid-dev \
    wget

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy testable code
WORKDIR /code
COPY . /code

# Install Node deps
RUN npm install

# Run tests
CMD ["npm", "test"]
