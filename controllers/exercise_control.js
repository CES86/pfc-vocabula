var models = require('../models/models.js');

// Get /   -- Formulario de login
exports.showExercises = function (req, res) {
	models.Exercise.findAll({
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
		res.render('exercise/index', {
			exercises: exercises,
			pack: null,
			errors: []
		});
	});
};

// GET /user/:id/edit
exports.showPackExercises = function (req, res) {
	models.PackEx.findAll({
		where: {
			PackId: req.pack.id
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
		var exos = [0];
		for (var i = 0; i < packEx.length; i++) {
			exos = exos.concat(packEx[i].ExerciseId);
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
			res.render('exercise/index', {
				exercises: exercises,
				pack: req.pack,
				errors: []
			});
		});
	});
};

// Get /add   -- Formulario de seleccion de lenguas
exports.addExercise = function (req, res) {
	models.Word.aggregate('langue', 'DISTINCT', {plain: false}).then(function (langues) {
		res.render('exercise/add', {langues: langues, errors: []});
	});
};

// Get /new   -- Formulario de seleccion de palabras
exports.newExercise = function (req, res) {
	if (req.query.origen != req.query.destino) {
		models.Translation.findAll({
				attributes: ['id', 'Word1Id', 'Word2Id'],
				include: [
					{
						model: models.Word,
						as: 'Word1',
						where: {
							$or: [
								{langue: req.query.origen},
								{langue: req.query.destino},
							]
						},
						attributes: ['word', 'aception']
					},
					{
						model: models.Word,
						as: 'Word2',
						where: {
							$or: [
								{langue: req.query.origen},
								{langue: req.query.destino},
							]
						},
						attributes: ['word', 'aception']
					}
				]
			}
		).then(function (translations) {
			res.render('exercise/new', {
				origenLang: req.query.origen,
				destinoLang: req.query.destino,
				translations: translations,
				type: req.query.type,
				errors: []
			});
		});
	}
	else
		models.Word.aggregate('langue', 'DISTINCT', {plain: false}).then(function (langues) {
			res.render('exercise/add', {
				langues: langues,
				errors: [new Error("Elija distinto idioma para Destino y Origen")]
			});
		});
};

// POST /word
exports.createExercise = function (req, res) {
	if (req.body.extra) {//seria lo mismo que comprobar el tipo == 4
		var exercise = models.Exercise.build({
			qstnLang: req.body.question,
			typeEx: req.body.type,
			TranslationId: req.body.extra[0],
			UserId: req.session.user.id
		});
		exercise.save({
			fields: ["qstnLang", "typeEx", "TranslationId", "UserId"]
		}).then(function (ex) {
			for (var i = 1; i < req.body.extra.length; i++) {
				models.ExtraEx.build({
					ExerciseId: ex.id,
					TranslationId: req.body.extra[i]
				}).save({fields: ["ExerciseId", "TranslationId"]});
			}
			res.redirect('/exercise');
		}).catch(function (error) {
			res.render('exercise/new', {exercise: exercise, errors: error.errors});
		});
	} else {
		//Estamos ante tipo 1 o 2 (Trust o Write)
		var exercise = models.Exercise.build({
			qstnLang: req.body.question,
			typeEx: req.body.type,
			TranslationId: req.body.translation,
			UserId: req.session.user.id
		});
		exercise.save({
			fields: ["qstnLang", "typeEx", "TranslationId", "UserId"]
		}).then(function () {
			res.redirect('/exercise');
		}).catch(function (error) {
			res.render('exercise/new', {exercise: exercise, errors: error.errors});
		});
	}
};

// Get /new   -- Formulario de seleccion de palabras
exports.addExtra = function (req, res) {
	models.Translation.findAll({
			where: {id: {$ne: req.body.translation}},
			attributes: ['id', 'Word1Id', 'Word2Id'],
			include: [
				{
					model: models.Word,
					as: 'Word1',
					where: {
						$or: [
							{langue: req.body.origen},
							{langue: req.body.destino},
						]
					},
					attributes: ['word', 'aception']
				},
				{
					model: models.Word,
					as: 'Word2',
					where: {
						$or: [
							{langue: req.body.origen},
							{langue: req.body.destino},
						]
					},
					attributes: ['word', 'aception']
				}
			]
		}
	).then(function (translations) {
		res.render('exercise/extra', {
			origenLang: req.body.origen,
			destinoLang: req.body.destino,
			qstnLang : req.body.question,
			TranslationId: req.body.translation,
			translations: translations,
			type: req.body.type,
			errors: []
		});
	});
};

// POST /word
exports.createExtra = function (req, res) {
		var exercise = models.Exercise.build({
			qstnLang: req.body.question,
			typeEx: req.body.type,
			TranslationId: req.body.translation,
			UserId: req.session.user.id
		});
		exercise.save({
			fields: ["qstnLang", "typeEx", "TranslationId", "UserId"]
		}).then(function (ex) {
			for (var i = 0; i < req.body.extra.length; i++) {
				models.ExtraEx.build({
					ExerciseId: ex.id,
					TranslationId: req.body.extra[i]
				}).save({fields: ["ExerciseId", "TranslationId"]});
			}
			res.redirect('/exercise');
		}).catch(function (error) {
			res.render('exercise/new', {exercise: exercise, errors: error.errors});
		});
};

// Autoload :id
exports.load = function (req, res, next, exerciseId) {
	models.Exercise.find({
		where: {
			id: exerciseId
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
	}).then(function (exercise) {
		if (exercise) {
			req.exercise = exercise;
			next();
		} else {
			next(new Error('No existen datos para este Exercise = ' + exerciseId))
		}
	}).catch(function (error) {
		next(error)
	});
};

// GET /user/:id/edit
exports.detailExercise = function (req, res) {
	models.ExtraEx.findAll({
		where: {ExerciseId: req.exercise.id},
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
		}]
	}).then(function (extraEx) {
		res.render('exercise/detail', {
			exercise: req.exercise,
			extra: extraEx || [],
			errors: []
		});
	});
};

// GET/DELETE /user/:id
exports.delete = function (req, res) {
	req.exercise.destroy().then(function () {
		res.redirect(req.session.redir2);
	}).catch(function (error) {
		next(error)
	});
};