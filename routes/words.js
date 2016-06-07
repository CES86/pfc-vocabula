// ROUTES "/" index.js

var express = require('express');
var router = express.Router();

var sessionControl = require('../controllers/session_control');
var wordControl = require('../controllers/word_control');
var upLoadControl = require('../controllers/upload_control');

// Definición de rutas de Usuario [sobre el Path "/word/*"]
router.get('/', sessionControl.loginTeacherRequired, wordControl.showWords);

router.get('/new', sessionControl.loginTeacherRequired, wordControl.newWord);		// formulario de registro
router.post('/new', sessionControl.loginTeacherRequired, wordControl.create);		// registrar word
// Cargar un archivo de registro de varios Usuarios para su posterior tratamiento
router.post('/upload', sessionControl.loginTeacherRequired, upLoadControl.upLoadWordLot, wordControl.uploadWordLot);

// router.get('/delete', sessionControl.loginTeacherRequired, wordControl.delete);		// formulario de registro

module.exports = router;
