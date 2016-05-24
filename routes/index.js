// ROUTES "/" index.js

var express = require('express');
var router = express.Router();

var sessionControl = require('../controllers/session_control');
var wordControl = require('../controllers/word_control');
var upLoadControl = require('../controllers/upload_control');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', {errors: []});
});

// Definición de rutas de Usuario [sobre el Path "/user/*"]
router.get('/word/new', sessionControl.loginTeacherRequired, wordControl.newWord);		// formulario de registro
router.post('/word/new', sessionControl.loginTeacherRequired, wordControl.create);		// registrar word

// Cargar un archivo de registro de varios Usuarios para su posterior tratamiento
router.post('/word/upload', sessionControl.loginTeacherRequired, upLoadControl.upLoadWordLot, wordControl.uploadWordLot);

module.exports = router;
