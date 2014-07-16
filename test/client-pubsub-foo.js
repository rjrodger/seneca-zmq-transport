require('seneca')()
  .declare('foo')
  .use(require('../'))
  .client({type:'pubsub',pin:'foo:*'})
  .ready(function(){
    var seneca = this
    setTimeout(function(){
      seneca.act('foo:1,bar:A',function(err,out){console.log(out)})
      seneca.act('foo:2,bar:B',function(err,out){console.log(out)})
    },200)
  })
