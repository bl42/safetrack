// require.paths.unshift(__dirname);

require('../../utils/buffers');

exports.tcp = function(string){
	var data = string.split(',');

	var parseData = 
	            // GL100
	            data[0] == '+RESP:GTTRI' && data.length == 20 ? GL100(data) :
				data[0] == '+RESP:GTSOS' && data.length == 20 ? GL100SOS(data) : 
				data[0] == '#BUF#+RESP:GTSOS' && data.length == 20 ? GL100SOS(data) : 
				// GL200
				data[0] == '+RESP:GTFRI' && data.length == 22 ? GL200(data) :
				data[0] == '+RESP:GTSOS' || data[0] == '#BUF#+RESP:GTSOS'  && data.length == 22 ? GL200SOS(data) :
				// MT90
				data[0].match(/\$\$/) && data.length == 21 && data[3] == 1 ? MT90SOS(data) : 
				data[0].match(/\$\$/) && data.length == 21 ? MT90(data) : 
				null;

	logger('TCP', parseData, string);
	return clean(parseData);
	}

exports.udp = function(buf, rinfo){
	var data = rinfo.size === 63 ? TT8750(buf, rinfo):
		null;
		
	logger('UDP', data, 'Buffer Length ' + rinfo.data);
	return clean(data);	
}


