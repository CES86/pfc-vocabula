var models = require('../models/models.js');

// // Autoload :id
// exports.load = function (req, res, next, userName) {
// 	models.Word.find({
// 		where: {
// 			username: userName.toLocaleLowerCase()
// 		}
// 	}).then(function (user) {
// 			if (user) {
// 				req.user = user;
// 				next();
// 			} else {
// 				next(new Error('No existe el UserName = ' + userName))
// 			}
// 		}
// 	).catch(function (error) {
// 		next(error)
// 	});
// };

// Get /   -- Formulario de login
exports.showWords = function (req, res) {
	models.Word.findAndCountAll({order: [['langue', 'ASC']]}).then(function (words) {
		res.render('word/index', {
			words: words.rows,
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
					res.redirect(req.session.redir.toString());
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


// // GET/DELETE /user/:id
// exports.delete = function (req, res) {
// 	models.Word.findById(1).then(function (x) {
// 		x.destroy().then(res.redirect('/user/alex'));
// 	}).catch(function (error) {
// 		next(error)
// 	});
// };