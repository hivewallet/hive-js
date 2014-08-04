var async = require('async')
var fs = require('fs')
var Transifex = require("transifex")

var transifex = new Transifex({
    project_slug: "hive-js",
    credential: process.env.TRANSIFEX_USER + ":" + process.env.TRANSIFEX_PASSWORD
})

function pull(done) {
  console.log('fetching available languages...')

  completePercentages = {}

  transifex.projectInstanceMethods(null, function(err, project){
    if(err) return done(err)

    async.filter(project.teams, function(language, callback){
      transifex.languageInstanceMethod(null, language, true, function(err, translation){
        if(err) {
          console.error(err.message);
          console.error(err.stack)
          return callback(false)
        }

        var include = translation.completed_percentage >= 90
        if(include) {
          completePercentages[language] = translation.completed_percentage
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
      transifex.translationInstanceMethod(null, 'translation', language, function(err, translation){
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
