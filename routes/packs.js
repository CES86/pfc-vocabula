// ROUTES "/" index.js

var express = require('express');
var router = express.Router();

var sessionControl = require('../controllers/session_control');
var packControl = require('../controllers/pack_control');
var studentControl = require('../controllers/student_control');

// Definición de rutas de Usuario [sobre el Path "/exercise/*"]
router.get('/', sessionControl.loginTeacherRequired, packControl.showPacks);

// Autoload de comandos con 'username'
router.param('packId', packControl.load);
router.param('homeworkId', studentControl.load);

router.get('/add', sessionControl.loginTeacherRequired, packControl.addPack);		// formulario de seleccion de idiomas
router.get('/new', sessionControl.loginTeacherRequired, packControl.newPack);
router.post('/new', sessionControl.loginTeacherRequired, packControl.createPack);		// registrar word

router.delete('/:packId(\\d+)', sessionControl.loginAdminRequired, packControl.delete);

router.get('/:homeworkId(\\d+)/homework/', sessionControl.loginTeacherRequired, studentControl.simulHomeWork);

module.exports = router;
