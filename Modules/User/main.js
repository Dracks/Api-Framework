/**
 * Created with JetBrains WebStorm.
 * User: dracks
 * Date: 25/02/14
 * Time: 16:49
 * To change this template use File | Settings | File Templates.
 */

var userModel=require('./model.js').User;

var version=0.1;

function Main ( db, version) {
	"use strict";
	//var db, profile;
	if (!(this instanceof Main)){return new Main(db, version);}
	var self=this;

	self.user=new userModel(db);
	if (version===null || version ===undefined){
		self.user.createDatabase();
	} else if (version<version){
		self.user.upgradeDatabase(version);
	}
}

Main.prototype.getModel=function (){
	"use strict";
	return version;
};

Main.prototype.getVersion=function (){
	"use strict";
	return 0.1;
};

Main.prototype.registerApi=function (app){
	"use strict";
	var self=this;
	app.get('/api/user', function(req, res){
		self.user.validate(req, function(status, object){
			if (object===null || object===undefined){
				res.json(404, "User not found");
			} else {
				res.json(object);
			}
		});
	});

	app.post('/api/user', function(req, res){
		//var self=this;
		if (req.headers.token===undefined){
			// login user
			self.user.checkLogin(req.body.email, req.body.password, function (status, user){
				if (user===null || user===undefined){
					res.json(404, {status:"not found"});
				} else {
					self.user.getToken(user, function (status, data){
						if (data===null || data===undefined){
							res.json(500, {status:"Token not generated"});
						} else {
							res.json(data);
						}
					});
				}
			});
		} else {
			// Renew token
			self.user.renew(req.headers.token, req.body.renew, function (status, data){
				if (data===null || data===undefined){
					res.json(500, status);
				} else {
					res.json(data);
				}
			});
		}
	});

	app.delete('/api/user/token', function(req, res){

	});

	app.put('/api/user', function(req, res){
		if (req.headers.token===undefined){
			// create new user
			self.user.register(req.body.name, req.body.email, req.body.password, function (status, object){
				res.json({status:status, data:object});
			});
		} else {
			// change user data
			self.user.validate(req, function(e, user){
				if (user===undefined || user ===null){
					console.log(e);
					res.json(404, {status:"not found"});
				} else {
					self.user.update(user, req.body.name, req.body.email, req.body.password, function (status, object){
						res.json({status:status, data:object});
					});
				}
			});
		}
	});


	app.delete('/api/user', function(req, res){
		res.json(500,{"error":"User not found"});
	});
};

Main.prototype.registerAdmin=function (app){

};



module.exports=Main;