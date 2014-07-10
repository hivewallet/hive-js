#!/bin/bash

version=$1
sed -E -i '' "s/v([0-9]+[.]{1}){2}[0-9]+/v$version/" app/widgets/sidebar/index.ract
sed -E -i '' "s/(\"version\": \")([^\"]+)/\1$version/" package.json
git commit -am 'bump version'
git tag $version
