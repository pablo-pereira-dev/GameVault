import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '../../../generated/prisma/client.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Erro interno do servidor';
    let error: string = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message ?? exception.message;
        error = resObj.error ?? this.formatErrorName(exception.name);
      } else if (typeof res === 'string') {
        message = res;
        error = this.formatErrorName(exception.name);
      }
    } else if (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      (typeof exception === 'object' &&
        exception !== null &&
        'code' in exception &&
        typeof (exception as any).code === 'string' &&
        (exception as any).code.startsWith('P'))
    ) {
      const code = (exception as any).code;
      if (code === 'P2025') {
        statusCode = HttpStatus.NOT_FOUND;
        message = 'Recurso não encontrado';
        error = 'Not Found';
      } else if (code === 'P2002') {
        statusCode = HttpStatus.CONFLICT;
        message = 'Conflito de unicidade nos dados enviados';
        error = 'Conflict';
      } else {
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Requisição inválida';
        error = 'Bad Request';
      }
      this.logger.error(`Prisma known request error [${code}]: ${(exception as any).message}`);
    } else if (
      exception instanceof Prisma.PrismaClientValidationError ||
      (exception instanceof Error && exception.name === 'PrismaClientValidationError')
    ) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Dados inválidos para a operação';
      error = 'Bad Request';
      this.logger.error(`Prisma validation error: ${(exception as any).message}`);
    } else {
      this.logger.error(
        `Exceção não tratada: ${exception instanceof Error ? exception.stack : JSON.stringify(exception)}`,
      );
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
    });
  }

  private formatErrorName(name: string): string {
    return name.replace(/Exception$/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
