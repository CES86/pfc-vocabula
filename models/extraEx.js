var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var ExtraEx = sequelize.define('ExtraEx', {
		ExerciseId: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		TranslationId: {
			type: DataTypes.INTEGER,
			primaryKey: true
		}
	}, {timestamps: false});
	return ExtraEx;
}
