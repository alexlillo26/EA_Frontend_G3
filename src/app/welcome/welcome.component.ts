import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-welcome',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  currentUser: User = {
    _id: '',
    name: '',
    email: '',
    birthDate: undefined,
    password: '',
    isAdmin: false,
    isHidden: false
  };


  constructor(private route: ActivatedRoute, private userService: UserService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const userId = params['id']; // Obtén el ID del parámetro de consulta
      if (userId) {
        this.getCurrentUser(userId);
      }
    });
  }


  // Obtener el usuario actual desde el backend
  getCurrentUser(userId: string): void {
    this.userService.getCurrentUser(userId).subscribe(
      (user: User) => {
        console.log('Usuario actual obtenido:', user);
        this.currentUser = user; // Almacenar los datos del usuario en currentUser
      },
      (error: any) => {
        console.error('Error al obtener el usuario actual:', error);
      }
    );
  }

  // Actualizar los datos del usuario
  updateUser(): void {
    console.log("******************** currentUser", this.currentUser);
    if (!this.currentUser._id) {
      console.error('El ID del usuario no está definido.');
      alert('No se puede actualizar el usuario porque falta el ID.');
      return;
    }

    console.log('Actualizando usuario:', this.currentUser);

    this.userService.updateUser(this.currentUser).subscribe(
      (updatedUser) => {
        console.log('Usuario actualizado:', updatedUser);
        alert('Los datos del usuario se han actualizado correctamente.');
      },
      (error) => {
        console.error('Error al actualizar el usuario:', error);
        alert('Hubo un error al actualizar los datos del usuario.');
      }
    );
  }
}