var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var PackStudent = sequelize.define('PackStudent', {
			done: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false
			},
			total: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0
			}
		}
	);
	return PackStudent;
}
