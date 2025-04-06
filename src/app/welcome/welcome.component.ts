import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
[x: string]: any;
  currentUser: User = {
    _id: '', name: '', email: '', birthDate: undefined, password: '',
    isAdmin: false,
    isHidden: false
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getCurrentUser();
  }

  // Obtener el usuario actual
  getCurrentUser(): void {
    this.userService['getCurrentUser']().subscribe(
      (user: User) => {
        console.log('Usuario actual obtenido:', user);
        this.currentUser = user;
      },
      (error: any) => {
        console.error('Error al obtener el usuario actual:', error);
        const dialog: HTMLDialogElement | null = document.querySelector('#ErrorObtenerUsuario');
        if (dialog) {
          dialog.showModal();
        }
      }
    );
  }

  // Actualizar los datos del usuario
  updateUser(): void {
    if (!this.currentUser.name || !this.currentUser.email || !this.currentUser.birthDate || !this.currentUser.password) {
      const dialog: HTMLDialogElement | null = document.querySelector('#FaltaDeDatos');
      if (dialog) {
        dialog.showModal();
      }
      return;
    }

    if (this.isBirthDateInvalid()) {
      const dialog: HTMLDialogElement | null = document.querySelector('#FechaInvalida');
      if (dialog) {
        dialog.showModal();
      }
      return;
    }

    if (!this.isEmailValid(this.currentUser.email)) {
      const dialog: HTMLDialogElement | null = document.querySelector('#EmailInvalido');
      if (dialog) {
        dialog.showModal();
      }
      return;
    }

    console.log('Actualizando usuario:', this.currentUser);
    this.userService.updateUser(this.currentUser).subscribe(
      (updatedUser) => {
        console.log('Usuario actualizado:', updatedUser);
        this.currentUser = updatedUser;
        const dialog: HTMLDialogElement | null = document.querySelector('#UsuarioActualizado');
        if (dialog) {
          dialog.showModal();
        }
      },
      (error) => {
        console.error('Error al actualizar usuario:', error);
        const dialog: HTMLDialogElement | null = document.querySelector('#ErrorUsuarioActualizado');
        if (dialog) {
          dialog.showModal();
        }
      }
    );
  }

  // Validar fecha de nacimiento
  isBirthDateInvalid(): boolean {
    if (!this.currentUser.birthDate) {
      return true;
    }

    const today = new Date();
    const birthDate = new Date(this.currentUser.birthDate);

    // Verificar si la fecha es la actual o una fecha futura
    return (
      birthDate.getTime() === new Date('1970-01-01').getTime() ||
      birthDate >= new Date(today.toISOString().split('T')[0])
    );
  }

    cancelEdit(): void {
    console.log('Edición cancelada');
    this.getCurrentUser(); // Restaurar los datos originales del usuario
  }

  // Validar correo electrónico
  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@(gmail|yahoo|hotmail|outlook|icloud|protonmail)\.(com|es|org|net|edu|gov|info|io|co|us|uk)$/i;
    return emailRegex.test(email);
  }
}