import { CommonModule } from '@angular/common';
import { Component, inject, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true
})
export class LoginComponent implements OnInit {
  user: User = { _id: '', name: '', email: '', birthDate: new Date(), isAdmin: false, isHidden: false, password: '', city: '', weight: '', phone: '', gender: '' };
  formularioLogin: FormGroup;
  authService = inject(AuthService);
  private router = inject(Router);
  @Output() loggedin = new EventEmitter<string>();
  @Output() exportLoggedIn = new EventEmitter<boolean>();
  errorMessage: string | null = null; // Propiedad para almacenar mensajes de error

  constructor(private form: FormBuilder) {
    this.formularioLogin = this.form.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]], 
    });
  }

  ngOnInit(): void {
    this.formularioLogin = this.form.group({
      email: ['', [Validators.required, Validators.email]], // Valor predeterminado para el email
      password: ['', [Validators.required, Validators.minLength(8)]] // Valor predeterminado para la contraseña
    });
  }

  hasError(controlName: string, errorType: string) {
    return this.formularioLogin.get(controlName)?.hasError(errorType) && this.formularioLogin.get(controlName)?.touched;  
  }

  login() {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      const dialog: HTMLDialogElement | null = document.querySelector('#ErrorLogin');
      if (dialog){
        dialog.showModal();
      }
      return;
    }
  
    const loginData = this.formularioLogin.value;
  
    this.authService.login(loginData).subscribe({
      next: (user: User) => {
        this.loggedin.emit();
        this.formularioLogin.reset();
        this.user = user;
        console.log("LOGIN user ", user);
        setTimeout(() => {
        const dialog: HTMLDialogElement | null = document.querySelector('#LoginExitoso');
        if (dialog){
          console.log('Dialogo encontrado, mostrando...');
          dialog.showModal();
          console.log('Dialogo mostrado: ', dialog.hasAttribute('open'));
          dialog.addEventListener('close', () => {
            if (this.user.isAdmin) {
              this.router.navigate(['/users']); // Redirigir a la gestión de usuarios
            }
            else {
              console.log("is Admiin", this.user.isAdmin);
              this.router.navigate(['/welcome'], { queryParams: { id: this.user._id } }); // Redirigir a la página de bienvenida
            }
            console.log('El diálogo se cerró automáticamente');
          });
        } else {
          console.error('No se encontró el diálogo con el ID "LoginExitoso"');} }, 0);
      },
      error: (error) => {
        console.error('Error en el login:', error);
        this.errorMessage = error.message; // Mostrar el mensaje de error en la interfaz
      }
    });
  }

  googleLogin(): void {
    window.location.href = 'http://localhost:9000/api/auth/google?origin=frontend';
  }
}