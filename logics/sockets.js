// require.paths.unshift(__dirname);

var io = require('socket.io'), socket,
		_  = require('underscore'),
		Session = require('../logics/db').Sessions,
		sms = require('../logics/sms'),
		dbunits 	= require('../logics/db').Units;
		
var units = {}, global = [];

exports.init = function(app){
	socket = io.listen(app);
	socket.on('connection', function(client){
			
		client.on('message', message);
		client.on('disconnect',	disconnect);
		
		function message(data){
			if(data.sessionID){
				Sessions.getById(data.sessionID, function(user){
					manageUnitSockets(client, user); 
				});
			}else{ console.log('log back in');}
		}
		
		function disconnect(){ console.log('Client Disconnect from Socket.io');}
		
	});
}

var broadcastLocation = function(event, data){
	var location = _.clone(data), unitData;
	
	delete location.id;
	delete location._id;
	delete location.model;

 	unitData = {id: data.id,model: data.model, location:location};

 	if(units[unitData.id]){
	 	units[unitData.id].forEach(function(channel){
	 		channel.send({event: event, data: unitData});
	 	});
 	} 
	global.forEach(function(channel){
	 	channel.send({event: event, data: unitData});
	});
	// socket.broadcast({location: unitData});
}




exports.broadcast = function(event, data){
	if(event == 'unit.location' || event == 'unit.sos'){
		broadcastLocation(event, data);
	}
	if(event == 'unit.sos'){
	
		dbunits.byId(data.id, function(d){
    		sms.send([number1, number2, ...], d.name + "\nUnit ID: " + data.id + "\nerror code: SOS");
		})
		console.log(data);
		
	}
}



function manageUnitSockets(channel, user){
	var isUser = (user.access != 1 && user.access != 0);
	if(isUser || user.units.length != 0){
		user.units.forEach(function(unitid){
			if(!units[unitid]) units[unitid] = [];
			units[unitid].push(channel);
		});
	}
	if((user.access == 1 || user.access == 0) && user.units.length == 0){
		global.push(channel); 
	}
	
}