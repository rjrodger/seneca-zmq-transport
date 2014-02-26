require('seneca')()
  .use('foo')
  .use('..')
  .listen( {type:'pubsub',pin:'foo:*'} )
