const path = require('path');
require('dotenv').config();

class Config {
    static configMap = {
        PORT: null,
        JSON_SERVICE_URL: 'http://localhost:8080/jsons',
        SCHEMA_SERVICE_URL:  'http://localhost:8081/schemas',
        LOG_FORMAT: 'json',
        LOG_LEVEL: 'debug',
        CACHE_TTL: '86400',
        SERVIE_NAME: 'agreement-validator'
    };

    static loadedConfig = {};

    static loadConfig() {
        for (const param in Config.configMap) {
            Config.loadedConfig[param] = process.env[param] || Config.configMap[param];
        }
    }

    static get(param) {
        if (Object.keys(Config.loadedConfig).length === 0) {
            Config.loadConfig();
        }

        if (!(param in Config.loadedConfig)) {
            console.warn(`Attempted to access unsupported config parameter: ${param}`);
            return undefined;
        }

        return Config.loadedConfig[param];
    }
}

module.exports = Config;