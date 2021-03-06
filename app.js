const express = require('express');
const path = require('path');
// const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const pjson = require('./package.json');
const loadvar = require('./config/var.json');

global.arcount = 0;
global.syss = pjson.syss;
global.var = loadvar;//pjson.var;

var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser();
parser.addArgument([ '-p', '--port' ], { defaultValue: pjson.port, required: false, type: 'string' });
var args = parser.parseArgs();

const index = require('./routes/index');
const ar = require('./routes/ar');
const safety = require('./routes/safety');
const to = require('./routes/to');

let app = express();

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'www')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', index);
app.use('/ar', ar);
app.use('/safety', safety);
app.use('/to', to);

const port = args.port;
app.set('port', port);
var server = http.createServer(app);
server.listen(port);

// global.log = (msg, type = "log")=>{
//  global.var.logs.unshift({ msg: msg, type: type, time: new Date() });
//  if(global.var.logs.length > 20) global.var.logs.pop();
// }
global.logs = [];
let old;
global.log = (msgs)=>{
  if(old != msgs){
    old = msgs;
    let dd = new Date();//dd.getHours()+''+
    global.logs.unshift(dd.getTime() + '|' + msgs);
    console.log(msgs);

    if(global.io){ global.io.emit('logs', global.logs); }

    if(global.logs.length > 20){
      global.logs.pop();
    }
  }
}

global.io = require('socket.io').listen(server);

global.pyio = require('socket.io-client')
        .connect('http://localhost:5000/');
global.pyio.on('connect', () => {
  global.pyio.on('conn', function (msg) {
    global.log("pyio id: " + msg);
  });
  global.pyio.on('ar', function (msg) {
    global.var.ar = msg
  });
});
global.pyio.on('disconnect', function () { global.log('pyio disconnect'); });

global.tcsio = require('socket.io-client')
        .connect(args.tcshost, { query: `room=cars&number=${args.carNumber}&type=${args.carType}&port=${args.port}` });
global.tcsio.on('connect', () => { global.lamp.w.strobe(500); });
global.tcsio.on('disconnect', () => { global.lamp.w.stop(); global.lamp.w.off(); });

module.exports = app;