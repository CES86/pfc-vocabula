// ROUTES "/" index.js

var express = require('express');
var router = express.Router();

var sessionControl = require('../controllers/session_control');
var exerciseControl = require('../controllers/exercise_control');

// Definición de rutas de Usuario [sobre el Path "/exercise/*"]
router.get('/', sessionControl.loginTeacherRequired, exerciseControl.showExercises);

// Autoload de comandos con 'username'
router.param('exercise', exerciseControl.load);  // autoload :userName

router.get('/add', sessionControl.loginTeacherRequired, exerciseControl.addExercise);		// formulario de seleccion de idiomas
router.get('/new', sessionControl.loginTeacherRequired, exerciseControl.newExercise);
router.post('/new', sessionControl.loginTeacherRequired, exerciseControl.createExercise);		// registrar word
// router.get('/extra', sessionControl.loginTeacherRequired, exerciseControl.addExtra);
// router.post('/extra', sessionControl.loginTeacherRequired, exerciseControl.createExtra);
router.get('/:exercise(\\d+)/detail', sessionControl.loginTeacherRequired, exerciseControl.detailExercise);


module.exports = router;
