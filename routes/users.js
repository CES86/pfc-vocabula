// ROUTES "/USERS/*" users.js

var express = require('express');
var router = express.Router();

var sessionControl = require('../controllers/session_control');
var userControl = require('../controllers/user_control');
var upLoadControl = require('../controllers/upload_control');
var groupControl = require('../controllers/group_control');
var packControl = require('../controllers/pack_control');
var studentControl = require('../controllers/student_control');

// Definición de rutas de Usuario [sobre el Path "/user/*"]
router.get('/', sessionControl.loginRequired, userControl.showUsers);
router.get('/teachers', sessionControl.loginAdminRequired, userControl.showTeachers);
router.get('/students', sessionControl.loginTeacherRequired, userControl.showStudents);

// Autoload de comandos con 'username'
router.param('userFull', userControl.loadFull);  // autoload :userName
router.param('userName', userControl.loadName);  // autoload :userName
router.param('groupId', groupControl.load);  // autoload :groupId
router.param('packId', packControl.load);  // autoload :packId
router.param('homeworkId', studentControl.load);  // autoload :packId

// Definición de rutas de Sesion [sobre el Path "/user/*"]
router.get('/login', sessionControl.NOTloginRequired, sessionControl.new);		// formulario login
router.post('/login', sessionControl.NOTloginRequired, sessionControl.create);	// crear sesión
router.get('/logout', sessionControl.loginRequired, sessionControl.destroy);	// destruir sesión

// Definición de rutas de Usuario [sobre el Path "/user/*"]
router.get('/new', sessionControl.NOTloginRequired, userControl.newUser);		// formulario de registro
router.post('/new', sessionControl.NOTloginRequired, userControl.create);		// registrar usuario

// Cargar un archivo de registro de varios Usuarios para su posterior tratamiento
router.post('/upload', sessionControl.loginAdminRequired, upLoadControl.upLoadUserLot, userControl.uploadUserLot);

router.get('/:userFull([a-zA-Z]+)/edit', sessionControl.loginRequired, userControl.ownershipRequired, userControl.edit);		// editar información de cuenta
router.put('/:userFull([a-zA-Z]+)', sessionControl.loginRequired, userControl.ownershipRequired, userControl.update);			// actualizar información de cuenta
router.get('/:userName([a-zA-Z]+)', sessionControl.loginRequired, userControl.ownershipRequired, userControl.menu);				// actualizar información de cuenta
router.delete('/:userFull([a-zA-Z]+)', sessionControl.loginAdminRequired, userControl.destroy);		// borrar cuenta

router.get('/group/:groupId(\\d+)', sessionControl.loginTeacherRequired, userControl.detailGroup);
router.get('/pack/:packId(\\d+)', sessionControl.loginTeacherRequired, userControl.showPackStudents);
router.delete('/:userName([a-zA-Z]+)/group/:groupId(\\d+)', sessionControl.loginRequired, userControl.ownershipRequired, groupControl.removeStudent);
router.delete('/:userName([a-zA-Z]+)/pack/:packId(\\d+)', sessionControl.loginRequired, userControl.ownershipRequired, packControl.removeStudent);

router.get('/pack/:packId(\\d+)/homework', sessionControl.loginTeacherRequired, packControl.showHomeWorkPack);
router.post('/pack/:packId(\\d+)/homework', sessionControl.loginTeacherRequired, packControl.createHomeWorkPack);

router.get('/group/:groupId(\\d+)/teacher', sessionControl.loginAdminRequired, groupControl.showTeachers);
router.post('/group/:groupId(\\d+)/teacher', sessionControl.loginAdminRequired, groupControl.changeTeacher);

router.get('/group/:groupId(\\d+)/add', sessionControl.loginTeacherRequired, groupControl.showStudents);
router.post('/group/:groupId(\\d+)/add', sessionControl.loginTeacherRequired, groupControl.addStudents);

router.get('/pack/:packId(\\d+)/classgroup', sessionControl.loginTeacherRequired, packControl.showClassGroupPack);
router.post('/pack/:packId(\\d+)/classgroup', sessionControl.loginTeacherRequired, packControl.createClassGroupPack);

router.get('/:userName([a-zA-Z]+)/statistics', sessionControl.loginRequired, userControl.ownershipTeacherRequired, studentControl.showStatistics);		// editar información de cuenta
router.get('/:userName([a-zA-Z]+)/homework', sessionControl.loginRequired, userControl.ownershipRequired, studentControl.menuHomeWork);		// editar información de cuenta
router.get('/:userName([a-zA-Z]+)/homework/:homeworkId(\\d+)', sessionControl.loginRequired, userControl.ownershipRequired, studentControl.doHomeWork);		// editar información de cuenta
router.post('/:userName([a-zA-Z]+)/homework/:homeworkId(\\d+)', sessionControl.loginRequired, userControl.ownershipRequired, studentControl.createLog);		// editar información de cuenta

module.exports = router;
