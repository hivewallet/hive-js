hive-js
=======

Work in progress

## Development

    git clone git@github.com:weilu/hive-js.git
    cd hive-js
    npm install
    DB_HOST=[DB_HOST] DB_USER=[DB_USER] DB_PASSWORD=[DB_PASSWORD] gulp

    # cloudant CORS doesn't accept localhost as an origin
    # https://gist.github.com/chewbranca/0f690f8c2bfad37a712a
    sudo echo '127.0.0.1	local.dev' >> /etc/hosts
    open local.dev:8080
