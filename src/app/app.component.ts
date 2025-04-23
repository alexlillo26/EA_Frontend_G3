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

    // Handle token and user type after Google OAuth login
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userType = urlParams.get('type'); // 'user' or 'gym'

    if (token) {
      this.authService.setTokens(token, ''); // Save the token
      this.authService.updateLoggedInState(true); // Update login state using the public method
      console.log(`Logged in as ${userType}`); // Debugging user type

      // Redirect to /users regardless of userType
  this.router.navigate(['/users']); // Redirigir a la gestión de usuarios

  window.history.replaceState({}, document.title, '/'); // Clean the URL
    }
  }

  logout() {
    this.authService.logout();
  }
}
