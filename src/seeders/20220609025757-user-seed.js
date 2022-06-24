"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		/**
		 * Add seed commands here.
		 *
		 * Example:
		 * await queryInterface.bulkInsert('People', [{
		 *   name: 'John Doe',
		 *   isBetaMember: false
		 * }], {});
		 */
		const users = [];
		for (let i = 0; i <= 25; i++) {
			users.push({
				firstname: `User ${i}`,
				lastname: `user${i}`,
				address: `${i} St. Test Address`,
				postcode: `0000${i}`,
				contact: `012343454${i}`,
				email: `test${i}@gmail.com`,
				username: `test${i}`,
				password: `testpass${i}`,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}

		await queryInterface.bulkInsert("m_users", users, {});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add commands to revert seed here.
		 *
		 * Example:
		 * await queryInterface.bulkDelete('People', null, {});
		 */
		await queryInterface.bulkDelete("m_users", null, {});
	},
};
