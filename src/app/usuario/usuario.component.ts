import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { tap } from 'rxjs/operators';
import { CreateUserDTO } from '../models/user.model';

@Component({
  selector: 'app-user',
  imports: [FormsModule, CommonModule, NgxPaginationModule],
  standalone: true,
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  newUser: User & { city?: string; weight?: string; confirmPassword?: string } = { 
    _id: '', 
    name: '', 
    email: '', 
    birthDate: undefined, 
    isAdmin: false, 
    isHidden: false, 
    password: '', 
    city: '', 
    weight: '',
    phone: '',
    gender: '',
    confirmPassword: '' 
  };
  selectedUser: (User & {confirmPassword?: string}) | null = null;
  page: number = 1;
  pageSize: number = 10;
  totalUsers: number = 0;
  totalPages: number = 0;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getUsers();
  }

  passwordsMatch(user: { password: string, confirmPassword?: string }): boolean {
    return user.password === user.confirmPassword;
  }

  // Obtener todos los usuarios
  getUsers(): void {
    this.userService.getUsers(this.page, this.pageSize).subscribe(
      (data) => {
        console.log('Usuarios obtenidos:', data);
        this.users = data.users;
        console.log('Users', this.users);

        this.totalUsers = data.totalUsers;
        this.totalPages = data.totalPages;
      },
      (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    );
  }

  createUser(): void {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.birthDate || !this.newUser.password || !this.newUser['weight'] || !this.newUser['city']) {
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
    if (!this.isEmailValid(this.newUser.email)) {
      const dialog: HTMLDialogElement | null = document.querySelector('#EmailInvalido');
      if (dialog) {
        dialog.showModal();
      }
      return;
    }
    if (this.users.some(u => u.email === this.newUser.email)) {
      const dialog: HTMLDialogElement | null = document.querySelector('#EmailExistente');
      if (dialog) {
        dialog.showModal();
      }
      return;
    }
    if (this.newUser.password.length < 8) {
      const dialog: HTMLDialogElement | null = document.querySelector('#PasswordInvalido');
      if (dialog) {
        dialog.showModal();
      }
      return;
    }
    if (this.users.some(u => u.name === this.newUser.name)) {
      const dialog: HTMLDialogElement | null = document.querySelector('#NombreExistente');
      if (dialog) {
        dialog.showModal();
      }
      return;
    }
    if (!this.passwordsMatch(this.newUser)) {
      const dialog: HTMLDialogElement | null = document.querySelector('#PasswordInvalido');
      if (dialog) dialog.showModal();
      return;
    }
      

    // Crear un objeto del tipo CreateUserDTO
    const userToCreate: CreateUserDTO = {
      name: this.newUser.name,
      birthDate: new Date(this.newUser.birthDate),
      email: this.newUser.email,
      password: this.newUser.password,
      isAdmin: this.newUser.isAdmin,
      isHidden: this.newUser.isHidden,
      weight: this.newUser['weight'], // Include weight
      city: this.newUser['city'],     // Include city
      phone: this.newUser['phone'],   // Include phone
      gender: this.newUser['gender'] 
    };

    console.log('Datos enviados al backend:', userToCreate);

    this.userService.createUser(userToCreate).subscribe(
      (data) => {
        this.users.push(data);
        this.newUser = { _id: '', name: '', email: '', birthDate: undefined, isAdmin: false, isHidden: false, password: '', weight: '', city: '', phone:'', gender:'' }; // Resetear el formulario
        const dialog: HTMLDialogElement | null = document.querySelector('#UsuarioCreado');
        if (dialog) {
          dialog.showModal();
        }
      },
      (error) => {
        console.error('Error al crear usuario:', error);
        const dialog: HTMLDialogElement | null = document.querySelector('#ErrorUsuarioCreado');
        if (dialog) {
          dialog.showModal();
        }
      }
    );
  }




  // Actualizar un usuario
  updateUser(): void {
    if (this.selectedUser) {
      if (!this.passwordsMatch(this.selectedUser)) {
        const dialog: HTMLDialogElement | null = document.querySelector('#PasswordInvalido');
        if (dialog) dialog.showModal();
        return;
      }
    }
    if (this.selectedUser) {
      console.log("update user", this.selectedUser);
      this.userService.updateUser(this.selectedUser).subscribe(
        (data) => {
          const index = this.users.findIndex((u) => u._id === data._id);
          if (index !== -1) {
            this.users[index] = data;
            const dialog: HTMLDialogElement | null = document.querySelector('#UsuarioActualizado');
            if (dialog) {
              dialog.showModal();
            }
          }
          this.selectedUser = null; // Limpiar selección
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
  }

  // Ocultar un usuario
  hideUser(_id: string, isHidden: boolean): void {
    this.userService.hideUser(_id, isHidden).subscribe(
      () => {
        // Refresh the user list after successfully hiding/showing the user
        this.getUsers();
        if (isHidden) {
          const dialog: HTMLDialogElement | null = document.querySelector('#UsuarioOcultado');
          if (dialog) {
            dialog.showModal();
          }
        }
        else {
          const dialog: HTMLDialogElement | null = document.querySelector('#UsuarioMostrado');
          if (dialog) {
            dialog.showModal();
          }
        }
      },
      (error) => {
        console.error('Error al ocultar/mostrar usuario:', error);
        if (isHidden) {
          const dialog: HTMLDialogElement | null = document.querySelector('#ErrorUsuarioOcultado');
          if (dialog) {
            dialog.showModal();
          }
        }
        else {
          const dialog: HTMLDialogElement | null = document.querySelector('#ErrorUsuarioMostrado');
          if (dialog) {
            dialog.showModal();
          }
        }
      }
    );
  }

  // Seleccionar un usuario para editar
  selectUser(user: User): void {
    this.selectedUser = { ...user }; // Crear una copia para evitar modificar directamente
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.getUsers();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.getUsers();
    }
  }

  isBirthDateInvalid(): boolean {
    if (!this.newUser.birthDate) {
      return true; 
    }

    const today = new Date();
    const birthDate = new Date(this.newUser.birthDate);

    // Verificar si la fecha es la actual o una fecha futura
    return (
      birthDate.getTime() === new Date('1970-01-01').getTime() ||
      birthDate >= new Date(today.toISOString().split('T')[0]));
  }

  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@(gmail|yahoo|hotmail|outlook|icloud|protonmail)\.(com|es|org|net|edu|gov|info|io|co|us|uk)$/i;
    return emailRegex.test(email);
  }
}