import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to register info from every request
 * Method, route, state and response time
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Registers request init
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Listener for competion
    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length') || 0;
      const responseTime = Date.now() - startTime;

      // Color state depending on response
      let logMethod: 'log' | 'error' | 'warn' = 'log';
      if (statusCode >= 400) {
        logMethod = 'error';
      } else if (statusCode >= 300) {
        logMethod = 'warn';
      }

      // Register response finish
      this.logger[logMethod](
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${responseTime}ms`,
      );
    });

    next();
  }
}
