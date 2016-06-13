var models = require('../models/models.js');

// Get /   -- Formulario de login
exports.showWords = function (req, res) {
	models.Word.findAll({
		attributes: ['langue', 'word', 'aception'],
		order: [['langue', 'ASC'], ['word', 'ASC']]
	}).then(function (words) {
		res.render('word/index', {
			words: words,
			errors: []
		});
	});
};

// Get /new   -- Formulario de login
exports.newWord = function (req, res) {
	res.render('word/new', {errors: []});
};

// POST /word
exports.create = function (req, res) {
	var word = models.Word.build({
		langue: req.body.langue.toUpperCase(),
		word: req.body.word.toLowerCase(),
		aception: req.body.aception.toLowerCase(),
		UserId: req.session.user.id
	});
	word.validate().then(function (err) {
			if (err) {
				res.render('word/new', {word: word, errors: err.errors});
			} else {
				// save: guarda en DB campos username y password de user
				word.save({fields: ["langue", "word", "aception", "UserId"]}).then(function () {
					res.redirect('/word');
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
	res.redirect('/word');
};


// // GET/DELETE /user/:id
// exports.delete = function (req, res) {
// 	models.Word.findById(1).then(function (x) {
// 		x.destroy().then(res.redirect('/user/alex'));
// 	}).catch(function (error) {
// 		next(error)
// 	});
// };