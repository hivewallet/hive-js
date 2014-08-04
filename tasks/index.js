var async = require('async')

var tasks = {
  serve: require('./serve'),
  images: require('./images'),
  html: require('./html'),
  styles: require('./styles'),
  scripts: require('./scripts'),
  loader: require('./loader'),
  test: require('./test'),
  sketch: require('./sketch'),
  watch: require('./watch'),
  transifexPull: require('./transifex').pull,
}

tasks.default = function(){
  async.parallel([ tasks.scripts, tasks.loader, tasks.html, tasks.styles, tasks.images ], function(){
    tasks.serve()
    tasks.watch()
    tasks.test()
  })
}

module.exports = tasks

process.on('message', function(task){
  if(typeof task === 'string') task = [task]
  task = task.map(function(t){
    return tasks[t]
  })

  async.parallel(task, function(err){
    process.send('done', err)
  })
})
