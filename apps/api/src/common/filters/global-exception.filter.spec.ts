import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GlobalExceptionFilter } from './global-exception.filter.js';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let statusMock: any;
  let jsonMock: any;
  let hostMock: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    hostMock = {
      switchToHttp: () => ({
        getResponse: () => ({
          status: statusMock,
        }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should format standard HttpException into { statusCode, message, error }', () => {
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

    filter.catch(exception, hostMock);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Bad Request',
      error: 'Bad Request',
    });
  });

  it('should preserve validation pipe errors (array of messages)', () => {
    const exception = new HttpException(
      {
        statusCode: 400,
        message: ['title should not be empty', 'price must be positive'],
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, hostMock);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: 400,
      message: ['title should not be empty', 'price must be positive'],
      error: 'Bad Request',
    });
  });

  it('should map Prisma P2025 (not found) to 404 without leaking db details', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'An operation failed because it depends on one or more records that were required but not found: Record to update not found.',
      {
        code: 'P2025',
        clientVersion: '7.10.1',
      },
    );

    filter.catch(prismaError, hostMock);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Recurso não encontrado',
      error: 'Not Found',
    });
    expect(jsonMock.mock.calls[0][0].message).not.toContain('Record to update not found');
  });

  it('should map Prisma P2002 (unique constraint) to 409 without leaking db details', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`title`) in table `public.Game`',
      {
        code: 'P2002',
        clientVersion: '7.10.1',
      },
    );

    filter.catch(prismaError, hostMock);

    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: 409,
      message: 'Conflito de unicidade nos dados enviados',
      error: 'Conflict',
    });
    expect(jsonMock.mock.calls[0][0].message).not.toContain('public.Game');
  });

  it('should map other Prisma known request errors to 400', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Foreign key constraint failed on the field: (`authorId`)',
      {
        code: 'P2003',
        clientVersion: '7.10.1',
      },
    );

    filter.catch(prismaError, hostMock);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Requisição inválida',
      error: 'Bad Request',
    });
  });

  it('should map unknown errors to 500 without leaking stack traces or internal messages', () => {
    const error = new Error('Database connection terminated unexpectedly at password=secret');

    filter.catch(error, hostMock);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Erro interno do servidor',
      error: 'Internal Server Error',
    });
    expect(jsonMock.mock.calls[0][0].message).not.toContain('secret');
  });
});
