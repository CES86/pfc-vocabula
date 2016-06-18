// ROUTES "/" index.js

var express = require('express');
var router = express.Router();

var sessionControl = require('../controllers/session_control');
var exerciseControl = require('../controllers/exercise_control');
var packControl = require('../controllers/pack_control');

// Definición de rutas de Usuario [sobre el Path "/exercise/*"]
router.get('/', sessionControl.loginTeacherRequired, exerciseControl.showExercises);

// Autoload de comandos con 'username'
router.param('exerciseId', exerciseControl.load);  // autoload :userName
router.param('packId', packControl.load);  // autoload :userName

router.get('/add', sessionControl.loginTeacherRequired, exerciseControl.addExercise);
router.get('/new', sessionControl.loginTeacherRequired, exerciseControl.newExercise);
router.post('/new/type/1|2|4', sessionControl.loginTeacherRequired, exerciseControl.createExercise);
router.post('/new/type/3', sessionControl.loginTeacherRequired, exerciseControl.addExtra);
router.post('/new/extra/3', sessionControl.loginTeacherRequired, exerciseControl.createExtra);

router.get('/:exerciseId(\\d+)/detail', sessionControl.loginTeacherRequired, exerciseControl.detailExercise);

router.get('/pack/:packId(\\d+)', sessionControl.loginTeacherRequired, exerciseControl.showPackExercises);

router.delete('/:exerciseId(\\d+)', sessionControl.loginAdminRequired, exerciseControl.delete);

module.exports = router;
