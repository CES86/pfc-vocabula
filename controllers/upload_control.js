//MULTER: Carga de archivos al Server
var multer = require('multer');

var userLotDir = './private/user/';
var wordLotDir = './private/word/';
var transLotDir = './private/translation/';

var mkdirp = require('mkdirp');
mkdirp(userLotDir);
mkdirp(wordLotDir);
mkdirp(transLotDir);

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
