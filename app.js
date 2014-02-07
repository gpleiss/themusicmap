var express = require('express')
  , mongoose = require('mongoose')
  , http = require('http')
  , path = require('path')
  , routes = require('./routes')
  , config = require('./config/config')[process.env.ENV];

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.set('host', 'localhost:3000');
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/map_data.json', routes.mapData);

mongoose.connect(config.db);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
