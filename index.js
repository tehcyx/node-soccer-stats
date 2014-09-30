var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var port = process.env.PORT || 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// sqlite3 db
var fs = require('fs');
var file = 'soccer.db';
var exists = fs.existsSync(file);

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);

db.serialize(function() {
	if(!exists) {
		db.run("CREATE TABLE players (name VARCHAR(15))");
		var stmt = db.prepare("INSERT INTO players VALUES(?)");

		stmt.run("Bastian");
		stmt.run("Carter");
		stmt.run("Daniel");
		stmt.run("Sabin");

		stmt.finalize();

		db.run("CREATE TABLE games (homeId INTEGER, awayId INTEGER, result SMALLINT)");
	}


	db.each("SELECT rowid AS id, name FROM players", function(err, row) {
		console.log(row.id + ": " + row.name);
	});
});

db.close();

// ===================== ROUTES =====================
var router = express.Router();

// route middleware that will happen on every request
router.use(function(req, res, next) {

	// log each request to the console
	console.log(req.method, req.url);

	// continue doing what we were doing and go to the route
	next();	
});

// route middleware to validate :name
router.param('name', function(req, res, next, name) {
	// do validation on name here
	// blah blah validation
	// log something so we know its working
	console.log('doing name validations on ' + name);

	// once validation is done save the new item in the req
	req.name = name;
	// go to the next thing
	next();	
});

router.get('/', function(req, res) {
	//res.send('hello world');
	res.render('index', { title: 'Soccer DB' });
});

router.post('/:homeId/:awayId/:result', function(req, res) {
	homeId = parseInt(req.params.homeId);
	awayId = parseInt(req.params.awayId);
	result = parseInt(req.params.result);
	if (homeId > 0 && awayId > 0 && (result == 1 || result == 2)) {
		// sqlite3 db
		var fs = require('fs');
		var file = 'soccer.db';
		var exists = fs.existsSync(file);

		var sqlite3 = require('sqlite3').verbose();
		var db = new sqlite3.Database(file);

		db.serialize(function() {
			var stmt = db.prepare("INSERT INTO games VALUES(?,?,?)");

			stmt.run(homeId, awayId, result);

			stmt.finalize();
		});

		db.each("SELECT homeId, awayId, result FROM games", function(err, row) {
			console.log(row.result);
			res.send('{success:true, ' + JSON.stringify(row, null, 4) + '}');
		});

		db.close();
	} else {
		res.send('{success:false');
	}
	
});

router.get('/about', function(req, res) {
	res.send('about page');
	//res.render('index.html');
});

router.get('/hello/:name', function(req, res) {
	res.send('hello ' + req.params.name + '!');
});

app.route('/login')

	// show the form (GET http://localhost:8080/login)
	.get(function(req, res) {
		res.send('this is the login form');
	})

	// process the form (POST http://localhost:8080/login)
	.post(function(req, res) {
		console.log('processing');
		res.send('processing the login form!');
	});

app.use('/', router);

// ===================== ERROR HANDLERS =====================

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// ===================== START SERVER =====================

var server = app.listen(3000, function() {
	console.log('Listening on port %d', server.address().port);
});
