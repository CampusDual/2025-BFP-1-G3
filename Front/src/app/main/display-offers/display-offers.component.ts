import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from 'src/app/services/login.service';
import { Offer } from 'src/app/model/offer';

@Component({
  selector: 'app-display-offers',
  templateUrl: './display-offers.component.html',
  styleUrls: ['./display-offers.component.css']
})
export class DisplayOffersComponent implements OnInit {

  offers: Offer[] = [];
  submitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  companyId: number | null = null;
  companyName: string = ''; // Nuevo campo para el nombre de la empresa

  constructor(private loginService: LoginService, private router:Router, private http:HttpClient) { }

  ngOnInit() {
    this.load();
    this.loadCompanyName(); // Cargar el nombre de la empresa al inicializar
  }

  // Nuevo método para cargar el nombre de la empresa
  loadCompanyName(): void {
    this.companyName = sessionStorage.getItem('empresa') || '';
  }

  // Nuevo método para verificar si el usuario está logueado
  isLoggedIn(): boolean {
    return sessionStorage.getItem('token') !== null;
  }

  load(): void {
    console.log('Iniciando carga de ofertas...');
    this.loginService.getOffers().subscribe(
      getOffers => {
        this.offers = getOffers;
        console.log('Ofertas cargadas:', this.offers);
        console.log('Cantidad de ofertas:', this.offers.length);
        if (this.offers.length > 0) {
          console.log('Primera oferta:', this.offers[0]);
        }
      },
      error => {
        console.error('Error al cargar ofertas:', error);
      }
    );
  }

  publicar(): void {
    if(this.loadUserProfile()){
      this.router.navigate(['/main/publicar']);
    } else{
      this.router.navigate(['/main/login']);
    }
  }

  loadUserProfile(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No está logueado.';
      return false;
    }

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    this.http.get<{ companyId: number }>('http://localhost:30030/auth/profile', { headers })
      .subscribe({
        next: (response) => {
          this.companyId = response.companyId;
        },
        error: (error) => {
          this.errorMessage = 'Error al obtener el perfil del usuario.';
          return false;
        }
      });
      return true;
  }
}