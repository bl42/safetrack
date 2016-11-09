// require.paths.unshift(__dirname);

var db = require('../logics/db'),
		Units = db.Units,
		UnitPositions = db.UnitPositions,
		_  = require('underscore');

var DAY = (1440 * 60 * 1000);

module.exports = function(app) {
	app.get("/units/all.:format?", allUnits);
	app.get("/units/:id/edit", edit);

	app.get("/units/:id/history/:time?.:format?", history);

	app.get("/units/:id/status/:status", status);

	app.put("/units", writeEdit);

}

function allUnits(req, res){
		Units.getAll(function(documents){
		  var blacklist = {11874000294582: true, 33309: true, 80002: true, 11874000393830: true, 600004 : true, 33301: true, 33306: true, 40005: true, 33302: true, 33305: true, 33304: true, 40004 : true, 11874000276050: true, 11874000389226: true, 9051 : true, 8101 : true, 9000 : true, 8207 : true, 8203 : true, 8204 : true, 9001 : true, 8202 : true, 8102 : true, 8103 : true, 8200 : true, 8100 : true};
			var units, today = new Date(),
					isUser = (req.session.user.access != 1 && req.session.user.access != 0);
			
			if(isUser){
				units = _.select(documents, function(unit){
					return _.indexOf(req.session.user.units, unit._id) != -1;
				});
			}else{
				units = documents;
			}
    			console.log(units);
    			console.log(today.setHours(0,0,0,0)-(DAY*14))
			var sortedUnits = _.sortBy(units, function(unit){
    			     return unit.location.time*-1;
			});
			var lastestUnits = _.filter(sortedUnits, function(unit) {
    			return !blacklist[unit._id] && (unit.location.time > today.setHours(0,0,0,0)-(DAY*14));
			});
			if(req.params.format == 'json') res.send(JSON.stringify(lastestUnits));
		});
}

function edit(req, res){
	var id = req.params.id;
	
	res.render('partials/units/edit',{locals: {id: id, unit: {name:''}}});

}


function history(req,res){
	var id = req.params.id+'',
			days = DAY * (req.params.time ||1),
			daysHigh = (DAY * (req.params.time ||1)) -DAY,
			today = new Date();
	if(req.params.format == 'csv') res.header("Content-Type", "application/csv");
	UnitPositions.dateRange(id, (today.setHours(0,0,0,0)-days), (today.setHours(0,0,0,0)-daysHigh), function(docs){
		if(req.params.format == 'csv') res.send(json2csv(docs.reverse()));
		else res.send(docs.reverse()); 
	});
	
}

function status(req,res){
	var id = req.params.id+'',
			status = req.params.status; 

	if(status == 0){
		Units.updateById({id: id, sos : 0}, function(){
			res.redirect('back');	
		});
	} else {
		res.redirect('back');
	}
}

function writeEdit(req,res){
	var unit = req.body.unit;
	if(unit.name != ''){
		Units.updateById(unit, function(){
			res.redirect('back');	
		});
	} else {
		res.redirect('back');
	}
}


function json2csv(data){
	var csv = '';
		_.each(data, function(row){
			_.each(row, function(item, key){
				if(key != '_id')
					csv+= item+',';
			});
			csv+='\n';
		});
	return csv;
}
