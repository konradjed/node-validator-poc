const Ajv = require('ajv');
const logger = require('../application/logger').logger;
const fetchAgreement  = require('./AgreementClient').fetchAgreement;
const getSchema  = require('./JsonSchemaRegistryClient').getSchema;
const validator = require('./validator');

// Funkcja walidująca JSON przy użyciu schematu
const validateJson = async (agreementId, schemaName) => {
    logger.debug({ message: 'Starting validation', agreementId, schemaName });
    try {
        logger.debug({ message: 'Fetching JSON for validation', agreementId });
        const jsonData = await fetchAgreement(agreementId);

        logger.debug({ message: 'Fetching validation schema', schemaName });
        const jsonSchema = await getSchema(schemaName);

        logger.debug({ message: 'Compiling JSON Schema', schemaName });
        // validator.getSchema(jsonSchema.$id)
        // const validate = validator.compile(jsonSchema);
        const validate = new Ajv().compile(jsonSchema);

        const valid = validate(jsonData);

        if (valid) {
            logger.debug({ message: 'Validation successful', agreementId, schemaName });
            return { valid: true };
        } else {
            logger.debug({ message: 'Validation failed', agreementId, schemaName, errors: validate.errors });
            return { valid: false, errors: validate.errors || [] };
        }
    } catch (error) {
        logger.error({ message: 'Validation process failed', agreementId, schemaName, error: error.message });
        throw new Error(`Validation process failed: ${error.message}`);
    }
};

module.exports = { validateJson };