var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var Pack = sequelize.define('Pack', {
		title: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {timestamps: false});
	return Pack;
}
