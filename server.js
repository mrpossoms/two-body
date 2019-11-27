var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);

// express setup
app.use(express.static(path.join(__dirname, '')));

http.listen(process.env['PORT'] || 3001, function() { console.log('Running!'); });
