import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './http-error-interceptor';
import { BasicAuthHttpInterceptorService } from './basic-auth-http-interceptor.service';
export const interceptorProviders = 
[
    {provide: HTTP_INTERCEPTORS, useClass: BasicAuthHttpInterceptorService, multi: true},
    {provide: HTTP_INTERCEPTORS, deps: [], useClass: HttpErrorInterceptor, multi: true}
];
