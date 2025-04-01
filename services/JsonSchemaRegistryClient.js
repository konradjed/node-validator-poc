const { makeAPICall } = require('./HttpTracingClient');
const NodeCache = require('node-cache');
const Config = require('../application/config');
const logger = require('../application/logger').logger;

const schemaCache = new NodeCache({ stdTTL: Config.configMap.CACHE_TTL });

const getSchema = async (schemaName) => {
    const cacheKey = `schema-${schemaName}`;
    let schema = schemaCache.get(cacheKey);

    if (schema) {
        logger.debug({ message: 'Schema found in cache', schemaName });
    } else {
        const url = `${Config.configMap.SCHEMA_SERVICE_URL}/${schemaName}`;
        logger.debug({ message: 'Fetching schema from external service', schemaName, url });
        schema = await makeAPICall({ method: 'GET', url });
        schemaCache.set(cacheKey, schema);
        logger.debug({ message: 'Schema cached', schemaName });
    }
    return schema;
};

module.exports = { getSchema };