const express = require('express');
const ValidationService = require('../services/ValidationService');
const logger = require('../application/logger').logger;

const router = express.Router();

router.get('/:agreementId/template/:schemaName/validation', async (req, res, next) => {
    const { agreementId, schemaName } = req.params;
    logger.info({ message: 'Received validation request', agreementId, schemaName });
    logger.debug({ message: 'Starting validation process', agreementId, schemaName });

    try {
        const result = await ValidationService.validateJson(agreementId, schemaName);

        if (!result.valid) {
            logger.warn({ message: 'Validation failed', agreementId, schemaName, errors: result.errors });
            logger.debug({ message: 'Returning 400 response', agreementId, schemaName, errors: result.errors });
            return res.status(400).json({ valid: false, errors: result.errors });
        }

        logger.debug({ message: 'Returning 200 response', agreementId, schemaName });
        res.status(200).json({ valid: true });
    } catch (error) {
        logger.error({ message: 'Error during validation', agreementId, schemaName, error: error.message });
        logger.debug({ message: 'Passing error to error handler', agreementId, schemaName });
        next(error);
    }
});

module.exports = router;