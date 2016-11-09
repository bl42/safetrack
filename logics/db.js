var DATABASENAME = 'safetrack';

var mongo = require('mongoskin'),
		db = mongo.db('xx.xx.xx.xx:27017/'+DATABASENAME+'?auto_reconnect'),
		_ 	 = require('underscore'),
		crypto	= require('crypto');
		
		


exports.Users = Users = {
	collection: db.collection('users'),
	defaults :{
		email: '',
		password: '',
		name: {first: '', last: ''},
		access: 0,
		units: []
	},
	add: function(data){
		var user = _.extend(this.defaults,data)
		this.collection.save(user, function(err, res){
			if(err){ console.log(err);}
		});
	},
	update: function(doc){
		this.collection.save(doc, function(err, res){
				if(err){ console.log(err);}
		});
	},
	getAll: function(fn){
		this.collection.find().toArray(function(err, data){
			if(err){ console.log(err);}
			fn(data);
		});
	},
	findByEmail: function(email, fn){
		this.collection.find({email: email}).toArray(function(err, res){
			if(err){ console.log(err);}
			if(!res.length) fn(false);
			else fn(res[0]);
		});

	},
	_cryptoHashUsername: function(method, password) {
	  var hash = crypto.createHash(method);
	  hash.update(password);
	  return hash.digest('base64').trim('=');
	}
}


exports.UnitPositions = UnitPositions = {
	collection: db.collection('unitPositions'),
	add: function(row){
		this.collection.save(row, function(err, res){
			if(err){ console.log(err);}
		});
		Units.add(row);
	},
	dateRange: function(id, date, dateHigh, fn){
    	console.log(date, dateHigh)
		this.collection.find({id: id, 'date': {'$gt': new Date(date), '$lt' : new Date(dateHigh)}}).toArray(function(err, res){
			if(err){ console.log(err);}
			console.log('daterange ',res);
			fn(res);
		});
	}
}



exports.Units = Units = {
	collection: db.collection('units'),
	add: function(data){
		var self = this;
		this.collection.findOne({_id: data.id}, function(err, res){
			if(err){ console.log(err);}
	
			if(!res){ self._addNew(data);}
			else if(res) self._updateLocation(data, res);
		});
		
	},
	getAll: function(fn){
		this.collection.find().toArray(function(err,res){
			if(err){ console.log(err);}
			fn(res);
		});
	},
	updateById: function(data, fn){
	var that=this;
		this.collection.findOne({_id: data.id+''}, function(err, res){
			if(err){ console.log(err);}
			if(res){
				var doc = res;

				if(data.sos === 0) doc.sos = false;
				else{
					doc.name = data.name;
					doc.registered = true;
				}
				that.collection.save(doc, function(err,res){
					if(err){ console.log(err);}
					fn();
				});	

			} 
		});
	},
	_addNew : function(data){
		var lastLocation = _.clone(data);
		
		delete lastLocation.id;
		delete lastLocation.model;
		
		this.collection.save({
			_id: data.id,
			name: null,
			model: data.model,
			location: lastLocation,
			registered: false
		}, function(err, res){
			if(err){ console.log(err);}
		});
	},
	byId: function(id, fn){
    	var that=this;
		this.collection.findOne({_id: id+''}, function(err, res){
			if(err){ console.log(err);}
			fn(res);
		}); 
	},
	_updateLocation: function(data, doc){
		lastLocation = _.clone(data);
		
		delete lastLocation.id;
		delete lastLocation.model;
		if(lastLocation.sos) doc.sos = true;
		doc.location = lastLocation;
		
		this.collection.save(doc, function(err, res){
			if(err){ console.log(err);}
			
		});
	}
}





exports.Sessions = Sessions = {
	collection: db.collection('sessions'),
	getById: function(id, fn){
		this.collection.findOne({_id:id}, function(err, res){
			if(err){ console.log(err);}
			 if(res){
    			 
			 
				var session = JSON.parse(res.session); 	
				fn(session.user);
            }
		});
	}
}
