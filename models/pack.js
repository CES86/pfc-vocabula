var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var Pack = sequelize.define('Pack', {});
	return Pack;
}
