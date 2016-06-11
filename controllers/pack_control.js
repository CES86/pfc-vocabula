var models = require('../models/models.js');

// Get /   -- Formulario de login
exports.showPacks = function (req, res) {
	models.Pack.findAll({
		attributes: ['id', 'title', 'description', 'UserId'],
		include: [{
			model: models.User,
			as: 'User',
			attributes: ['username']
		}]
	}).then(function (packs) {
		res.render('pack/index', {
			packs: packs,
			errors: []
		});
	});
};

// Get /add   -- Formulario de seleccion de lenguas
exports.addPack = function (req, res) {
	models.Word.aggregate('langue', 'DISTINCT', {plain: false}).then(function (langues) {
		res.render('pack/add', {langues: langues, errors: []});
	});
};

// Get /new   -- Formulario de seleccion de palabras
exports.newPack = function (req, res) {
	if (req.query.origen != req.query.destino) {
		var queryType = [];
		var allTypes = ['1', '2', '3', '4'];
		queryType = queryType.concat(req.query.type || allTypes);
		models.Exercise.findAll({
			where: {typeEx: {$in: queryType}},
			attributes: ['id', 'qstnLang', 'typeEx'],
			order: [['typeEx', 'ASC'], ['qstnLang', 'ASC']],
			include: [{
				attributes: ['Word1Id', 'Word2Id'],
				model: models.Translation,
				as: 'Translation',
				include: [{
					attributes: ['langue', 'word', 'aception'],
					model: models.Word,
					as: 'Word1',
					where: {
						$or: [
							{langue: req.query.origen},
							{langue: req.query.destino},
						]
					}
				}, {
					attributes: ['langue', 'word', 'aception'],
					model: models.Word,
					as: 'Word2',
					where: {
						$or: [
							{langue: req.query.origen},
							{langue: req.query.destino},
						]
					}
				}]
			}, {
				model: models.User,
				as: 'User',
				attributes: ['username']
			}]
		}).then(function (exercises) {
			if (exercises.length > 0) {
				res.render('pack/new', {
					origenLang: req.query.origen,
					destinoLang: req.query.destino,
					exercises: exercises,
					errors: []
				});
			} else
				models.Word.aggregate('langue', 'DISTINCT', {plain: false}).then(function (langues) {
					res.render('pack/add', {
						langues: langues,
						errors: [new Error("No existen ejercicios con las características buscadas")]
					});
				});
		});
	}
	else
		models.Word.aggregate('langue', 'DISTINCT', {plain: false}).then(function (langues) {
			res.render('pack/add', {
				langues: langues,
				errors: [new Error("Elija distinto idioma para Destino y Origen")]
			});
		});
}
;

// POST /word
exports.createPack = function (req, res) {
	var pack = models.Pack.build({
		title: req.body.title,
		description: req.body.description || null,
		UserId: req.session.user.id
	});
	pack.save({
		fields: ["title", "description", "UserId"]
	}).then(function (result) {
		for (var i = 0; i < req.body.exSelected.length; i++) {
			models.PackEx.build({
				PackId: result.id,
				ExerciseId: req.body.exSelected[i]
			}).save({fields: ["PackId", "ExerciseId"]});
		}
		res.redirect(req.session.redir.toString());
	}).catch(function (error) {
		res.render('pack/new', {pack: pack, errors: error.errors});
	});
}

// Autoload :id
exports.load = function (req, res, next, packId) {
	models.Pack.findByPrimary(packId, {
		include: [{
			model: models.User,
			as: 'User',
			attributes: ['username']
		}]
	}).then(function (pack) {
		if (pack) {
			models.PackEx.findAll({
				where: {
					PackId: packId
				},
				attributes: ['ExerciseId']
				//ESTO DE ABAJO FUNCIONA GENIAL!!!
				// Pero no me interesa para aprovechar la vista de Ejercicios para mostrar los detalles del PackEx

				// include: [{
				// 	attributes: ['id', 'qstnLang', 'typeEx'],
				// 	model: models.Exercise,
				// 	as: 'Exercise',
				// 	include: [{
				// 		attributes: ['Word1Id', 'Word2Id'],
				// 		model: models.Translation,
				// 		as: 'Translation',
				// 		include: [{
				// 			attributes: ['langue', 'word', 'aception'],
				// 			model: models.Word,
				// 			as: 'Word1'
				// 		}, {
				// 			attributes: ['langue', 'word', 'aception'],
				// 			model: models.Word,
				// 			as: 'Word2'
				// 		}]
				// 	}, {
				// 		model: models.User,
				// 		as: 'User',
				// 		attributes: ['username']
				// 	}]
				// }]
			}).then(function (packEx) {
				if (packEx) {
					var exos = [];
					for (var i = 0; i < packEx.length; i++) {
						exos.push(packEx[i].ExerciseId);
					}
					models.Exercise.findAll({
						where: {
							id: {$in: exos}
						},
						attributes: ['id', 'qstnLang', 'typeEx'],
						include: [{
							attributes: ['Word1Id', 'Word2Id'],
							model: models.Translation,
							as: 'Translation',
							include: [{
								attributes: ['langue', 'word', 'aception'],
								model: models.Word,
								as: 'Word1'
							}, {
								attributes: ['langue', 'word', 'aception'],
								model: models.Word,
								as: 'Word2'
							}]
						}, {
							model: models.User,
							as: 'User',
							attributes: ['username']
						}]
					}).then(function (exercises) {
						req.pack = pack;
						req.exercises = exercises;
						next();
					});
				}
				else {
					next(new Error('No existen Ejercicios para este Pack = ' + packId))
				}
			}).catch(function (error) {
				next(error)
			});
		}
		else {
			next(new Error('No existen datos para este Pack = ' + packId))
		}
	});
};
