const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Funkcja walidująca format PESEL
const validatePesel = (pesel) => {
    if (!/^\d{11}$/.test(pesel)) {
        return false;
    }
    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(pesel[i], 10) * weights[i];
    }
    const controlDigit = (10 - (sum % 10)) % 10;
    return controlDigit === parseInt(pesel[10], 10);
};

const validator = new Ajv();
addFormats(validator);
validator.addFormat('pesel', { validate: validatePesel });

module.exports = validator;