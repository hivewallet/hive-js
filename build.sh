#!/bin/sh

node_modules/browserify/bin/cmd.js -t ractify pages/*.js > public/bundle.js
