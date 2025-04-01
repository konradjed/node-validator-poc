var express = require('express');
const expressWinston = require('express-winston');
// const { traceMiddleware } = require('./application/tracing');
const { setupInstrumentation } = require( './application/tracing');
const onFinished = require('on-finished');
const helmet = require('helmet');

const Config = require('./application/config');
const logger = require('./application/logger').logger;
const agreementValidateRoute = require('./routes/agreementValidate');
const errorHandler = require('./application/errorHandler');

setupInstrumentation();

var app = express();

// zabezpieczenie przed xss i innymi
app.use(helmet());

// Middleware do propagacji traceId i spanId
// app.use(traceMiddleware());

// Middleware do logowania zapytań HTTP
app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: Config.configMap.LOG_FORMAT === 'dev',
    requestWhitelist: ['headers', 'query', 'body'],
}));

// Middleware do logowania odpowiedzi HTTP i czasu wykonania
app.use((req, res, next) => {
    const startTime = process.hrtime();
    onFinished(res, () => {
        const diff = process.hrtime(startTime);
        const responseTimeMs = Math.round((diff[0] * 1e3) + (diff[1] * 1e-6));
        logger.info(JSON.stringify({
            message: 'HTTP Response',
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            responseTime: responseTimeMs, // Całkowita liczba milisekund
        }));
    });
    next();
});

app.use(express.json());

// Rejestracja tras
app.use('/agreement', agreementValidateRoute);

// Globalny handler błędów
app.use(errorHandler);
module.exports = app;