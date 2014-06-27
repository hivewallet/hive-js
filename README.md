hive-js
=======

Work in progress

## Development

### Grab the source

    git clone git@github.com:hivewallet/hive-js.git
    cd hive-js
    npm install

### Setup CouchDB

    brew install couchdb

__Enable CORS__

add the following config in `/usr/local/etc/couchdb/local.ini`:

    [httpd]
    enable_cors = true

    [cors]
    credentials = true
    origins = http://localhost:8080
    headers = accept, authorization, content-type, origin

If you want to be able to access the app from a mobile device on your local network, remember to add your host machine IP or alias to the cors origins list.

    origins = http://localhost:8080, http://192.168.1.109:8080, http://alice-computer.local:8080

__Start CouchDB__

    # start couchdb upon login
    ln -sfv /usr/local/opt/couchdb/*.plist ~/Library/LaunchAgents
    # kick it off
    launchctl load ~/Library/LaunchAgents/homebrew.mxcl.couchdb.plist
    open http://127.0.0.1:5984/_utils/index.html

Click on the bottom link "fix this" to create an admin user, say:

    username: admin
    password: password

### Profit

    DB_HOST=127.0.0.1 DB_PORT=5984 DB_USER=admin DB_PASSWORD=password COOKIE_SALT=secret PROXY_URL=https://hive-proxy.herokuapp.com npm run dev
    open http://localhost:8080

### Live Reload (Optional)

This project has js & css live reload setup. If you wish to use it to boost your productivity, head over to chrome store and download [the LiveReload extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei). After turning it on, you'd never need to hit the refresh button anymore.

## iOS Development

Hive can also be packaged as an iOS app using Apache Cordova. To run locally, make sure you've got XCode installed. Everything is contained within the `./cordova` directory. To run the app inside the iOS Simulator;

`npm install -g cordova`
`gulp build`
`cd ./cordova`
`cordova run ios --emulator` (or `--device`)

Obviously we can't start a server or CouchDB within the iOS app, so it instead makes requests to the Heroku endpoint.

## Contributing

### Instructions

1. Fork the repo
2. Push changes to your fork
3. Create a pull request


### Running the test suite

    # run both server and client tests
    DB_HOST=127.0.0.1 DB_PORT=5984 DB_USER=admin DB_PASSWORD=password COOKIE_SALT=secret npm test

    # just server
    DB_HOST=127.0.0.1 DB_PORT=5984 DB_USER=admin DB_PASSWORD=password COOKIE_SALT=secret npm run test-server

    # just client
    npm run test-client

