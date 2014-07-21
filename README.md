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

### Testing deployment inside Vagrant

1. [Install Vagrant](http://www.vagrantup.com/downloads.html)
2. symlink the playbook file into place: `ln -s path/to/ansible/repo provisioners`
3. `vagrant up` or `vagrant reload --provision`

## Contributing

### Instructions

1. Fork the repo
2. Push changes to your fork
3. Create a pull request

Pull requests are very welcome. If you want to send us any code, try your best to adhere to our coding guidelines:

- [JavaScript](https://github.com/hivewallet/hive-js/wiki/Hive-JS-coding-style-guide)
- [HTML](https://github.com/hivewallet/hive-js/wiki/Hive-HTML-coding-style-guide)
- [CSS](https://github.com/hivewallet/hive-js/wiki/Hive-CSS-coding-style-guide)
- [Git](https://github.com/hivewallet/hive-js/wiki/Hive-Git-guidelines)

### Running the test suite

    # run both server and client tests
    DB_HOST=127.0.0.1 DB_PORT=5984 DB_USER=admin DB_PASSWORD=password COOKIE_SALT=secret npm test

    # just server
    DB_HOST=127.0.0.1 DB_PORT=5984 DB_USER=admin DB_PASSWORD=password COOKIE_SALT=secret npm run test-server

    # just client
    npm run test-client

### Donation

If you like Hive, you can also send us donations in BTC to 142m1MpXHhymF4aASiWwYohe1Y55v5BQwc

## License

Hive is released under GNU General Public License, version 2 or later.

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
