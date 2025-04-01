const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { WinstonInstrumentation } = require('@opentelemetry/instrumentation-winston');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { trace } = require('@opentelemetry/api');

const serviceName = process.env.SERVICE_NAME || 'agreement-validator';

const setupInstrumentation = () => {
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [ATTR_SERVICE_NAME]: serviceName,
        }),
    });

    registerInstrumentations({
        tracerProvider: provider,
        instrumentations: [
            // Instrumentacja HTTP musi być zarejestrowana przed Express
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new WinstonInstrumentation({
                // Hook umożliwiający wstawienie dodatkowego kontekstu do metadanych logów
                logHook: (span, record) => {
                    record['resource.service.name'] = serviceName;
                },
            }),
        ],
    });

    // Jeśli ENABLE_CONSOLE_SPAN_EXPORTER ustawiony na 'true', dodaj exporter do konsoli
    if (process.env.ENABLE_CONSOLE_SPAN_EXPORTER === 'true') {
        provider.activeSpanProcessor = new SimpleSpanProcessor(new ConsoleSpanExporter());
    }

    // Użycie Zipkin exporter (można użyć innego eksportera)
    const exporter = new ZipkinExporter({
        serviceName: serviceName,
        url: process.env.ZIPKIN_ENDPOINT,
    });
    provider.activeSpanProcessor = new SimpleSpanProcessor(exporter);

    // Rejestracja providera, aby OpenTelemetry korzystało z jego implementacji
    provider.register();

    return trace.getTracer(serviceName);
};

module.exports = { setupInstrumentation };