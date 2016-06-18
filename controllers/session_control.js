// MW de autorización de accesos HTTP restringidos
exports.loginRequired = function (req, res, next) {
	if (req.session.user) {
		next();
	} else {
		res.redirect('/user/login');
	}
};
// MW de autorización de accesos HTTP restringidos
exports.NOTloginRequired = function (req, res, next) {
	if (req.session.user && !req.session.user.isAdmin) {
		res.redirect(req.session.redir.toString());// redirección a path anterior
	} else {
		next();
	}
};
// MW que permite acciones solamente si el usuario logeado es un admin
exports.loginAdminRequired = function (req, res, next) {
	if (req.session.user)
		if (req.session.user.isAdmin)
			next();
		else
			res.redirect('/user/' + req.session.user.username);
	else
		res.redirect('/user/login');
};
// MW de autorización de accesos HTTP restringidos
exports.loginTeacherRequired = function (req, res, next) {
	if (req.session.user)
		if (req.session.user.isTeacher || req.session.user.isAdmin)
			next();
		else
			res.redirect(req.session.redir.toString());// redirección a path anterior
	else
		res.redirect('/user/login');
};

// Get /login   -- Formulario de login
exports.new = function (req, res) {
	var errors = req.session.errors || {};
	req.session.errors = {};

	res.render('user/login', {errors: errors});
};

// POST /login   -- Crear la sesion si user se autentica
exports.create = function (req, res) {

	var login = req.body.login;
	var password = req.body.password;

	var userController = require('./user_control');
	userController.autenticar(login, password, function (error, user) {

		if (error) {  // si hay error retornamos mensajes de error de sesión
			req.session.errors = [{"message": 'Se ha producido un error: ' + error}];
			res.redirect("/user/login");
			return;
		}

		// Crear req.session.user y guardar campos   id  y  username
		// La sesión se define por la existencia de:    req.session.user

		req.session.user = user;//pasar el objeto completo o solo algunos parametros?
		//req.session.user = {id: user.id, username: user.username, isAdmin: user.isAdmin};

		res.redirect(req.session.redir.toString());// redirección a path anterior a login
	});
};

// DELETE /logout   -- Destruir sesion
exports.destroy = function (req, res) {
	delete req.session.user;
	res.redirect('/');
};