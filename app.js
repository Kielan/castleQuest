// Load module dependencies
var express = require('express')
, path = require('path')
, app = express() // Web framework to handle routing requests
, cons = require('consolidate') // Templating library adapter for Express

// Register our templating engine
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/client');
app.use(express.static(__dirname + '/src'));

// Static routes
app.use('/src', express.static(__dirname + '/src')); // The public files


//Dynamic routes
app.get('/', function (req, res) {

  res.render('./index.html');

});

app.listen(9999);
