var models = require('../models/models.js');

// Get /   -- Formulario de login
exports.showUsers = function (req, res) {
	res.redirect('/user/' + req.session.user.username);
};

exports.showTeachers = function (req, res) {
	models.User.findAll({
		where: {
			isAdmin: false,
			isTeacher: true
		},
		attributes: ['username', 'firstName', 'lastName']
	}).then(function (teachers) {
		res.render('user/teachers', {
			teachers: teachers,
			errors: []
		});
	});
};

exports.showStudents = function (req, res) {
	models.User.findAll({
		where: {
			isAdmin: false,
			isTeacher: false
		},
		attributes: ['username', 'firstName', 'lastName']
	}).then(function (students) {
		res.render('user/students', {
			students: students,
			group: null,
			pack: null,
			errors: []
		});
	});
};

// GET /user/:id/edit
exports.showPackStudents = function (req, res) {
	models.PackStudent.findAll({
		where: {
			PackId: req.pack.id
		},
		attributes: ['UserId']
	}).then(function (packSt) {
		var sts = [0];
		for (var i = 0; i < packSt.length; i++) {
			sts = sts.concat(packSt[i].UserId);
		}
		models.User.findAll({
			where: {
				id: {$in: sts}
			},
			attributes: ['id', 'username', 'firstName', 'lastName']
		}).then(function (students) {
			res.render('user/students', {
				students: students,
				group: null,
				pack: req.pack,
				errors: []
			});
		});
	});
};

// Get /new   -- Formulario de login
exports.newUser = function (req, res) {
	var errors = req.session.errors || {};
	req.session.errors = {};

	res.render('user/new', {errors: errors});
};

// POST /user
exports.create = function (req, res) {
	models.Statistics.build(null).save().then(function (sttstc) {
		var user = models.User.build({
			email: req.body.email.toLowerCase(),
			username: req.body.username.toLowerCase(),
			password: req.body.password,
			isTeacher: req.body.isTeacher,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			motherLang: req.body.motherLang.toUpperCase(),
			foreignLang: req.body.foreignLang.toUpperCase(),
			StatisticId: (req.body.isTeacher === 'false' ? sttstc.id : null)
		});
		user.validate().then(
			function (err) {
				if (err) {
					sttstc.destroy();
					res.render('user/new', {errors: err.errors});
				} else {
					// save: guarda en DB campos username y password de user
					user.save({
						fields: ["email", "username", "password", "isTeacher", "firstName", "lastName", "motherLang", "foreignLang", "StatisticId"]
					}).then(function () {
						if (!(req.body.isTeacher === 'false'))
							sttstc.destroy();
						// crea la sesión para que el usuario acceda ya autenticado y redirige a /
						if (!req.session.user || !req.session.user.isAdmin) {
							req.session.user = user;//pasar el objeto completo o solo algunos parametros?
							//req.session.user = {id: user.id, username: user.username, isAdmin: user.isAdmin};
							res.redirect('/');
						} else
							res.redirect('/user');
					});
				}
			}
		);
	});
};

// POST /user
exports.uploadUserLot = function (req, res) {
	//Analizar el archivo!
	models.parseUserLot(req.file.path);
	res.redirect('/user');
};

// Comprueba si el user esta registrado en user
// Si autenticación falla o hay errores se ejecuta callback(error).
exports.autenticar = function (login, password, callback) {
	models.User.find({
		where: {
			username: login
		},
		attributes: ['id', 'username', 'isAdmin', 'isTeacher', 'firstName', 'lastName', 'motherLang', 'foreignLang']
	}).then(function (user) {
		if (user) {
			models.User.find({
				where: {
					id: user.id
				},
				attributes: ['password']
			}).then(function (userPass) {
				if (userPass.verifyPassword(password)) {
					callback(null, user);
				}
				else {
					callback(new Error('Password erróneo.'));
				}
			});
		}
		else
			callback(new Error('No existe user ' + login))
	}).catch(function (error) {
		callback(error)
	});
}
;

