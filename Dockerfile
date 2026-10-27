FROM docker.io/oven/bun:latest

# Install tools needed to compile native Node.js dependencies.
USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       python3 \
       make \
       g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /work
