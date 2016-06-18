var models = require('../models/models.js');

// Get /   -- Formulario de login
exports.showTranslations = function (req, res) {
	models.Translation.findAll({
			attributes: ['id', 'Word1Id', 'Word2Id'],
			include: [
				{
					model: models.Word,
					as: 'Word1',
					attributes: ['langue', 'word', 'aception']
				},
				{
					model: models.Word,
					as: 'Word2',
					attributes: ['langue', 'word', 'aception']
				}]
		}
	).then(function (translations) {
		res.render('translation/index', {
			translations: translations,
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
		models.Word.findAll({
			where: {
				langue: req.query.origen
			},
			attributes: ['id', 'word', 'aception'],
			order: [['word', 'ASC']]
		}).then(function (wordsOrigen) {
			models.Word.findAll({
				where: {
					langue: req.query.destino
				},
				attributes: ['id', 'word', 'aception'],
				order: [['word', 'ASC']]
			}).then(function (wordsDestino) {
				res.render('translation/new', {
					origenLang: req.query.origen,
					destinoLang: req.query.destino,
					wordsOrigen: wordsOrigen,
					wordsDestino: wordsDestino,
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
	models.Translation.find({
		where: {
			$or: [
				{
					Word1Id: req.body.word1,
					Word2Id: req.body.word2
				},
				{
					Word1Id: req.body.word2,
					Word2Id: req.body.word1
				},
			]
		},
		attributes: []
	}).then(function (busqueda) {
		if (!busqueda) {
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
							res.redirect('/translation');
						}).catch(function (error) {
							res.render('translation/new', {translation: translation, errors: error.errors});
						});
					}
				}
			).catch(function (error) {
				next(error)
			});
		} else
			models.Translation.findAll({
					include: [
						{
							model: models.Word,
							as: 'Word1',
							attributes: ['langue', 'word', 'aception']
						},
						{
							model: models.Word,
							as: 'Word2',
							attributes: ['langue', 'word', 'aception']
						}]
				}
			).then(function (translations) {
				res.render('translation/index', {
					translations: translations,
					errors: [new Error("Esa traducción ya estaba presente en la BD")]
				});
			});
	});
};

// POST /word/upload
exports.uploadTranslationLot = function (req, res) {
	//Analizar el archivo!
	models.parseTranslationLot(req.file.path, req.session.user.id);
	res.redirect('/translation');
};


// Autoload :id
exports.load = function (req, res, next, translationId) {
	models.Translation.findByPrimary(translationId).then(function (translation) {
			if (translation) {
				req.translation = translation;
				next();
			} else {
				next(new Error('No existe la Traducción = ' + translationId))
			}
		}
	).catch(function (error) {
		next(error)
	});
};

// GET/DELETE /user/:id
exports.delete = function (req, res) {
	req.translation.destroy().then(function () {
		res.redirect(req.session.redir2);
	}).catch(function (error) {
		next(error)
	});
};