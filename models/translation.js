// Definicion del modelo de Translation

module.exports = function (sequelize, DataTypes) {
	var Translation = sequelize.define('Translation', {}, {timestamps: false, createdAt: true});
	return Translation;
}