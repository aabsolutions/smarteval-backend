import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Para errores no-HTTP (ej. excepciones de Mongoose, TypeError) nunca exponemos
    // exception.message al cliente — puede contener detalles internos (queries,
    // paths de archivo, etc). El mensaje real solo va al logger del servidor.
    const errorMessage = isHttpException
      ? (() => {
          const exceptionResponse = exception.getResponse();
          return typeof exceptionResponse === 'object' && 'message' in exceptionResponse
            ? (exceptionResponse as any).message
            : exceptionResponse;
        })()
      : 'Internal server error';

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(`${request.method} ${request.url} ${status}`, stack);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
    });
  }
}
