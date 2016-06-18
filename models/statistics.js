var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var Statistics = sequelize.define('Statistics', {
			total: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			success: {
				type: DataTypes.REAL,
				allowNull: false,
				defaultValue: 0
			}
		}, {
			timestamps: true,
			createdAt: false
		}
	);
	return Statistics;
}