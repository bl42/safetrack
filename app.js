// require.paths.unshift(__dirname);

var express	= require('express'),
		app 		= express.createServer(),
		MongoStore = require('connect-mongo'),
		socket 	= require('./logics/sockets');
	
	app.configure(function() {
 //	  app.use(express.logger());
	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  app.use(express.static(__dirname + '/static'));
	  app.use(express.cookieParser());
		app.use(express.session({ secret: 'safetrack', store: new MongoStore({db: 'safetrack', host: '50.56.70.120'}), expires: new Date(Date.now() + 3600000*12)}) );
	  app.use(app.router);
		app.set('view engine', 'jade');
		app.set('views', __dirname + '/views');
	});
	


app.get('/', function(req, res, next){
	if(!req.session || !req.session.user){
	//	res.redirect('http://safealert.mx');
	next();
	} else {
		next();
	}

})

app.listen(80);
socket.init(app);


require('./logics/locate/tcp')(3961);
require('./logics/locate/dgram')(3962);

require('./controllers/login')(app);

app.all('*', function(req, res, next){
	if(!req.session || !req.session.user){
		res.redirect('/login');
	} else {
		next();
	}
});

require('./controllers/index')(app);
require('./controllers/units')(app);
require('./controllers/users')(app);

require('./controllers/map')(app);


app.get('*', function(req,res){
	res.send('404');
});
