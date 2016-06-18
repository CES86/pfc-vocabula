// ROUTES "/" index.js

var express = require('express');
var router = express.Router();

var sessionControl = require('../controllers/session_control');
var translationControl = require('../controllers/translation_control');
var upLoadControl = require('../controllers/upload_control');

// Definición de rutas de Usuario [sobre el Path "/translation/*"]
router.get('/', sessionControl.loginTeacherRequired, translationControl.showTranslations);

// Autoload de comandos con 'translation'
router.param('translationId', translationControl.load);


router.get('/add', sessionControl.loginTeacherRequired, translationControl.addTranslation);		// formulario de seleccion de idiomas
router.get('/new', sessionControl.loginTeacherRequired, translationControl.newTranslation);
router.post('/new', sessionControl.loginTeacherRequired, translationControl.create);		// registrar word
// Cargar un archivo de registro de varios Usuarios para su posterior tratamiento
router.post('/upload', sessionControl.loginTeacherRequired, upLoadControl.upLoadTranslationLot, translationControl.uploadTranslationLot);

router.delete('/:translationId(\\d+)', sessionControl.loginAdminRequired, translationControl.delete);

module.exports = router;
