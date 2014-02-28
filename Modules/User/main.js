/**
 * Created with JetBrains WebStorm.
 * User: dracks
 * Date: 25/02/14
 * Time: 16:49
 * To change this template use File | Settings | File Templates.
 */

var userModel=require('./model.js').User;

function Main ( db, version) {
	"use strict";
	//var db, profile;
	var self=this;

	self.user=new userModel(db);
	if (version===null || version ===undefined){
		self.user.createDatabase();
	} else if (version>self.user.getVersion()){
		self.user.upgradeDatabase(version);
	}
}

Main.prototype.getModel=function (){
	"use strict";
	return this.user;
};

Main.prototype.registerApi=function (app){
	"use strict";
	var self=this;
	app.get('/api/user', function(req, res){

	});

	app.post('/api/user', function(req, res){
		var self=this;
		if (req.headers.token===undefined){
			// login user
			self.user.checkLogin(req.body.email, req.body.password, function (status, object){

			});
		} else {
			// Renew token
		}
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