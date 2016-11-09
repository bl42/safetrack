

var http = require('http');


exports.send = function(numbers, msg, cb){
    var url = 'http://bulksms.vsms.net/eapi/submission/send_sms/2/2.0';
    var	msisdn = 'xxxxxxx';
    var username = 'xxxxxxx'; 
    var password = 'xxxxxx';

    console.log(numbers, msg, cb);



var options = {
  host: 'bulksms.vsms.net',
  port: 5567,
  path: '/eapi/submission/send_sms/2/2.0?username='+username+'&password='+password+'&message='+encodeURI(msg)+'&msisdn='+numbers.toString(),
  method: 'GET',
  headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
      }
};

var request = http.request(options, function(res){
    console.log('SMS Request Sent :: STATUS: ' + res.statusCode);
   
});

request.end();


};
