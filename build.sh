#!/bin/sh

aperture link
browserify index.js -t ractify > public/bundle.js
sheetify index.css | node rework.js > public/stylesheets/bundle.css
