"use strict";
module.exports = {
	async up(queryInterface, Sequelize) {
		await Promise.all([
			queryInterface.createTable("m_user", {
				id: {
					allowNull: false,
					autoIncrement: true,
					primaryKey: true,
					type: Sequelize.INTEGER(11),
				},
				email: {
					type: Sequelize.STRING(100),
					unique: true,
				},
				password: {
					type: Sequelize.STRING(150),
					unique: true,
				},
				validated: {
					type: Sequelize.BOOLEAN,
					defaultValue: false,
				},
			}),

			queryInterface.createTable("u_visitor", {
				id: {
					type: Sequelize.STRING(50),
					primaryKey: true,
				},
				dateregistered: {
					type: "TIMESTAMP",
					defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
				},
				quizid: {
					type: Sequelize.INTEGER(11),
					allowNull: false,
				},
				score: {
					type: Sequelize.INTEGER(8),
					allowNull: false,
				},
			}),

			queryInterface.createTable("m_choices", {
				id: {
					type: Sequelize.INTEGER(11),
					primaryKey: true,
					autoIncrement: true,
				},
				questionid: {
					type: Sequelize.INTEGER(11),
					allowNull: false,
				},
				label: {
					type: Sequelize.TEXT,
					allowNull: false,
				},
				checkanswer: {
					type: Sequelize.BOOLEAN,
					allowNull: false,
				},
			}),

			queryInterface.createTable("m_questions", {
				id: {
					type: Sequelize.INTEGER(11),
					primaryKey: true,
					autoIncrement: true,
				},
				quizid: {
					type: Sequelize.INTEGER(11),
					allowNull: false,
				},
				type: {
					type: Sequelize.STRING(20),
					allowNull: false,
				},
				question: {
					type: Sequelize.TEXT,
					allowNull: false,
				},
			}),

			queryInterface.createTable("m_quiz", {
				id: {
					type: Sequelize.INTEGER(11),
					primaryKey: true,
					autoIncrement: true,
				},
				title: {
					type: Sequelize.STRING(100),
					allowNull: false,
					unique: true,
				},
				status: {
					type: Sequelize.STRING(10),
					allowNull: false,
				},
				linkcode: {
					type: Sequelize.STRING(12),
					allowNull: true,
				},
			}),

			queryInterface.createTable("u_answers", {
				id: {
					type: Sequelize.INTEGER(11),
					primaryKey: true,
					autoIncrement: true,
				},
				userid: {
					type: Sequelize.STRING(50),
					allowNull: false,
				},
				questionid: {
					type: Sequelize.INTEGER(11),
					allowNull: false,
				},
				answers: {
					type: Sequelize.STRING(100),
					allowNull: false,
				},
				iscorrect: {
					type: Sequelize.BOOLEAN,
					allowNull: false,
				},
			}),
		]);
	},
	async down(queryInterface, Sequelize) {
		await Promise.all([
			queryInterface.dropTable("m_user"),
			queryInterface.dropTable("u_visitor"),
			queryInterface.dropTable("m_choices"),
			queryInterface.dropTable("m_questions"),
			queryInterface.dropTable("m_quiz"),
			queryInterface.dropTable("u_answers"),
		]);
	},
};
