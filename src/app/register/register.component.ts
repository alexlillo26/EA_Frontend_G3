import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AbstractControl } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';
import { AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true
})
export class RegisterComponent {
  formularioRegistre: FormGroup;
  
  @Output() registreComplet = new EventEmitter<void>();

  constructor(
    private form: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.formularioRegistre = this.form.group({
      name: ['', Validators.required],
      birthDate: ['', [Validators.required, this.birthDateValidator]],
      email: ['', [Validators.required, Validators.email],],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {validator: this.passwordMatchValidator});
  }

  ngOnInit(): void {}

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { 'passwordMismatch': true };
    }
    return null;
  }

  teError(camp: string, tipusError: string): boolean {
    const control = this.formularioRegistre.get(camp);
    return !!control && control.touched && control.hasError(tipusError);
  }


  registrar(): void {
    if (this.formularioRegistre.invalid) {
      Object.keys(this.formularioRegistre.controls).forEach(key => {
        const control = this.formularioRegistre.get(key);
        control?.markAsTouched();
      });
      const dialog: HTMLDialogElement | null = document.querySelector('#FaltaDeDatos');
      if (dialog) {
        dialog.showModal();
      }
      return;
    }

    // Obtener datos del formulario
    const dades = this.formularioRegistre.value;
    

    this.userService.createUser(dades).subscribe({
      next: () => {
        // Activa el evento de finalización del registro
        this.registreComplet.emit();
        // Restablecer formularios
        this.formularioRegistre.reset();

        const dialog: HTMLDialogElement | null = document.querySelector('#RegistroExitoso');
        if (dialog){
          dialog.showModal();
          dialog.addEventListener('close', () => {
            this.router.navigate(['/login']);
          });
        }
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        const dialog: HTMLDialogElement | null = document.querySelector('#ErrorRegistro');
        if (dialog){
          dialog.showModal();
        }
      }
    });
  }

  private birthDateValidator(control: AbstractControl): ValidationErrors | null {
    const today = new Date();
    const birthDate = new Date(control.value);
  
    // Verificar si la fecha es la actual o posterior
    if (birthDate >= new Date(today.toISOString().split('T')[0])) {
      return { invalidBirthDate: true };
    }
    return null;
  }

  private emailAlreadyExistsValidator(users: string[]): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return of(users.includes(control.value)).pipe(
        map(exists => (exists ? { emailAlreadyExists: true } : null))
      );
    };
  }

  private usernameAlreadyExistsValidator(users: string[]): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return of(users.includes(control.value)).pipe(
        map(exists => (exists ? { usernameAlreadyExists: true } : null))
      );
    };
  }
}