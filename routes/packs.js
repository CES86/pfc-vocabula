// ROUTES "/" index.js

var express = require('express');
var router = express.Router();

var sessionControl = require('../controllers/session_control');
var packControl = require('../controllers/pack_control');

// Definición de rutas de Usuario [sobre el Path "/exercise/*"]
router.get('/', sessionControl.loginTeacherRequired, packControl.showPacks);

// Autoload de comandos con 'username'

router.get('/add', sessionControl.loginTeacherRequired, packControl.addPack);		// formulario de seleccion de idiomas
router.get('/new', sessionControl.loginTeacherRequired, packControl.newPack);
router.post('/new', sessionControl.loginTeacherRequired, packControl.createPack);		// registrar word

module.exports = router;
