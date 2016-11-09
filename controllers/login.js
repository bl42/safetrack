// require.paths.unshift(__dirname);
	var Users = require('../logics/db').Users,
	util = require('util');


	
module.exports = function(app) {
	app.get("/login", function index(req, res){ res.sendfile(app.set('views') + '/login.html');});
	app.post('/login', post);
	
	app.all('*',requireLogin);


}




function post(req, res){
	if(req.body.email && req.body.password){
		Users.findByEmail(req.body.email, function(doc){
			if(req.body.email === doc.email && Users._cryptoHashUsername('sha1', req.body.password) == doc.password){

				doc.lastLoggedIn = Date.now()+'';
				req.session.user = doc;

				Users.update(doc);

				res.redirect('/');
			}else{
				res.redirect('/login');
			}
		});
	}
	else res.redirect('/login');
}



function requireLogin(req, res, next){
	if(!req.session || !req.session.user){
		res.redirect('/login');
	} else {
		next();
	}
}