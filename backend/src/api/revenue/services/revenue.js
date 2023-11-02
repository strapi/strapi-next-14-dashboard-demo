'use strict';

/**
 * revenue service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::revenue.revenue');
