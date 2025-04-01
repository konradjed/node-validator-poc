const { trace, context, propagation, SpanStatusCode } = require('@opentelemetry/api');
const logger = require('../application/logger');
const {configMap} = require("../application/config");

const defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
};

const makeAPICall = async (options) => {
    const tracer = trace.getTracer(configMap.SERVIE_NAME);
    return tracer.startActiveSpan('make API call', async (span) => {
        try {
            const traceHeaders = {};
            // Wstrzykiwanie kontekstu do nagłówków dla propagacji do kolejnej usługi
            propagation.inject(context.active(), traceHeaders);

            const authorizationHeaders = {};

            const requestUrl = `${options.url}`;
            const requestOptions = {
                method: options.method,
                headers: {
                    ...defaultHeaders,
                    ...traceHeaders,
                    ...authorizationHeaders,
                },
                body: JSON.stringify(options.payload),
            };

            logger.info(`API Call: ${options.method} ${options.url}, spanId[${span.spanContext().spanId}]`);
            const response = await fetch(requestUrl, requestOptions);
            // fetch nie rzuca błędu przy HTTP 400-600, dlatego trzeba to jawnie sprawdzić
            if (!response.ok) throw new Error(response.statusText);
            const data = await response.json();
            span.setStatus({ code: SpanStatusCode.OK });
            return data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'API invocation error: cause unknown';
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: errorMessage,
            });
            logger.error(`API Call Error: ${options.method} ${options.url}, Error: ${errorMessage}`);
        } finally {
            span.end();
        }
    });
};

module.exports = { makeAPICall };