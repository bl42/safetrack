// require.paths.unshift(__dirname);

var Users = require('../logics/db').Users,
		util = require('util'),
		_  = require('underscore');
		
var regex = {
	email : /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
	name 	: /^[a-zA-Z\s-]+$/
}

module.exports = function(app) {
	app.all("/users/*", all);
	app.get("/users/all.:format?", allUsers);
	app.get("/users/new", userForm);
	app.get("/users/:id/edit", editForm);
	app.get("/users/:id", getById);

	app.post("/users", checkUser, create);

	app.put('/users', edit);
	app.put("/users/:id/unit", manageUnits);	

	app.get('/users', function(req,res){
		res.send('get users');
	});
}

function all(req, res, next){
	var access = req.session.user.access*1;
	if(access === 1 || access === 0){ next(); }else{ res.redirect('/login') }
}

function allUsers(req, res){
	Users.getAll(function(documents){
		_.map(documents, function(doc){delete doc.password; return doc;});

		if(req.params.format == 'json') res.send(JSON.stringify(documents));
	});
}

function userForm(req, res){ res.render('partials/users/new'); }

function editForm(req, res){
	var id = req.params.id;
	res.send('editform');
}

function getById(req, res){ res.send('hello - by id'); }





function create(req, res){
	var user = req.body.user;
	user.name = req.body.name;
	
	user.password = Users._cryptoHashUsername('sha1', user.password);
	Users.add(user);
	res.redirect('home');
}


function edit(req, res){ res.send('hello - edit'); }

function manageUnits(req,res){
	var id = req.params.id,
			action = req.body.action;
	
	Users.findByEmail(req.body.email, function(user){
		if(user){
			if(action == 'remove') user.units = _.without(user.units, id);
			else if(action == 'add') user.units.push(id);

			Users.update(user);			
			
			res.send(JSON.stringify({status: 'ok', action: action, unit : id}));
		} else {
			res.send(JSON.stringify({status: 'error', action: action, unit : id}));
		}
	});
	
}








function checkUser(req, res, next){

	var user = req.body.user,
			error = [];
						
	user.name = req.body.name;

	if(!regex.email.test(user.email)) 		error.push('Invalid Email Address');
	if(!regex.name.test(user.name.first)) error.push('Invalid First Name');
	if(!regex.name.test(user.name.last))	error.push('Invalid Last Name');
	if(user.password.length < 3) 					error.push('Password must be greater than 3 characters.');

	if(error.length){
		res.redirect('back');
	}
	else
	{
		Users.findByEmail(user.email, function(doc){
			if(!doc) next();
			else res.redirect('back');
				
		});
	}
}


