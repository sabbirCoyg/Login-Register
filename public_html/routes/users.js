/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');

var db = mongojs('passportapp', ['users']);
var bcrypt = require('bcryptjs');
var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;

router.get('/login', function (req, res) {
    res.render('login');
});

router.get('/register', function (req, res) {
    res.render('register');
});

// collecting data from the register form
router.post('/register', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'email field is required').notEmpty();
    req.checkBody('email', 'email field is required').isEmail();
    req.checkBody('password', 'Name field is required').notEmpty();

    req.checkBody('password2', 'passwords dont match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        res.render('register', {
            errors: errors,
            name: name,
            email: email,
            username: username,
            password: password,
            password2: password2
        });

    } else
    {
        var newUser = {
            name: name,
            email: email,
            username: username,
            password: password
        };
// encrypting password in database.
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                newUser.password = hash;
                db.users.insert(newUser, function (err, docs) {
                    if (err) {
                        res.send(err);
                    } else {
                        console.log('user added');
                        req.flash('success', 'Congratulation you are Registered');
                        res.location('/');
                        res.redirect('/');
                    }
                });
            });

        });

    }
});



passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
db.users.findOne({_id:mongojs.ObjectId(id)}, function(err, user){
    done(err, user);
});
});

passport.use(new LocalStrategy(
        function(username,password,done){
            db.users.findOne({username:username},function(err, user){
               if(err){
                   return done(err);
               }
                if(!user){
                    return done(null,false,{message:'incorrect username'});
                }
                bcrypt.compare(password, user.password,function(err, isMatch){
                    if(err){
                        return done(err);
                    }
                    if(isMatch){
                        return done(null, user);
                    }
                    else{
                        return done(null, false, {message: 'Incorrect Password'});
                    }
                });
                
            });
        }));

router.post('/login',
        passport.authenticate('local', {successRedirect: '/',
            failureRedirect: '/users/login',
            failureFlash: 'Invalid UserName or Password'}), 
        function (req, res) {
            console.log('Auth Successful');
            res.redirect('/');
            

});

router.get('/logout', function(req,res){
    req.logout();
    req.flash('success', 'you have logged out');
    res.redirect('/users/login');
    
});

module.exports = router;

