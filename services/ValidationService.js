const Ajv = require('ajv');
const ajvKeywords = require('ajv-keywords');
const addFormats = require('ajv-formats');
const logger = require('../application/logger').logger;
const fetchAgreement  = require('./AgreementClient').fetchAgreement;
const getSchema  = require('./JsonSchemaRegistryClient').getSchema;
// const validator = require('./validator');

// Funkcja walidująca JSON przy użyciu schematu
const validateJson = async (agreementId, schemaName) => {
    logger.debug({ message: 'Starting validation', agreementId, schemaName });
    try {
        logger.debug({ message: 'Fetching JSON for validation', agreementId });
        const jsonData = await fetchAgreement(agreementId);

        logger.debug({ message: 'Fetching validation schema', schemaName });
        const jsonSchema = await getSchema(schemaName);

        logger.debug({ message: 'Compiling JSON Schema', schemaName });
        const ajv = new Ajv()
        ajvKeywords(ajv, ['switch']);
        addFormats(ajv);
        ajv.addFormat('pesel', { validate: validatePesel });
        ajv.addFormat('phone-number', { validate: validatePhoneNumber });
        ajv.addFormat('iban', { validate: validateIBAN });
        ajv.addFormat('date-of-birth', { validate: validateDateOfBirth });
        const validate = ajv.compile(jsonSchema);
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

function validatePesel(pesel) {
    if (!/^\d{11}$/.test(pesel)) return false;
    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(pesel[i]) * weights[i];
    const controlDigit = (10 - (sum % 10)) % 10;
    return controlDigit === parseInt(pesel[10]);
}

function validatePhoneNumber(phone) {
    return /^\+?[0-9]{7,15}$/.test(phone);
}

function validateIBAN(iban) {
    return /^[A-Z]{2}[0-9]{26}$/.test(iban);
}

function validateDateOfBirth(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

module.exports = { validateJson };