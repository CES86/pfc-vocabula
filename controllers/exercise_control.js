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
	res.render('exercise/index', {exercises: req.exercises, pack: req.pack, errors: []}); // req.user: instancia de user cargada con autoload
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
	var exercise = models.Exercise.build({
		qstnLang: req.body.question,
		typeEx: req.body.type,
		TranslationId: req.body.translation,
		UserId: req.session.user.id
	});
	exercise.save({
		fields: ["qstnLang", "typeEx", "TranslationId", "UserId"]
	}).then(function (result) {
		if (req.body.extra) {
			for (var i = 0; i < req.body.extra.length; i++) {
				models.ExtraEx.build({
					ExerciseId: result.id,
					TranslationId: req.body.extra[i]
				}).save({fields: ["ExerciseId", "TranslationId"]});
			}
		}
		res.redirect(req.session.redir.toString());
	}).catch(function (error) {
		res.render('exercise/new', {exercise: exercise, errors: error.errors});
	});
}

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
				models.ExtraEx.findAll({
					where: {ExerciseId: exerciseId},
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
					req.exercise = exercise;
					req.extra = extraEx || [];
					next();
				});
			} else {
				next(new Error('No existen datos para este Exercise = ' + exerciseId))
			}
		}
	).catch(function (error) {
		next(error)
	});
};

// GET /user/:id/edit
exports.detailExercise = function (req, res) {
	res.render('exercise/detail', {exercise: req.exercise, extra: req.extra, errors: []}); // req.user: instancia de user cargada con autoload
};