// Autoload :id
exports.loadFull = function (req, res, next, userName) {
	models.User.find({
		where: {
			username: userName.toLocaleLowerCase()
		}
	}).then(function (user) {
			if (user) {
				req.user = user;
				next();
			} else {
				next(new Error('No existe el UserName = ' + userName))
			}
		}
	).catch(function (error) {
		next(error)
	});
};

// Autoload :id
exports.loadName = function (req, res, next, userName) {
	models.User.find({
		where: {
			username: userName.toLocaleLowerCase()
		},
		attributes: {exclude: ['password']}
	}).then(function (user) {
			if (user) {
				req.user = user;
				next();
			} else {
				next(new Error('No existe el UserName = ' + userName))
			}
		}
	).catch(function (error) {
		next(error)
	});
};

// MW que permite acciones solamente si el usuario objeto corresponde con el usuario logeado o si es un admin
exports.ownershipRequired = function (req, res, next) {
	var objUser = req.user.username;
	var logUser = req.session.user.username;
	var isAdmin = req.session.user.isAdmin;

	if (isAdmin || objUser === logUser) {
		next();
	} else {
		res.redirect('/user/' + logUser);
	}
};

// MW que permite acciones solamente si el usuario objeto corresponde con el usuario logeado o si es un admin
exports.ownershipTeacherRequired = function (req, res, next) {
	var objUser = req.user.username;
	var logUser = req.session.user.username;
	var isAdmin = req.session.user.isAdmin;
	var isTeacher = req.session.user.isTeacher;

	if (isAdmin || isTeacher || objUser === logUser) {
		next();
	} else {
		res.redirect('/user/' + logUser);
	}
};

// GET /user/:id/edit
exports.edit = function (req, res) {
	var mLang, fLang = "";
	if (req.user.motherLang && req.user.foreignLang) {
		mLang = req.user.motherLang;
		fLang = req.user.foreignLang;
	}
	models.ClassGroup.findAll({
		where: {
			langTranslation: mLang + fLang
		}
	}).then(function (groups) {
		res.render('user/edit', {user: req.user, groups: groups, errors: []}); // req.user: instancia de user cargada con autoload
	});
};


// PUT /user/:id
exports.update = function (req, res, next) {
	// console.log(req.body);
	req.user.email = req.body.email;
	req.user.username = req.body.username;
	req.user.password = req.body.password;
	req.user.firstName = req.body.firstName;
	req.user.lastName = req.body.lastName;
	if (req.user.motherLang != req.body.motherLang || req.user.foreignLang != req.body.foreignLang) {
		req.user.motherLang = (req.body.motherLang == "" ? null : req.body.motherLang);
		req.user.foreignLang = (req.body.foreignLang == "" ? null : req.body.foreignLang);
		req.user.ClassGroupId = null;
	} else
		req.user.ClassGroupId = (req.body.ClassGroupId == "" ? null : req.body.ClassGroupId);

	req.user.validate().then(
		function (err) {
			if (err) {
				res.render('user/edit', {user: req.user, errors: err.errors});
			} else {
				req.user     // save: guarda campo username y password en DB
					.save({fields: ["email", "username", "password", "firstName", "lastName", "motherLang", "foreignLang", "ClassGroupId"]})
					.then(function () {
						res.redirect('/user/' + req.user.username); //añadir algo como, {errors: errors}???INFO!
					});
			}     // Redirección HTTP a /
		}
	).catch(function (error) {
		next(error)
	});
};

// GET/DELETE /user/:id
exports.destroy = function (req, res) {
	req.user.destroy().then(function () {
		// No se borra la sesión xq solo el Admin puede borrar Usuarios y redirige a /
		// delete req.session.user;
		res.redirect('/');
	}).catch(function (error) {
		next(error)
	});
};

// GET /user/:id
exports.menu = function (req, res, next) {
	var userURL = req.user;
	res.render('role/index', {
		user: userURL,
		errors: []
	});
};

// GET /user/:id/edit
exports.detailGroup = function (req, res) {
	models.User.findAll({
			where: {
				ClassGroupId: req.group.id,
				isAdmin: false,
				isTeacher: false
			},
			attributes: ['id', 'username', 'firstName', 'lastName'],
		}
	).then(function (students) {
		res.render('user/students', {
			students: students,
			group: req.group,
			pack: null,
			errors: []
		});
	});
};