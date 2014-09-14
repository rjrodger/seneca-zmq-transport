/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";


var buffer = require('buffer')
var util   = require('util')

var _           = require('underscore')
var async       = require('async')
var patrun      = require('patrun')
var connect     = require('connect')
var request     = require('request')
var zmq         = require('zmq')


module.exports = function( options ) {
  var seneca = this
  var plugin = 'zmq-transport'

  var so = seneca.options()
  
  options = seneca.util.deepextend(
    {
      zmq: {
        type:       'zmq',
        port:       10201,
        host:       '0.0.0.0',
        protocol:   'tcp',
        timeout:    Math.max( so.timeout ? so.timeout-555 : 5555, 555 )
    },
  },
  so.transport,
  options)

  var tu = seneca.export('transport/utils')

  seneca.add({role:'transport',hook:'listen',type:'zmq'}, hook_listen_zmq)
  seneca.add({role:'transport',hook:'client',type:'zmq'}, hook_client_zmq)
 
  // Legacy patterns
  seneca.add({role:'transport',hook:'listen',type:'pubsub'}, hook_listen_zmq)
  seneca.add({role:'transport',hook:'client',type:'pubsub'}, hook_client_zmq)
 
  var mark = '~'


  function hook_listen_zmq( args, done ) {
    var seneca         = this
    var type           = args.type
    var listen_options = seneca.util.clean(_.extend({},options[type],args))

    var server_port = listen_options.protocol+'://'+listen_options.host+':'+listen_options.port
 
    var zmq_server  = zmq.socket('rep')

    zmq_server.identity  = 'listen-out-'+process.id

    zmq_server.bind(server_port, function(err){
      if( err ) return done(err);
    })


    zmq_server.on('message',function(msgstr){
      msgstr = ''+msgstr
      var index = msgstr.indexOf(mark)
      var channel = msgstr.substring(0,index)
      var data = tu.parseJSON(seneca, 'listen-'+type, msgstr.substring(index+1))

      tu.handle_request( seneca, data, listen_options, function(out){
        if( null == out ) return;
        var outstr = tu.stringifyJSON( seneca, 'listen-'+type, out )
        zmq_server.send(channel+mark+outstr)
      })
    })

    seneca.add('role:seneca,cmd:close',function( close_args, done ) {
      var closer = this

      zmq_server.close()
      closer.prior(close_args,done)
    })

    seneca.log.info('listen', 'open', listen_options, seneca)

    done()
  }



  function hook_client_zmq( args, clientdone ) {
    var seneca         = this
    var type           = args.type
    var client_options = seneca.util.clean(_.extend({},options[type],args))

    tu.make_client( make_send, client_options, clientdone )

    function make_send( spec, topic, send_done ) {
      var server_port = client_options.protocol+'://'+client_options.host+':'+client_options.port
 
      var zmq_client  = zmq.socket('req')

      zmq_client.identity  = 'client-in-'+process.id

      zmq_client.connect(server_port, function(err){
        if( err ) return send_done(err);
      })

      zmq_client.on('message',function(msgstr){
        msgstr = ''+msgstr
        var index = msgstr.indexOf(mark)
        var channel = msgstr.substring(0,index)
        var input = tu.parseJSON(seneca,'client-'+type,msgstr.substring(index+1))

        tu.handle_response( seneca, input, client_options )
      })

      seneca.log.debug('client', 'subscribe', topic+'_res', client_options, seneca)

      send_done(null, function( args, done ) {
        var outmsg = tu.prepare_request( this, args, done )
        var outstr = tu.stringifyJSON( seneca, 'client-zmq', outmsg )

        var actmeta = seneca.findact(args)
        if( actmeta ) {
          var actstr = options.msgprefix+util.inspect(actmeta.args)
          zmq_client.send(actstr+mark+outstr)
        }
        else {
          zmq_client.send(options.msgprefix+'all'+mark+outstr)
        }
      })

      seneca.add('role:seneca,cmd:close',function( close_args, done ) {
        var closer = this

        zmq_client.close();
        closer.prior(close_args,done)
      })

    }

  }

  return {
    name: plugin,
  }
}
