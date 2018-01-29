/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// js for index page
var express = require('express');
var router = express.Router();// using express router module.

// routes to index page only if authenticated.
router.get('/',ensureAuthenticated, function(req,res){
    res.render('index');
});

function ensureAuthenticated(req, res,next){
    if(req.isAuthenticated()){
         return next();
    }
   
    res.redirect('/users/login');
};


module.exports = router;
