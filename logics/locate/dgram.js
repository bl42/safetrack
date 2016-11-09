// require.paths.unshift(__dirname);

var dgram 	= require('dgram'),
	parse 	= require('../../logics/locate/parse'),
	socket 	= require('../../logics/sockets'),
	util	= require('util'),
	unitPositions 	= require('../../logics/db').UnitPositions;


module.exports = function(port){
	var server = dgram.createSocket("udp4");

	server.on('message', message);
	server.on('listening', listen);
	server.bind(port);
}	

function message(msg, rinfo){
	cleanData = parse.udp(msg, rinfo);
	
	if(cleanData){
		var event = (cleanData.sos == true) ? 'unit.SOS' : 'unit.location';		
		
		UnitPositions.add(cleanData);
		socket.broadcast(event, cleanData);
	}
}

function listen(){
	var server = this;
		address = server.address();

	console.log('UDP'+'   ['+new Date().toDateString()+' '+(new Date().toTimeString()).match(/^.{1,8}/)[0]+']   Listening on port '+ address.port);
}