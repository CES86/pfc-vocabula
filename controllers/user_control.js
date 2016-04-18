var models = require('../models/models.js');

// Get /new   -- Formulario de login
exports.newUser = function (req, res) {
	var errors = req.session.errors || {};
	req.session.errors = {};

	res.render('user/new', {errors: errors});
};

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