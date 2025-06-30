import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenWatcherService } from '../services/token-watcher.service';

@Injectable()
export class TokenExpiredInterceptor implements HttpInterceptor {
  
  constructor(private tokenWatcher: TokenWatcherService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.tokenWatcher.checkTokenOnError(401);
        }
        return throwError(() => error);
      })
    );
  }
}