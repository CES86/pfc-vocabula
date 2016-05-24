//MULTER: Carga de archivos al Server
var multer = require('multer');

var userLotDir = './private/user/';
var wordLotDir = './private/word/';
var translationLotDir = './private/translation/';

var mkdirp = require('mkdirp');
mkdirp(userLotDir);
mkdirp(wordLotDir);
mkdirp(translationLotDir);

var storage = function (destination) {
	return multer.diskStorage({
		destination: function (req, file, callback) {
			callback(null, destination);
		},
		filename: function (req, file, callback) {
			callback(null, Date.now() + '_' + file.fieldname + '_' + file.originalname);
		}
	});
};

exports.upLoadUserLot = multer({storage: storage(userLotDir)}).single('userLot');
exports.upLoadWordLot = multer({storage: storage(wordLotDir)}).single('wordLot');
exports.upLoadTranslationLot = multer({storage: storage(translationLotDir)}).single('translationLot');
