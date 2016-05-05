// ROUTES "/USERS/*" users.js

var express = require('express');
var router = express.Router();

var sessionControl = require('../controllers/session_control');
var userControl = require('../controllers/user_control');

/* GET user listing. */
router.get('/', function (req, res, next) {
	res.render('user/index', {errors: []});
});

// Autoload de comandos con ids
router.param('userName', userControl.load);  // autoload :userName

// Definición de rutas de Sesion [sobre el Path "/user/*"]
router.get('/login', sessionControl.NOTloginRequired, sessionControl.new);		// formulario login
router.post('/login', sessionControl.NOTloginRequired, sessionControl.create);	// crear sesión
router.get('/logout', sessionControl.loginRequired, sessionControl.destroy);	// destruir sesión

// Definición de rutas de Usuario [sobre el Path "/user/*"]
router.get('/new', sessionControl.NOTloginRequired, userControl.newUser);		// formulario de registro
router.post('/new', sessionControl.NOTloginRequired, userControl.create);     // registrar usuario
router.get('/:userName([a-zA-Z]+)/edit', sessionControl.loginRequired, userControl.ownershipRequired, userControl.edit);     // editar información de cuenta
router.put('/:userName([a-zA-Z]+)', sessionControl.loginRequired, userControl.ownershipRequired, userControl.update);     // actualizar información de cuenta
router.get('/:userName([a-zA-Z]+)', sessionControl.loginRequired, userControl.ownershipRequired, userControl.menu);     // actualizar información de cuenta
router.delete('/:userName([a-zA-Z]+)', sessionControl.loginRequired, userControl.ownershipRequired, userControl.destroy);     // borrar cuenta


module.exports = router;
