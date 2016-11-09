//require.paths.unshift(__dirname);
	var util = require('util');

module.exports = function(app) {
	app.get("/", index);

}

function index(req, res){
	var sessionID = req.sessionID,
			access = req.session.user.access,
            units = req.session.user.units;
	res.render('app', {locals:{socketSession: sessionID, access: access, units : units}});
}