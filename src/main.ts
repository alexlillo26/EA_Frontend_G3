import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import 'dialog-polyfill';
import * as dialogPolyfill from 'dialog-polyfill';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Configuración de rutas
    provideHttpClient() // Proveedor para realizar solicitudes HTTP
  ]
}).catch((err) => console.error(err));

