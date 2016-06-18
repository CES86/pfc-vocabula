var models = require('../models/models.js');

// Get /login   -- Formulario de login
exports.showActions = function (req, res) {
	res.render('_system/index', {errors: []});
};

// Get /login   -- Formulario de login
exports.showLOG = function (req, res) {
	models.LOG.findAll({order: [['analizado', 'ASC'], ['createdAt', 'ASC']]}).then(function (logs) {
		res.render('_system/log', {
			logs: logs,
			errors: []
		});
	});
};

// Get /login   -- Formulario de login
exports.generateStatistics = function (req, res) {
	//TODO: Optimizar!
	models.LOG.findAll({
		where: {
			analizado: false
		}
	}).then(function (logs) {
		var correcto;
		for (var i = 0; i < logs.length; i++) {
			correcto = logs[i].correcto;
			models.User.findByPrimary(logs[i].UserId).then(function (user) {
				models.Statistics.findByPrimary(user.StatisticId).then(function (st) {
					st.increment("total");
					st.setDataValue("success", st.success + correcto);
					st.save().then();
				});
			});
			logs[i].setDataValue("analizado", true);
			logs[i].save().then();
		}
		res.render('_system/index', {errors: []});
	});
};

// Get /login   -- Formulario de login
exports.cleanUpSystem = function (req, res) {
	res.render('_system/index', {errors: []});
};