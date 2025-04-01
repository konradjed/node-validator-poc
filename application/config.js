const fs = require('fs');
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

    static loadConfig() {
        const configPath = path.join(__dirname, 'config.json');
        let fileConfig = {};

        if (fs.existsSync(configPath)) {
            const rawConfig = fs.readFileSync(configPath);
            const parsedConfig = JSON.parse(rawConfig);

            for (const key of Object.keys(parsedConfig)) {
                if (key in Config.configMap) {
                    Config.configMap[key] = parsedConfig[key];
                } else {
                    console.warn(`Ignoring unsupported config parameter in file: ${key}`);
                }
            }
        }

        for (const key of Object.keys(Config.configMap)) {
            if (process.env[key]) {
                Config.configMap[key] = process.env[key];
            }
        }
    }

    static get(param) {
        if (!(param in Config.configMap)) {
            console.warn(`Attempted to access unsupported config parameter: ${param}`);
            return undefined;
        }

        return Config.configMap[param];
    }
}

// Load config on initialization
Config.load = () => {
    Config.configMap = { PORT: null, JSON_SERVICE_URL: null, SCHEMA_SERVICE_URL: null };
    const configPath = path.join(__dirname, 'config.json');

    if (fs.existsSync(configPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(configPath));

        for (const [key, value] of Object.entries(fileConfig)) {
            if (key in Config.configMap) {
                Config.configMap[key] = value;
            } else {
                console.warn(`Ignoring unsupported config parameter in file: ${key}`);
            }
        }
    }

    for (const key of Object.keys(Config.configMap)) {
        if (process.env[key]) {
            Config.configMap[key] = process.env[key];
        }
    }
};

// Initial config load
Config.load();

module.exports = Config;