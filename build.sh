#!/bin/sh

(cd pages/profile; npm link)
npm link hive-profile
browserify index.js -t ractify pages/*/**.js > public/bundle.js
sheetify index.css > public/stylesheets/bundle.css
