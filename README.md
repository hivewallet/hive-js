hive-js
=======

Work in progress

## Development

### Grab the source

    git clone git@github.com:weilu/hive-js.git
    cd hive-js
    npm install

### Setup CouchDB

    # while npm install is running, let's install couchdb
    brew install couchdb

    # enable cors
    vim /usr/local/etc/couchdb/local.ini

add the following config:

    [httpd]
    enable_cors = true

    [cors]
    credentials = true
    origins = http://localhost:8080
    headers= accept, authorization, content-type, origin

<!-- separator! -->

    # start couchdb upon login
    ln -sfv /usr/local/opt/couchdb/*.plist ~/Library/LaunchAgents
    # kick it off
    launchctl load ~/Library/LaunchAgents/homebrew.mxcl.couchdb.plist
    open http://127.0.0.1:5984/_utils/index.html

Click on the bottom link "fix this" to create an admin user, say:

> username: admin
> password: password

### Profit

    DB_HOST=127.0.0.1:5984 DB_USER=admin DB_PASSWORD=password gulp
    open http://localhost:8080

