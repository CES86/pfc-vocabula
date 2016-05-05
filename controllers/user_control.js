var models = require('../models/models.js');

// Get /new   -- Formulario de login
exports.newUser = function (req, res) {
	var errors = req.session.errors || {};
	req.session.errors = {};

	res.render('user/new', {errors: errors});
};

// POST /user
exports.create = function (req, res) {
	var user = models.User.build({
		email: req.body.email.toLowerCase(),
		username: req.body.username.toLowerCase(),
		password: req.body.password,
		isTeacher: req.body.isTeacher,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		motherLang: req.body.motherLang.toUpperCase(),
		foreignLang: req.body.foreignLang.toUpperCase()
	});

	user
		.validate()
		.then(
			function (err) {
				if (err) {
					res.render('user/new', {user: user, errors: err.errors});
				} else {
					user // save: guarda en DB campos username y password de user
						.save({fields: ["email", "username", "password", "isTeacher", "firstName", "lastName", "motherLang", "foreignLang"]})
						.then(function () {
							// crea la sesión para que el usuario acceda ya autenticado y redirige a /
							req.session.user = user;//pasar el objeto completo o solo algunos parametros?
							//req.session.user = {id: user.id, username: user.username, isAdmin: user.isAdmin};
							res.redirect('/');
						});
				}
			}
		).catch(function (error) {
		next(error)
	});
}
;

// Comprueba si el user esta registrado en user
// Si autenticación falla o hay errores se ejecuta callback(error).
exports.autenticar = function (login, password, callback) {
	models.User.find({
		where: {
			username: login
		}
	}).then(function (user) {
		if (user) {
			if (user.verifyPassword(password)) {
				callback(null, user);
			}
			else {
				callback(new Error('Password erróneo.'));
			}
		} else {
			callback(new Error('No existe user ' + login))
		}
	}).catch(function (error) {
		callback(error)
	});
};

// Autoload :id
exports.load = function (req, res, next, userName) {
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

// MW que permite acciones solamente si el usuario objeto corresponde con el usuario logeado o si es cuenta admin
exports.ownershipRequired = function (req, res, next) {
	var objUser = req.user.username;
	var logUser = req.session.user.username;
	var isAdmin = req.session.user.isAdmin;

	if (isAdmin || objUser === logUser) {
		next();
	} else {
		res.redirect(req.session.redir.toString());// redirección a path anterior a login
	}
};

// GET /user/:id/edit
exports.edit = function (req, res) {
	res.render('user/edit', {user: req.user, errors: []}); // req.user: instancia de user cargada con autoload
};


// PUT /user/:id
exports.update = function (req, res, next) {
	// console.log(req.body);
	req.user.email = req.body.email;
	req.user.username = req.body.username;
	req.user.password = req.body.password;
	req.user.firstName = req.body.firstName;
	req.user.lastName = req.body.lastName;
	req.user.motherLang = req.body.motherLang;
	req.user.foreignLang = req.body.foreignLang;

	req.user
		.validate()
		.then(
			function (err) {
				if (err) {
					res.render('/user/' + req.body.username + "/edit", {user: req.user, errors: err.errors});
				} else {
					req.user     // save: guarda campo username y password en DB
						.save({fields: ["email", "username", "password", "firstName", "lastName", "motherLang", "foreignLang"]})
						.then(function () {
							res.redirect('/user/' + req.user.username); //añadir algo como, {errors: errors}???INFO!
						});
				}     // Redirección HTTP a /
			}
		).catch(function (error) {
		next(error)
	});
};

// DELETE /user/:id
exports.destroy = function (req, res) {
	req.user.destroy().then(function () {
		// borra la sesión y redirige a /
		delete req.session.user;
		res.redirect('/');
	}).catch(function (error) {
		next(error)
	});
};

// PUT /user/:id
exports.menu = function (req, res, next) {
	res.render('user/index', {errors: []});
};