"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.set('trust proxy', 1);
    app.use((0, helmet_1.default)());
    app.setGlobalPrefix('api');
    const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:4200').split(',');
    app.enableCors({
        origin: allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Authorization',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`NestJS backend corriendo en puerto: ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map