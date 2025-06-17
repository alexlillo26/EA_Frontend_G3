import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule, Router } from '@angular/router';
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { UserComponent } from "./usuario/usuario.component";
import { AuthService } from './services/auth.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { WelcomeComponent } from './welcome/welcome.component';
import { CommonModule } from '@angular/common';
import { User } from './models/user.model';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, LoginComponent, RegisterComponent, UserComponent, WelcomeComponent, NgxPaginationModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'EA_FrontEnd_G3';
  users: User[] = [];
  user = new User();
  loggedin: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.isLoggedIn.subscribe((loggedIn) => {
        this.loggedin = loggedIn;
    });

    // Manejo de token y tipo de usuario después del inicio de sesión con Google OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refreshToken'); // Capture refreshToken from URL
    const userType = urlParams.get('type'); // 'user' o 'gym'

    if (token && refreshToken) {
        this.authService.setTokens(token, refreshToken); // Store both tokens
        this.authService.updateLoggedInState(true); // Update login state
        console.log(`✅ Tokens guardados desde URL. Tipo de usuario: ${userType}`); // Log success
        this.router.navigate(['/users']); // Redirect to users
        window.history.replaceState({}, document.title, '/'); // Clean URL
    }
  }

  logout() {
    this.authService.logout();
  }
}
