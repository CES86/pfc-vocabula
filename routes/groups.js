// ROUTES "/" index.js

var express = require('express');
var router = express.Router();

var sessionControl = require('../controllers/session_control');
var groupControl = require('../controllers/group_control');

// Definición de rutas de Usuario [sobre el Path "/exercise/*"]
router.get('/', sessionControl.loginTeacherRequired, groupControl.showGroups);

// Autoload de comandos con 'username'
router.param('groupId', groupControl.load);

router.get('/add', sessionControl.loginTeacherRequired, groupControl.addGroup);		// formulario de seleccion de idiomas
router.get('/new', sessionControl.loginTeacherRequired, groupControl.newGroup);
router.post('/new', sessionControl.loginTeacherRequired, groupControl.createGroup);		// registrar word

router.delete('/:groupId(\\d+)', sessionControl.loginAdminRequired, groupControl.delete);

module.exports = router;