function logger(method, data, string){
	if(data){ 
		var sos = ''
		if(data.sos) sos = ' | SOS: TRUE';
		
		console.log(method +'   ['+new Date().toDateString()+' '+(new Date().toTimeString()).match(/^.{1,8}/)[0]+']  '+'ID: '+data.id+' | LAT: '+data.latitude+' | LNG: '+data.longitude +' | Model: '+data.model+' ' + sos) ;
	}else{ 
		console.log(method +'   ['+new Date().toDateString()+' '+(new Date().toTimeString()).match(/^.{1,8}/)[0]+']  \033[31m ERROR: '+ string+'\03');
	}3[0m
}

function clean(data){
	if(data){
		data.longitude = ~~(data.longitude*100000)/100000;
		data.latitude = ~~(data.latitude*100000)/100000;
		
		if(data.sos) return data;
		
		if(data.longitude >= 180 || data.longitude <= -180 || data.latitude >= 90 || data.latitude <= -90 || data.longitude == 0 || data.latitude == 0)
			return null;
	}
	return data;
}

/**
*  
* +RESP:GTTRI,100001,,,,,,90,50,,-98.5189,27.5741,,,,,,,
*
* +RESP:GTSOS,011874000334776,0,0,0,0,0.0,0,0.0,50,,,20110426204730,0310,0410,d3ba,4ebf,02,0007,0102100203 
*
**/
function GL100(data){
	return {
		id				: parseFloat(data[1])+'',
		longitude	: parseFloat(data[10]),
		latitude	: parseFloat(data[11]), 
		speed			: parseFloat(data[8]),
		direction	: parseFloat(data[7]),
		time			: Date.now()+'',
		model			: 'GL100',
		date			: new Date()
		}
}

function GL100SOS(data){
	var sos = GL100(data);
	sos.sos = true;

	return sos;
}


/**
*
* +RESP:GTFRI,02010A,867844000901416,1234567891234,0,0,1,2,0.0,0,46.9,-98.333949,26.073203,20130306193049,0334,0020,0655,500C,,11,20130306193136,0E22$
* 
**/

function GL200(data){
	return {
		id				: parseFloat(data[2])+'',
		longitude	: parseFloat(data[11]),
		latitude	: parseFloat(data[12]), 
		speed			: parseFloat(data[9]),
		direction	: parseFloat(data[8]),
		time			: Date.now()+'',
		model			: 'GL200',
		date			: new Date()
		}
}

function GL200SOS(data){
    var sos = GL200(data);
	sos.sos = true;

	return sos;
}


function MT90(data){
    return {
		id				: parseFloat(data[1])+'',
		longitude	    : parseFloat(data[5]),
		latitude	    : parseFloat(data[4]), 
		time			: Date.now()+'',
		model			: 'MT90',
		date			: new Date()
		}
}


function MT90SOS(data){
    var sos = MT90(data);
	sos.sos = true;

	return sos;
}






function TT8750(buf, rinfo){
	function latitude(a)	{ lat  = (a > 0x7fffff)? a - 0xffffff : a;  	if(lat<0){ lat=lat*-1; t=true}else{t=false;}    lat = lat/100000;   a = Math.floor(lat);  b = lat - a;  return (t)? (a + (b/.6))*-1: a + (b/.6);}
	function longitude(a)	{ long = (a > 0x7fffffff)? a - 0xffffffff : a; 	if(long<0){ long=long*-1; t=true}else{t=false;} long = long/100000; a = Math.floor(long); b = long - a; return (t)? (a + (b/.6))*-1: a + (b/.6);} 
	return {
		id				: parseFloat(buf.slice(8, 30))+'',
		longitude	: longitude(buf.toLong(44,47,16)),
		latitude	: latitude(buf.toLong(40,43,16)),
		speed			: buf.toInt(48,49,16),
		direction	: buf.toInt(50,51,16),
		altitude	: buf.toLong(55,57,16),
		time			: Date.now()+'',
		model			: 'TT8750',
		date			: new Date()
		}
}


/*
*
*	@format GL100
*	-Partial Docs
*
*	@format Unkown 
*	-(tcp test software)
*
*
*

  parseTCPData: function(data){
  	var self = this, dataSplit = data.split(','), dataObj = null;
    if(dataSplit[0] == '+RESP:GTTRI' && dataSplit.length == 19){ dataObj = {MDMID: parseFloat(dataSplit[1]), longitude: parseFloat(dataSplit[10]), latitude: parseFloat(dataSplit[11]), serverTime: new Date().getTime()}; 			}
    if(dataSplit[0] == '$evtGPRSTrack'){dataObj = {unitId: parseInt(dataSplit[1]), utctime: parseInt(dataSplit[2]), valid : dataSplit[3], longitude: parseFloat(dataSplit[4]), EW: dataSplit[5], latitude: parseFloat(dataSplit[6]), NS: dataSplit[7], satNum: parseInt(dataSplit[8]), gsmSignal: parseInt(dataSplit[9]), angle: parseFloat(dataSplit[10]), speed: parseFloat(dataSplit[11]), mileage: parseFloat(dataSplit[12]), a1: parseFloat(dataSplit[13]), a2: parseFloat(dataSplit[14]), d1: parseInt(dataSplit[15]), d0: parseInt(dataSplit[16]), rtcTime: parseInt(dataSplit[17]), serverTime: new Date().getTime()}; 			}    
  	return dataObj;
  }

*/

/*
*
*	@Format Evo format
*	-Old Units
* 
*
  	if(rinfo.size < 63){ console.log(new Date()+'\033[32m Unit posted with bad data\033[0m'); return false;}
  	
	latitude = function(a){ lat  = (a > 0x7fffff)? a - 0xffffff : a;  	  if(lat<0){ lat=lat*-1; t=true}else{t=false;}    lat = lat/100000;   a = Math.floor(lat);  b = lat - a;  return (t)? (a + (b/.6))*-1: a + (b/.6);}
	longitude = function(a){ long = (a > 0x7fffffff)? a - 0xffffffff : a; if(long<0){ long=long*-1; t=true}else{t=false;} long = long/100000; a = Math.floor(long); b = long - a; return (t)? (a + (b/.6))*-1: a + (b/.6);} 

	var evo = {
(unitid)	MDMID		: buf.slice(8, 30).toString(), 
			altitude	: buf.toLong(55,57,16),
(direction)	heading		: buf.toInt(50,51,16),
			latitude	: latitude(buf.toLong(40,43,16)),
			longitude	: longitude(buf.toLong(44,47,16)),
(speed)		velocity	: buf.toInt(48,49,16),
		
		header		: buf.toInt(0, 3, 16, true),
		parm1		: buf.toLong(4, 7, 16),
		gpioData	: buf[30],
		gpioDi		: buf[31],
		ADC1		: buf.toInt(32,33,16),
		ADC2		: buf.toInt(34,35,16),
		IEC			: buf[36],
		GPSDate		: buf.toLong(37, 39, 16),
		GPSStatus	: buf[40],
		gmt			: buf.toLong(52,54,16),
		satellites	: buf[58],
		odometer	: buf.toInt(59,62),
		address		: rinfo.address, 
		port		: rinfo.port
	}
*/