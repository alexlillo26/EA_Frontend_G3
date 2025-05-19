import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import 'dialog-polyfill';
import * as dialogPolyfill from 'dialog-polyfill';
import { authInterceptor } from './app/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Configuración de rutas
    provideHttpClient(withInterceptors([authInterceptor])) // Remove invalid withCredentials
  ]
}).catch((err) => console.error(err));

