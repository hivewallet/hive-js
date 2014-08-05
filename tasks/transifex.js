var async = require('async')
var fs = require('fs')
var request = require("request")

var BASE_URL = "https://www.transifex.com/api/2/project/hive-js/"
var PROJECT_URL = BASE_URL + "?details"
var authHeader = "Basic " + new Buffer(process.env.TRANSIFEX_USER + ":" + process.env.TRANSIFEX_PASSWORD).toString("base64");

function languageUrl(language) {
  return BASE_URL + "language/" + language + "/?details"
}

function translationUrl(language) {
  return BASE_URL + "resource/translation/translation/" + language + "/?file"
}

function get(url, options, callback) {
  if(typeof options === 'function') {
    callback = options
    options = {}
  }

  options.url = url
  options.headers = { "Authorization": authHeader }
  if(options.json == undefined) options.json = true

  request(options, function(error, response, body) {
    if (error) return callback(error);

    if (response.statusCode !== 200) {
      return callback(new Error(url + " returned " + response.statusCode))
    }

    callback(null, body)
  })
}

function pull(done) {
  console.log('fetching available languages...')

  completePercentages = {}

  get(PROJECT_URL, function(err, project){
    if(err) return done(err)

    async.filter(project.teams, function(language, callback){
      get(languageUrl(language), function(err, translation){
        if(err) {
          console.error(err.message);
          console.error(err.stack)
          return callback(false)
        }

        var completed_percentage = Math.round(translation.translated_segments * 100 / translation.total_segments)
        var include = completed_percentage >= 90
        if(include) {
          completePercentages[language] = completed_percentage
        }

        callback(include)
      })
    }, updateTranslations)
  })

  function updateTranslations(languages) {
    async.parallel(languages.map(function(language){
      return updateTranslation(language)
    }), done)
  }

  function updateTranslation(language){
    return function(callback){
      get(translationUrl(language), { json: false }, function(err, translation){
        if(err) return callback(err);

        var filename = "./app/lib/i18n/translations/" + language.toLowerCase().replace('_', '-') + ".json"
        fs.writeFile(filename, translation, function(err){
          if(err) {
            console.error('Failed to update', filename)
            return callback(err)
          }

          console.log(language, 'updated. Complete percentage:', completePercentages[language] + '%')
          callback()
        })
      })
    }
  }
}

module.exports = {
  pull: pull
}
