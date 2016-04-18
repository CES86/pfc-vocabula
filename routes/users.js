// ROUTES "/USERS/*" users.js

var express = require('express');
var router = express.Router();

var sessionControl = require('../controllers/session_control');
var userControl = require('../controllers/user_control');

/* GET user listing. */
router.get('/', function (req, res, next) {
	res.render('user/index', {errors: []});
});

// Definición de rutas de user sobre el Path "/user/*"
router.get('/new', userControl.newUser);	// formulario de registro
router.get('/login', sessionControl.new);	// formulario login
router.post('/login', sessionControl.create);		// crear sesión
router.get('/logout', sessionControl.destroy);	// destruir sesión

module.exports = router;
