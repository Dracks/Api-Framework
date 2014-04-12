/**
 * Created with JetBrains WebStorm.
 * User: dracks
 * Date: 25/02/14
 * Time: 17:37
 * To change this template use File | Settings | File Templates.
 */

var crypto=require('crypto');
var hashes = crypto.getHashes();
//console.log(hashes);
//var sha1Hash=crypto.createHash('sha1');

var sha1;
sha1 = function (str) {
	"use strict";
	return crypto.createHash('sha1').update(str).digest('hex');
};


function User(db){
	"use strict";
	if (!(this instanceof User)){return new User(db);}
	var self=this;
	self.db=db;
	self.profile = self.db.collection('user.profile');
	self.token   = self.db.collection('user.token');
	self.friend  = self.db.collection('user.friend');
}

User.prototype.createDatabase=function (){
	"use strict";
	var self=this;
	self.token.ensureIndex({'login':1}, {unique:true, background:true}, function(e, name){
		console.log(e);
	});

	self.token.ensureIndex({'renew':1}, {unique:true, background:true}, function(e, name){
		console.log(e);
	});

	self.profile.ensureIndex({'email':1}, {unique:true, background:true}, function(e, name){
		console.log(e);
	});

	self.register("admin", "admin@localhost", "admin", function (status, object){
		self.profile.update({_id:object._id},{admin:true}, function (e, o){
			console.log(e);
		});
	});
};

User.prototype.upgradeDatabase=function (from){

};

User.prototype.checkLogin=function (email, password, callback){
	"use strict";
	this.profile.findOne({email:email, password:sha1(password)}, function (e,u){
		if (u===null || u===undefined){
			callback("user not found", null);
		} else {
			callback("ok", u);
		}
	});
};

User.prototype.register=function (name, email, password, callback){
	"use strict";
	var self=this;
	console.log("Name:"+name+", email:"+email+", password:"+password);
	this.profile.insert({name:name, email:email, devices:[], password:sha1(password), admin:false}, function (e, o){
		if (o===null || o===undefined){
			console.log(e);
			callback("error", null);
		} else {
			console.log(o);
			callback("ok", o);
		}
	});
};

User.prototype.update=function (user, name, email, password, callback){
	"use strict";
	var self=this;
};

User.prototype.validate=function (req, callback){
	"use strict";
	var self=this;
	if (req.headers.token===undefined){
		callback("error token");
	} else {
		this.token.findOne({login:req.headers.token}, {fields:{user:1}}, function(e, data){
			if (data===null || data===undefined){
				console.log(e);
				callback("error", null);
			} else {
				self.profile.findOne({_id:data.user},callback);
			}
		});
	}
};

User.prototype.getToken=function (user, callback){
	"use strict";
	var self=this;
	var generateToken= function (){
		crypto.randomBytes(48, function(ex, buf) {
			var token = buf.toString('hex');
			self.token.findOne({tokens:token}, function (e, o){
				crypto.randomBytes(48, function(ex, buf) {
					var renew=buf.toString('hex');
					if (o===null|| o===undefined){
						self.token.insert({login:token, renew:renew, created: new Date(), user:user._id}, function (e, o){
							if (e){
								console.log(e);
							}
						});
						callback("ok", {login:token, renew:renew});
					} else {
						generateToken();
					}
				});
			});
		});
	};
	generateToken();
};

User.prototype.renew=function (token, renew, callback){
	"use strict";
	var self=this;
	self.tokens.findOne({login:token}, function (e,o){
		if (o===null || o===undefined){
			callback("not found");
		} else {
			if (o.renew==renew){
				self.tokens.remove({_id: o._id}, function (e,o){
					self.profile.findOne({_id: o.user}, function (e, user){
						if (user===null || user===undefined){
							callback("not user found");
						} else {
							self.getToken(user, callback);
						}
					});
				});
			} else {
				callback("not valid");
			}
		}
	});
};

User.prototype.close=function (token, renew, callback){
	var self=this;
	self.tokens.findOne({login:token}, function (e, o){
		if (o===null || o===undefined){
			callback("not found");
		} else {
			self.tokens.remove({_id: o._id}, function (e, o){
				callback("ok");
			});
		}
	});
};



exports.User=User;