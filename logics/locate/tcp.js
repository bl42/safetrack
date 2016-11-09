// require.paths.unshift(__dirname);

var net 	= require('net'),
	parse 	= require('../../logics/locate/parse'),
	util	= require('util'),
	socket 	= require('../../logics/sockets'),
	unitPositions 	= require('../../logics/db').UnitPositions;


module.exports = function(port){
	net.createServer(function (socket) { 	 	
		socket.setEncoding('utf8');
		socket.on('connect', connect);
		socket.on('close', close);
		socket.on('data', onData);
		socket.on('error', error);
	}).listen(port);
	
	console.log('TCP'+'   ['+new Date().toDateString()+' '+(new Date().toTimeString()).match(/^.{1,8}/)[0]+']   Listening on port '+ port);
}

function connect(data)	{ }
function close(data)	{ }

function error(e){
	console.log('TCP'+'   ['+new Date().toDateString()+' '+(new Date().toTimeString()).match(/^.{1,8}/)[0]+']   \033[31m ERROR: '+e+'\033[0m');
}

function onData(data){
	cleanData = parse.tcp(data);
	
		
	if(cleanData){
		var event = (cleanData.sos == true) ? 'unit.sos' : 'unit.location';
		UnitPositions.add(cleanData);
		socket.broadcast(event, cleanData);
	}			
}