/**
 * Created with JetBrains WebStorm.
 * User: dracks
 * Date: 27/02/14
 * Time: 15:05
 * To change this template use File | Settings | File Templates.
 */

var MongoDB = require('mongodb').Db;

var API_PATH="/api/v1/";
var ADMIN_PATH="/admin/";
var WEB_PATH="/";

function MainController(app, mongoServer){
	"use strict";
	if (! (this instanceof MainController)){return new MainController(app, mongoServer);}
	var self=this;
	self.db= MongoDB('global', mongoServer, {w:1});
	self.db.open(function (e,d) {
		if (e){
			console.log(e);
			return;
		}
		console.log('Database connected:'+d);
		var modulesCollection=self.db.collection('modules');
		modulesCollection.findOne({name:"User"}, function (e, d){
			var module=null;
			var moduleName=null;
			if (d===null || d===undefined){
				var path='./Modules/User/main.js';
				module=require(path);
				module= new module(self.db);
				moduleName="User";
				modulesCollection.insert({name:moduleName, version:module.getVersion(), path:path}, function(err, doc){

				});
			} else {
				module=require(d.path);
				moduleName= d.name;
				module= new module(self.db, d.version);
			}
			module.registerApi(app, API_PATH+moduleName);
			module.registerAdmin(app, ADMIN_PATH+moduleName);
			module.registerWeb(app, WEB_PATH+moduleName);
			self.user=module.getModel();
			modulesCollection.find({name:{$ne:"User"}}).each(function(err, item){
				if (item===null || item===undefined){
					console.log(err);
				} else {
					MongoDB(item.database, mongoServer, {w:1}).open(function (e, db){
						module=require(item.path);
						moduleName=item.name;
						module = new module(self.user, db, item.version);
						module.registerApi(app, API_PATH+moduleName);
						module.registerAdmin(app, ADMIN_PATH+moduleName);
						module.registerWeb(app, WEB_PATH+moduleName);
					});
				}
			});
		});
	});
}


module.exports=MainController;