'use strict';

/**
 * customer controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::customer.customer', ({ strapi }) => ({
  async totalCustomers(ctx) {
    try {
      const count = await strapi.db.query('api::customer.customer').count();
      return { data: { count } };
    } catch (err) {
      console.log(err);
    }
  },
}));
