var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var PackEx = sequelize.define('PackEx', {
		PackId: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		ExerciseId: {
			type: DataTypes.INTEGER,
			primaryKey: true
		}
	}, {timestamps: false});
	return PackEx;
}
