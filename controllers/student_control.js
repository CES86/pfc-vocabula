var models = require('../models/models.js');

// GET /user/:id/edit
exports.showStatistics = function (req, res) {
	models.Statistics.findByPrimary(req.user.StatisticId).then(function (statistic) {
		if (statistic)
			res.render('student/statistics', {
				user: req.user,
				statistic: statistic,
				errors: []
			});
		else {
			models.Statistics.build(null).save().then(function (newStatistic) {
				req.user.StatisticId = newStatistic.id;
				req.user.save({fields: ["StatisticId"]}).then(function () {
					res.render('student/statistics', {
						user: req.user,
						statistic: newStatistic,
						errors: []
					});
				});
			});
		}
	});
};

// GET /user/:id/edit
exports.menuHomeWork = function (req, res) {
	models.PackStudent.findAll({
		where: {
			UserId: req.user.id
		},
		attributes: ['PackId', 'done'],
		include: [{
			model: models.Pack,
			as: 'Pack',
			attributes: ['id', 'langTranslation', 'title', 'description', 'UserId'],
			include: [{
				model: models.User,
				as: 'User',
				attributes: ['username']
			}]
		}]
	}).then(function (packsStudent) {
		res.render('student/tasks', {
			user: req.user,
			packsStudent: packsStudent,
			errors: []
		});
	});
};

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
			models.PackEx.findAll({
				where: {
					PackId: pack.id
				},
				attributes: ['ExerciseId']
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
						attributes: ['id', 'Word1Id', 'Word2Id'],
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
				}).then(function (exercises) {
					var extraExos = [0];
					for (var i = 0; i < exercises.length; i++) {
						if (exercises[i].haveDetail())
							extraExos = extraExos.concat(exercises[i].id);
					}
					models.ExtraEx.findAll({
						where: {
							ExerciseId: {
								$in: extraExos
							}
						},
						include: [{
							attributes: ['id', 'Word1Id', 'Word2Id'],
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
					}).then(function (extras) {
						req.pack = pack;
						req.exercises = exercises;
						req.extras = extras;
						next();
					});
				});
			});
		}
		else {
			next(new Error('No existen datos para este Pack = ' + packId))
		}
	}).catch(function (error) {
		next(error)
	});
};

exports.doHomeWork = function (req, res) {
	res.render('student/homework', {
		user: req.user,
		pack: req.pack,
		exercises: req.exercises,
		extras: req.extras,
		errors: []
	});
};

exports.simulHomeWork = function (req, res) {
	res.render('student/homework', {
		user: 'simul',
		pack: req.pack,
		exercises: req.exercises,
		extras: req.extras,
		errors: []
	});
};

exports.createLog = function (req, res) {
	console.log(req.body);
	//////////////////////////////////////////////////////////////////////
	var type, qWord, aWord, fieldName;
	for (var i = 0; i < req.exercises.length; i++) {
		fieldName = req.exercises[i].id + "." + req.exercises[i].Translation.id;
		if (req.exercises[i].qstnLang == req.exercises[i].Translation.Word1.langue) {
			qWord = req.exercises[i].Translation.Word1;
			aWord = req.exercises[i].Translation.Word2;
		} else {
			qWord = req.exercises[i].Translation.Word2;
			aWord = req.exercises[i].Translation.Word1;
		}
		type = req.exercises[i].typeEx;
		switch (type) {
			case 'Trust':
				models.LOG.build({
					UserId: req.user.id,
					PackId: req.pack.id,
					ExerciseId: req.exercises[i].id,
					typeEx: type,
					TranslationId: req.exercises[i].Translation.id,
					qstnLang: req.exercises[i].qstnLang,
					qWord: qWord.word,
					aWord: aWord.word,
					correcto: req.body[fieldName]
				}).save();
				break;
			case 'Write':
				models.LOG.build({
					UserId: req.user.id,
					PackId: req.pack.id,
					ExerciseId: req.exercises[i].id,
					typeEx: type,
					TranslationId: req.exercises[i].Translation.id,
					qstnLang: req.exercises[i].qstnLang,
					qWord: qWord.word,
					aWord: req.body[fieldName],
					correcto: (req.body[fieldName] == aWord.word ? 1.0 : 0.0)
				}).save();
				break;
			case 'Select':
				models.LOG.build({
					UserId: req.user.id,
					PackId: req.pack.id,
					ExerciseId: req.exercises[i].id,
					typeEx: type,
					TranslationId: req.exercises[i].Translation.id,
					qstnLang: req.exercises[i].qstnLang,
					qWord: qWord.word,
					aWord: req.body[fieldName],
					correcto: (req.body[fieldName] == aWord.word ? 1.0 : 0.0)
				}).save();
				break;
			case 'Relation':
				models.LOG.build({
					UserId: req.user.id,
					PackId: req.pack.id,
					ExerciseId: req.exercises[i].id,
					typeEx: type,
					TranslationId: req.exercises[i].Translation.id,
					qstnLang: req.exercises[i].qstnLang,
					qWord: qWord.word,
					aWord: req.body[fieldName],
					correcto: (req.body[fieldName] == aWord.word ? 1.0 : 0.0)
				}).save();
				for (var j = 0; j < req.extras.length; j++) {
					if (req.extras[j].ExerciseId == req.exercises[i].id) {
						fieldName = req.exercises[i].id + "." + req.extras[j].Translation.id;
						if (req.exercises[i].qstnLang == req.extras[j].Translation.Word1.langue) {
							qWord = req.extras[j].Translation.Word1;
							aWord = req.extras[j].Translation.Word2;
						} else {
							qWord = req.extras[j].Translation.Word2;
							aWord = req.extras[j].Translation.Word1;
						}
						models.LOG.build({
							UserId: req.user.id,
							PackId: req.pack.id,
							ExerciseId: req.exercises[i].id,
							typeEx: type,
							TranslationId: req.extras[j].Translation.id,
							qstnLang: req.exercises[i].qstnLang,
							qWord: qWord.word,
							aWord: req.body[fieldName],
							correcto: (req.body[fieldName] == aWord.word ? 1.0 : 0.0)
						}).save();
					}
				}
				break;
		}
	}
	models.PackStudent.find({
		where: {
			UserId: req.user.id,
			PackId: req.pack.id
		}
	}).then(function (ps) {
		ps.setDataValue("done", true);
		ps.increment("total");
		ps.save().then();
	});
	res.redirect('/');
};
