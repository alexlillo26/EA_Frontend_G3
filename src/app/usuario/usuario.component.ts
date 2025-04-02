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
  newUser: User = { _id: '', name: '', email: '', birthDate: new Date(), isAdmin: false, isHidden: false, password: '' };
  selectedUser: User | null = null;
  page: number = 1;
  pageSize: number = 10;
  totalUsers: number = 0;
  totalPages: number = 0;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getUsers();
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
    if (!this.newUser.name || !this.newUser.email || !this.newUser.birthDate || !this.newUser.password) {
      alert('Por favor, complete todos los campos requeridos');
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
    };

    console.log('Datos enviados al backend:', userToCreate);

    this.userService.createUser(userToCreate).subscribe(
      (data) => {
        this.users.push(data);
        this.newUser = { _id: '', name: '', email: '', birthDate: new Date(), isAdmin: false, isHidden: false, password: '' }; // Resetear el formulario
        const dialog: HTMLDialogElement | null = document.querySelector('#UsuarioCreado');
        if (dialog) {
          dialog.showModal();
        }
      },
      (error) => {
        console.error('Error al crear usuario:', error);
        alert('Error al crear usuario: ' + (error.error?.message || 'Error desconocido'));
      }
    );
  }




  // Actualizar un usuario
  updateUser(): void {
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
          alert('Error al actualizar usuario:' + JSON.stringify(error));
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
        alert('Error al ocultar/mostrar usuario: ' + JSON.stringify(error));
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
}