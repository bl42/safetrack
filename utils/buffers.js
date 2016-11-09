Buffer.prototype.toInt = function(start, end, radix, short){
	
	var a = '';
	for (var i = start; i <= end; i++)
		a = ((''+this[i]).length == 1 && !short) ? a + 0 + this[i] : a + this[i];
    return (radix) ? parseInt(a, radix) : a;

}
Buffer.prototype.toLong = function(start, end, radix){
	var a = '';
	for (var i = start; i <= end; i++)
		a = ((''+this[i]).length == 1) ? a + 0 + this[i].toString(16) : a + this[i].toString(16);
    
    return (radix) ? parseInt(a, radix) : a;

}
