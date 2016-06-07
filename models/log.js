var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var LOG = sequelize.define('LOG', {
			date: {
				type: DataTypes.DATE
			},
			analizado: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false
			},
			correcto: {
				type: DataTypes.REAL,
				allowNull: false,
				defaultValue: 0.0
			},
		}
	);
	return LOG;
}
