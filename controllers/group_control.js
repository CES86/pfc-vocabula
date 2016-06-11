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
}
;

// POST /word
exports.createGroup = function (req, res) {
	var group = models.ClassGroup.build({
		name: req.body.name,
		langTranslation: req.body.langTranslation,
		UserId: req.session.user.id
	});
	group.save({
		fields: ["name", "langTranslation", "UserId"]
	}).then(function (result) {
		models.User.update({ClassGroupId: result.id},
			{where: {id: {$in: req.body.stSelected}}}
		).then(function (x) {
			res.redirect(req.session.redir.toString());
		});
	}).catch(function (error) {
		res.render('group/new', {group: group, errors: error.errors});
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
			models.User.findAll({
					where: {
						ClassGroupId: groupId,
						isAdmin: false,
						isTeacher: false
					},
					attributes: ['id', 'username', 'firstName', 'lastName'],
				}
			).then(function (students) {
				if (students) {
					req.group = group;
					req.students = students;
					next();
				}
				else {
					next(new Error('No existen Alumnos para este Grupo = ' + groupId))
				}
			});
		}
		else {
			next(new Error('No existen datos para este Grupo = ' + groupId))
		}
	});
};


// GET /user/:id/edit
exports.detailGroup = function (req, res) {
	res.render('user/students', {students: req.students, group: req.group, errors: []}); // req.user: instancia de user cargada con autoload
};