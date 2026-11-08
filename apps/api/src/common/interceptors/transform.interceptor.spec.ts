import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor.js';

describe('TransformInterceptor', () => {
  it('should wrap response data in a { data } envelope', async () => {
    const interceptor = new TransformInterceptor();
    const context = {} as ExecutionContext;
    const callHandler: CallHandler = {
      handle: () => of({ id: '1', title: 'Test' }),
    };

    const observable = interceptor.intercept(context, callHandler);
    const result = await new Promise((resolve) => {
      observable.subscribe({
        next: (value) => resolve(value),
      });
    });

    expect(result).toEqual({ data: { id: '1', title: 'Test' } });
  });
});
