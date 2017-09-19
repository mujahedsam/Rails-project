var express = require('express');
var router = require('./router.js');
var bodyParser = require('body-parser');
var api = require('./api.js');
var session = require('express-session');
var ejs = require('ejs');

//init app
var app = express();

//var cons = require('consolidate');
// view engine setup
app.engine('html', ejs.renderFile);
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'html');

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
// naveesns Middleware
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// Express Session middelware
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use('/', router);
app.use('/', api);
// Set Port
app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() {
    console.log('Server started on port ' + app.get('port'));
});
