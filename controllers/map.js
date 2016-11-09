module.exports = function(app) {
	app.get("/map", index);
}

function index(req, res){
	res.sendfile('login.html');
}
