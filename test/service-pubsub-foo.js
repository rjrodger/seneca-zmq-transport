require('seneca')()
  .use('foo')
  .use(require('../'))
  .listen( {type:'pubsub',pin:'foo:*'} )
