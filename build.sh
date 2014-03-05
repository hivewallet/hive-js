#!/bin/sh

aperture open
browserify index.js -t ractify pages/*/**.js > public/bundle.js
sheetify index.css | node rework.js > public/stylesheets/bundle.css
