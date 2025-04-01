const { makeAPICall } = require('./HttpTracingClient');
const Config = require('../application/config');
const logger = require('../application/logger').logger;

const fetchAgreement = async (agreementId) => {
    const url = `${Config.configMap.JSON_SERVICE_URL}/${agreementId}`;
    logger.debug({ message: 'Fetching agreement JSON', url, agreementId });
    const response = await makeAPICall({ method: 'GET', url });
    logger.debug({ message: 'Successfully fetched agreement JSON', agreementId });
    return response;
};

module.exports = { fetchAgreement };