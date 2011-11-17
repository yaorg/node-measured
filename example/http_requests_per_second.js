var metrics    = require('..');
var collection = new metrics.Collection('http');
var http       = require('http');

var rps = collection.meter('requestsPerSecond');
http.createServer(function(req, res) {
  meter.mark();
  res.end('Thanks');
}).listen(3000);

setInterval(function() {
  console.log(collection.toJSON());
}, 1000);
