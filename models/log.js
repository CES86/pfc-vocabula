var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var LOG = sequelize.define('LOG', {
			typeEx: {
				type: DataTypes.STRING
			},
			qstnLang: {
				type: DataTypes.STRING(2)
			},
			qWord: {
				type: DataTypes.STRING
			},
			aWord: {
				type: DataTypes.STRING
			},
			correcto: {
				type: DataTypes.REAL,
				allowNull: false,
				defaultValue: 0.0
			}, analizado: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false
			}
		}, {
			timestamps: true,
			updatedAt: false
		}
	);
	return LOG;
}
