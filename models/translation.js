// Definicion del modelo de Translation

module.exports = function (sequelize, DataTypes) {
	var Translation = sequelize.define('Translation', {}, {
		getterMethods: {
			getArrowed: function () {
				return this.Word1.wordAception + " ⇆ " + this.Word2.wordAception;
			}
		},
		timestamps: true,
		updatedAt: false
	});
	return Translation;
}