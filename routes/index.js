// ROUTES "/" index.js

var express = require('express');
var router = express.Router();

var sessionControl = require('../controllers/session_control');
var systemControl = require('../controllers/system_control');

/* GET home page. */
router.get('/', function (req, res, next) {
	if (req.session.user)
		res.redirect('/user/' + req.session.user.username);
	else
		res.render('index', {errors: []});
});

router.get('/system', sessionControl.loginAdminRequired, systemControl.showActions);
router.get('/system/log', sessionControl.loginAdminRequired, systemControl.showLOG);
router.get('/system/statistics', sessionControl.loginAdminRequired, systemControl.generateStatistics);
router.get('/system/cleanup', sessionControl.loginAdminRequired, systemControl.cleanUpSystem);

module.exports = router;
