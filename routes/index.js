// ROUTES "/" index.js

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	if (req.session.user)
		res.redirect('/user/' + req.session.user.username);
	else
		res.render('index', {errors: []});
});

module.exports = router;
