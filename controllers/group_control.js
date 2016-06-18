var models = require('../models/models.js');

// Get /   -- Formulario de login
exports.showGroups = function (req, res) {
	models.ClassGroup.findAll({
		attributes: ['id', 'name', 'langTranslation', 'UserId'],
		include: [{
			model: models.User,
			as: 'User',
			attributes: ['username']
		}]
	}).then(function (groups) {
		res.render('group/index', {
			groups: groups,
			errors: []
		});
	});
};

// Get /add   -- Formulario de seleccion de lenguas
exports.addGroup = function (req, res) {
	models.Word.aggregate('langue', 'DISTINCT', {plain: false}).then(function (langues) {
		res.render('group/add', {langues: langues, errors: []});
	});
};

// Get /new   -- Formulario de seleccion de palabras
exports.newGroup = function (req, res) {
	if (req.query.origen != req.query.destino) {
		models.User.findAll({
			where: {
				isAdmin: false,
				isTeacher: false,
				motherLang: req.query.origen,
				foreignLang: req.query.destino
			},
			attributes: ['id', 'username', 'firstName', 'lastName']
		}).then(function (students) {
			if (students.length > 0) {
				res.render('group/new', {
					origenLang: req.query.origen,
					destinoLang: req.query.destino,
					students: students,
					errors: []
				});
			} else
				models.Word.aggregate('langue', 'DISTINCT', {plain: false}).then(function (langues) {
					res.render('group/add', {
						langues: langues,
						errors: [new Error("No existen alumnos con las características buscadas")]
					});
				});
		});
	}
	else
		models.Word.aggregate('langue', 'DISTINCT', {plain: false}).then(function (langues) {
			res.render('group/add', {
				langues: langues,
				errors: [new Error("Elija distinto idioma para Destino y Origen")]
			});
		});
};

// POST /word
exports.createGroup = function (req, res) {
	var group = models.ClassGroup.build({
		name: req.body.name,
		langTranslation: req.body.origenLang + req.body.destinoLang,
		UserId: req.session.user.id
	});
	group.save({
		fields: ["name", "langTranslation", "UserId"]
	}).then(function (result) {
		var stSel = [0];
		stSel = stSel.concat(req.body.stSelected);
		models.User.update({ClassGroupId: result.id},
			{where: {id: {$in: stSel}}}
		).then(function () {
			res.redirect('/group');
		});
	}).catch(function (error) {
		models.User.findAll({
			where: {
				isAdmin: false,
				isTeacher: false,
				motherLang: req.body.origenLang,
				foreignLang: req.body.destinoLang
			},
			attributes: ['id', 'username', 'firstName', 'lastName']
		}).then(function (students) {
			res.render('group/new', {
				origenLang: req.body.origenLang,
				destinoLang: req.body.destinoLang,
				students: students,
				errors: error.errors
			});
		});
	});
};

// GET /user/:id/edit
exports.showTeachers = function (req, res) {
	models.User.findAll({
		where: {
			id: {
				$ne: req.group.UserId
			},
			isTeacher: true,
		},
		attributes: ['id', 'username', 'firstName', 'lastName']
	}).then(function (teachers) {
		res.render('group/changeTeacher', {
			teachers: teachers,
			group: req.group,
			errors: []
		});
	});
};

// POST /word
exports.changeTeacher = function (req, res) {
	req.group.setDataValue("UserId", req.body.tcSelected);
	req.group.save().then(function () {
			res.redirect('/user/group/' + req.group.id);
		}
	);
};

// GET /user/:id/edit
exports.showStudents = function (req, res) {
	models.User.findAll({
		where: {
			ClassGroupId: req.group.id
		},
		attributes: ["id"]
	}).then(function (alreadyAdded) {
		var sts = [0];
		for (var i = 0; i < alreadyAdded.length; i++) {
			sts = sts.concat(alreadyAdded[i].id);
		}
		models.User.findAll({
			where: {
				isAdmin: false,
				isTeacher: false,
				motherLang: req.group.langue1,
				foreignLang: req.group.langue2,
				//No tiene sentido que una clase de Es->Fr haya tanto Españoles como Franceses, no? Si si, descomentar
				// $or: [
				// 	{
				// 		motherLang: req.group.langue1,
				// 		foreignLang: req.group.langue2
				// 	},
				// 	{
				// 		motherLang: req.group.langue2,
				// 		foreignLang: req.group.langue1
				// 	},
				// ],
				id: {$notIn: sts}
			},
			attributes: ['id', 'username', 'firstName', 'lastName']
		}).then(function (students) {
			res.render('group/addStudent', {
				students: students,
				group: req.group,
				errors: []
			});
		});
	});
};

// POST /word
exports.addStudents = function (req, res) {
	var stSel = [0];
	stSel = stSel.concat(req.body.stSelected);
	models.User.update({ClassGroupId: req.group.id},
		{where: {id: {$in: stSel}}}
	).then(function () {
		res.redirect('/user/group/' + req.group.id);
	});
};

// Autoload :id
exports.load = function (req, res, next, groupId) {
	models.ClassGroup.findByPrimary(groupId, {
		attributes: ['id', 'name', 'langTranslation', 'UserId'],
		include: [{
			model: models.User,
			as: 'User',
			attributes: ['username']
		}]
	}).then(function (group) {
		if (group) {
			req.group = group;
			next();
		}
		else {
			next(new Error('No existen datos para este Grupo = ' + groupId))
		}
	});
};

// GET/DELETE /user/:id
exports.delete = function (req, res) {
	req.group.destroy().then(function () {
		res.redirect('/group');
	}).catch(function (error) {
		next(error)
	});
};

// GET/DELETE /user/:id
exports.removeStudent = function (req, res) {
	req.user.setDataValue("ClassGroupId", null);
	req.user.save().then(function () {
		res.redirect('/user/group/' + req.group.id);
	});
};