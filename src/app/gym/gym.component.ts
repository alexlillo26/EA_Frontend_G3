import { Component, OnInit } from '@angular/core';
import { GymService } from '../services/gym.service';
import { Gym } from '../models/gym.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-gym',
  imports: [FormsModule, CommonModule, NgxPaginationModule],
  standalone: true,
  templateUrl: './gym.component.html',
  styleUrls: ['./gym.component.css']
})
export class GymComponent implements OnInit {
  gyms: Gym[] = [];
  newGym: Gym = { _id: '', name: '', place: '', price: 0, password: '', email: '', phone: '' };
  selectedGym: Gym | null = null;
  page: number = 1;
  pageSize: number = 10;
  totalGyms: number = 0;
  totalPages: number = 0;


  constructor(private gymService: GymService) {}

  ngOnInit(): void {
    this.getGyms();
  }

  // Obtener todos los gimnasios
  getGyms(): void {
    this.gymService.getGyms(this.page, this.pageSize).subscribe(
      (data) => {
        console.log('Gyms obtenidos:', data);
        this.gyms = data.gyms;
        console.log('Gyms', this.gyms);

        this.totalGyms = data.totalGyms;
        this.totalPages = data.totalPages;
      },
      (error) => {
        console.error('Error al obtener gimnasios:', error);
      }
    );
  }

  // Crear un nuevo gimnasio
  createGym(): void {
    this.gymService.createGym(this.newGym).subscribe(
      (data) => {
        this.gyms.push(data);
        const dialog: HTMLDialogElement | null = document.querySelector('#GimnasioCreado');
        if (dialog){
          dialog.showModal();
        }
        this.newGym = { _id: '', name: '', place: '', price: 0, password: '', email: '', phone: '' }; // Resetear el formulario
      },
      (error) => {
        console.error('Error al crear gimnasio:', error);
      }
    );
  }

  // Actualizar un gimnasio
  updateGym(): void {
    if (this.selectedGym) {
      this.gymService.updateGym(this.selectedGym).subscribe(
        (data) => {
          const index = this.gyms.findIndex((g) => g._id === data._id);
          if (index !== -1) {
            this.gyms[index] = data;
          }
          const dialog: HTMLDialogElement | null = document.querySelector('#GimnasioActualizado');
          if (dialog){
            console.log('Dialogo encontrado, mostrando...');
            dialog.showModal();
          }
          this.selectedGym = null; // Limpiar selección
        },
        (error) => {
          console.error('Error al actualizar gimnasio:', error);
        }
      );
    }
  }

  // Seleccionar un gimnasio para editar
  selectGym(gym: Gym): void {
    this.selectedGym = { ...gym }; // Crear una copia para evitar modificar directamente
  }
  // Ocultar o mostrar un gimnasio
  hideGym(_id: string, isHidden: boolean): void {
    this.gymService.hideGym(_id, isHidden).subscribe(
      () => {
        // Actualizar la lista de gimnasios después de ocultar/mostrar
        this.getGyms();
        if (isHidden) {
          const dialog: HTMLDialogElement | null = document.querySelector('#GimnasioOcultado');
          if (dialog){
            dialog.showModal();
          }
        }
        else {
          const dialog: HTMLDialogElement | null = document.querySelector('#GimnasioMostrado');
          if (dialog){
            dialog.showModal();
          }
        }
      },
      (error) => {
        console.error('Error al ocultar/mostrar gimnasio:', error);
        alert('Error al ocultar/mostrar gimnasio: ' + JSON.stringify(error));
      }
    );
  }
}