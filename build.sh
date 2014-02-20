#!/bin/sh

aperture open
browserify index.js -t ractify pages/*/**.js > public/bundle.js
node rework.js index.css > public/stylesheets/bundle.css
