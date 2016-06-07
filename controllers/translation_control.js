var models = require('../models/models.js');

// Get /   -- Formulario de login
exports.showTranslations = function (req, res) {
	models.Translation.findAndCountAll({
			include: [
				{
					model: models.Word,
					as: 'Word1'
				},
				{
					model: models.Word,
					as: 'Word2'
				}]
		}
	).then(function (translations) {
		res.render('translation/index', {
			translations: translations.rows,
			errors: []
		});
	});
};

// Get /add   -- Formulario de seleccion de lenguas
exports.addTranslation = function (req, res) {
	models.Word.aggregate('langue', 'DISTINCT', {plain: false}).then(function (langues) {
		res.render('translation/add', {langues: langues, errors: []});
	});
};

// Get /new   -- Formulario de seleccion de palabras
exports.newTranslation = function (req, res) {
	req.session.errors = {};
	if (req.query.origen != req.query.destino) {
		var errorOrigen, errorDestino;
		models.Word.findAndCountAll({
			where: {
				langue: req.query.origen
			}
		}).then(function (wordsOrigen) {
			models.Word.findAndCountAll({
				where: {
					langue: req.query.destino
				}
			}).then(function (wordsDestino) {
				res.render('translation/new', {
					wordsOrigen: wordsOrigen.rows,
					wordsDestino: wordsDestino.rows,
					errors: []
				});
			})
		})
	}
	else
		models.Word.aggregate('langue', 'DISTINCT', {plain: false}).then(function (langues) {
			res.render('translation/add', {
				langues: langues,
				errors: [new Error("Elija distinto idioma para Destino y Origen")]
			});
		});
};

// POST /word
exports.create = function (req, res) {
	var translation = models.Translation.build({
		Word1Id: req.body.word1,
		Word2Id: req.body.word2,
		UserId: req.session.user.id
	});
	translation.validate().then(function (err) {
			if (err) {
				res.render('translation/new', {translation: translation, errors: err.errors});
			} else {
				// save: guarda en DB campos username y password de user
				translation.save({
					fields: ["Word1Id", "Word2Id", "UserId"]
				}).then(function () {
					res.redirect(req.session.redir.toString());
				}).catch(function (error) {
					res.render('translation/new', {translation: translation, errors: error.errors});
				});
				;
			}
		}
	).catch(function (error) {
		next(error)
	});
};

// POST /word/upload
exports.uploadTranslationLot = function (req, res) {
	//Analizar el archivo!
	models.parseTranslationLot(req.file.path, req.session.user.id);
	res.redirect(req.session.redir.toString());
};
