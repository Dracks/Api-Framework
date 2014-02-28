/**
 * Created with JetBrains WebStorm.
 * User: dracks
 * Date: 27/02/14
 * Time: 15:05
 * To change this template use File | Settings | File Templates.
 */

var MongoDB = require('mongodb').Db;

function MainController(app, mongoServer){
	"use strict";
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
			if (d===null || d===undefined){
				var path='Modules/User/main.js';
				module=require(path);
				module= new module(self.db);
				modulesCollection.insert({name:"User", version:module.getVersion(), path:path}, function(err, doc){

				});
			} else {
				module=require(d.path);
				module= new module(self.db, d.version);
			}
			module.registerApi(app);
			module.registerAdmin(app);
			self.user=module.getModel();
			modulesCollection.find({name:{$ne:"User"}}).each(function(err, item){

				MongoDB(item.database, mongoServer, {w:1}).open(function (e, db){
					module=require(item.path);
					module = new module(self.user, db, item.version);
					module.registerApi(app);
					module.registerAdmin(app);
				});
			});
		});
	});
}


module.exports=MainController;