// Definicion del modelo de Translation

module.exports = function (sequelize, DataTypes) {
	var Translation = sequelize.define('Translation', {}, {timestamps: true, updatedAt: false});
	return Translation;
}