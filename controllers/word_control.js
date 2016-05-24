var models = require('../models/models.js');

// Get /new   -- Formulario de login
exports.newWord = function (req, res) {
	var errors = req.session.errors || {};
	req.session.errors = {};

	res.render('word/new', {errors: errors});
};

// POST /word
exports.create = function (req, res) {
	var word = models.Word.build({
		langue: req.body.langue,
		word: req.body.word,
		aception: req.body.aception,
		UserId: req.session.user.id
	});
	word.validate().then(function (err) {
			if (err) {
				res.render('word/new', {word: word, errors: err.errors});
			} else {
				// save: guarda en DB campos username y password de user
				word.save({fields: ["langue", "word", "aception", "UserId"]}).then(function () {
					res.redirect('/user/' + req.session.user.username);
				}).catch(function (error) {
					res.render('word/new', {word: word, errors: error.errors});
				});
				;
			}
		}
	).catch(function (error) {
		next(error)
	});
};

// POST /word/upload
exports.uploadWordLot = function (req, res) {
	//Analizar el archivo!
	models.parseWordLot(req.file.path, req.session.user.id);
	res.redirect(req.session.redir.toString());
};
