require('seneca')()
  .use('foo')
  .use('..')
  .listen( {type:'zmq',pin:'foo:*'} );
