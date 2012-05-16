
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , essayist = require('./lib/essayist');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
 
app.get('/sitemap.xml', routes.sitemap);
app.get('/', routes.content);
app.get('/:slug', routes.content);

// Configure Essayist
essayist.config({
  theme: 'boxers',
  title: 'Essayist',
  description: 'An Essay Publishing App'
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
