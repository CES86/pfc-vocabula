var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/users');
var words = require('./routes/words');
var translations = require('./routes/translations');
var exercises = require('./routes/exercises');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'urjc.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//app.use(cookieParser('PFC-Vocabula'));
app.use(session({
	secret: 'PFC-Vocabula',
	resave: true,
	saveUninitialized: true,
	cookie: {secure: false}
}));

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Helpers dinamicos:
app.use(function (req, res, next) {

	// si no existe lo inicializa
	if (!req.session.redir) {
		req.session.redir = '/';
	}

	// guardar path en user.redir para despues de login
	if (!req.path.match(/\/login|\/logout|\/user|\/new|\/edit|\/upload|\/add/)) {
		req.session.redir = req.path;
	}

	// Hacer visible req.user en las vistas
	res.locals.session = req.session;
	res.locals.hostname = req.headers.host;
	res.locals.refreshTimer = 20;
	next();
});

app.use('/', routes);
app.use('/user', users);
app.use('/word', words);
app.use('/translation', translations);
app.use('/exercise', exercises);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err,
			errors: []
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {},
		errors: []
	});
});


module.exports = app;
