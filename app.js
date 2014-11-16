var express = require('express')
var http = require('http');
var path = require('path');

var routes = require('./routes');

var app = express();

app.configure(function() {
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.set('host', 'localhost:3000');
  app.use(express.logger('dev'));
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/map_data.json', routes.mapData);

module.exports = app;
