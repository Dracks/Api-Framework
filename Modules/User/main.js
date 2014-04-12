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

Main.prototype.registerApi=function (app, path){
	"use strict";
	var self=this;
	app.get(path, function(req, res){
		self.user.validate(req, function(status, object){
			if (object===null || object===undefined){
				res.json(404, "User not found");
			} else {
				res.json(object);
			}
		});
	});

	app.post(path, function(req, res){
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
	});

	// Renew token
	app.post(path+"/token", function (req, res){
		if (req.headers.token!==undefined) {
			self.user.renew(req.headers.token, req.body.renew, function (status, data){
				if (data===null || data===undefined){
					res.json(500, status);
				} else {
					res.json(data);
				}
			});
		}
	});

	app.delete(path+'/token', function(req, res){
		if (request.header.token!==undefined){
			self.user.close(request.header.token, function (output){
				if (output==="ok"){
					res.json({status: "Session clossed"});
				} else {
					res.json(404, status);
				}
			});
		}
	});

	app.put(path, function(req, res){
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

	app.delete(path, function(req, res){
		res.json(500,{"error":"User not found"});
	});
};

Main.prototype.registerAdmin=function (app, path){

};

Main.prototype.registerWeb=function (app, path){

};



module.exports=Main;