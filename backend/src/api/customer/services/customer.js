'use strict';

/**
 * customer service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::customer.customer');
