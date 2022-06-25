"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class u_visitor extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	u_visitor.init(
		{
			id: {
				type: DataTypes.STRING,
				primaryKey: true,
			},
			dateregistered: {
				type: "TIMESTAMP",
				defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
			},
			quizid: DataTypes.NUMBER,
			score: DataTypes.NUMBER,
		},
		{
			sequelize,
			modelName: "u_visitor",
		}
	);
	return u_visitor;
};
