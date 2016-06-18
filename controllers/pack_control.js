var models = require('../models/models.js');

// Get /   -- Formulario de login
exports.showPacks = function (req, res) {
	models.Pack.findAll({
		attributes: ['id', 'langTranslation', 'title', 'description', 'UserId'],
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
		var queryType = [0];
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
};

// POST /word
exports.createPack = function (req, res) {
	var pack = models.Pack.build({
		langTranslation: req.body.origenLang + req.body.destinoLang,
		title: req.body.title,
		description: req.body.description || null,
		UserId: req.session.user.id
	});
	pack.save({
		fields: ["langTranslation", "title", "description", "UserId"]
	}).then(function (result) {
		for (var i = 0; i < req.body.exSelected.length; i++) {
			models.PackEx.build({
				PackId: result.id,
				ExerciseId: req.body.exSelected[i]
			}).save({fields: ["PackId", "ExerciseId"]});
		}
		res.redirect('/pack');
	}).catch(function (error) {
		res.render('pack/new', {pack: pack, langTranslation: langTranslation, errors: error.errors});
	});
};

// GET /user/:id/edit
exports.showHomeWorkPack = function (req, res) {
	models.PackStudent.findAll({
		where: {
			PackId: req.pack.id
		},
		attributes: ["UserId"]
	}).then(function (alreadySet) {
		var sts = [0];
		for (var i = 0; i < alreadySet.length; i++) {
			sts = sts.concat(alreadySet[i].UserId);
		}
		models.User.findAll({
			where: {
				isAdmin: false,
				isTeacher: false,
				$or: [
					{
						motherLang: req.pack.langue1,
						foreignLang: req.pack.langue2
					},
					{
						motherLang: req.pack.langue2,
						foreignLang: req.pack.langue1
					},
				],
				id: {$notIn: sts}
			},
			attributes: ['id', 'username', 'firstName', 'lastName']
		}).then(function (students) {
			res.render('pack/homework', {
				students: students,
				pack: req.pack,
				errors: []
			});
		});
	});
};

// POST /word
exports.createHomeWorkPack = function (req, res) {
	for (var i = 0; i < req.body.stSelected.length; i++) {
		models.PackStudent.build({
			PackId: req.pack.id,
			UserId: req.body.stSelected[i]
		}).save({fields: ["PackId", "UserId"]});
	}
	res.redirect('/user/pack/' + req.pack.id);
};

// GET /user/:id/edit
exports.showClassGroupPack = function (req, res) {
	models.ClassGroup.findAll({
		where: {
			$or: [
				{langTranslation: req.pack.langue1 + req.pack.langue2},
				{langTranslation: req.pack.langue2 + req.pack.langue1},
			]
		},
		attributes: ["id", "name", "langTranslation", "UserId"]
	}).then(function (groups) {
		res.render('pack/classgroup', {
			groups: groups,
			pack: req.pack,
			errors: []
		});
	});
};

// POST /word
exports.createClassGroupPack = function (req, res) {
	for (var i = 0; i < req.body.cgSelected.length; i++) {
		models.User.findAll({
			where: {
				ClassGroupId: req.body.cgSelected[i]
			},
			attributes: ["id"]
		}).then(function (usersCG) {
			for (var j = 0; j < usersCG.length; j++) {
				models.PackStudent.build({
					PackId: req.pack.id,
					UserId: usersCG[j].id
				}).save({fields: ["PackId", "UserId"]});
			}
			res.redirect('/user/pack/' + req.pack.id);
		});
	}
};

// Autoload :id
exports.load = function (req, res, next, packId) {
	models.Pack.findByPrimary(packId, {
		attributes: ['id', 'langTranslation', 'title', 'description', 'UserId'],
		include: [{
			model: models.User,
			as: 'User',
			attributes: ['username']
		}]
	}).then(function (pack) {
		if (pack) {
			req.pack = pack;
			next();
		}
		else {
			next(new Error('No existen datos para este Pack = ' + packId))
		}
	}).catch(function (error) {
		next(error)
	});
};

// GET/DELETE /user/:id
exports.delete = function (req, res) {
	req.pack.destroy().then(function () {
		res.redirect(req.session.redir2);
	}).catch(function (error) {
		next(error)
	});
};

// GET/DELETE /user/:id
exports.removeStudent = function (req, res) {
	models.PackStudent.find({
			where: {
				PackId: req.pack.id,
				UserId: req.user.id
			}
		}
	).then(function (pack) {
		pack.destroy().then(function () {
			res.redirect('/user/pack/' + req.pack.id);
		});
	});
};
