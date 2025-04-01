const winston = require('winston');
const { context, trace } = require('@opentelemetry/api');
const Config = require('./config');

function getTracingContext() {
    const activeSpan = trace.getActiveSpan();
    // console.log(activeSpan)
    return {
        traceId: activeSpan ? activeSpan.spanContext().traceId : 'unknown-trace-id',
        spanId: activeSpan ? activeSpan.spanContext().spanId : 'unknown-span-id',
        parentSpanId: activeSpan ? activeSpan.parentSpanId : 'unknown-parent-span-id',
        // serviceName: activeSpan ? activeSpan.resource.attribu : 'unknown-parent-span-id'
    };
}

const logFormat = Config.configMap.LOG_FORMAT === 'dev'
    ? winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    )
    : winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {
            const tracingContext = getTracingContext();
            return JSON.stringify({
                timestamp: info.timestamp,
                level: info.level,
                message: info.message,
                ...info,
                traceId: tracingContext.traceId,
                spanId: tracingContext.spanId
            });
        })
    );

const logger = winston.createLogger({
    level: 'debug',
    format: logFormat,
    transports: [
        new winston.transports.Console()
        // ,new winston.transports.File({ filename: 'logs/app.log' })
    ]
});

module.exports = { logger };