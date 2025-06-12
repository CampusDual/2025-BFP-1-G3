import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Offer } from 'src/app/model/offer';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-display-offers',
  templateUrl: './display-offers.component.html',
  styleUrls: ['./display-offers.component.css']
})
export class DisplayOffersComponent implements OnInit {

  offers: Offer[] = [];    submitting: boolean = false;
    successMessage: string = '';
    errorMessage: string = '';
    companyId: number | null = null;

  constructor(private loginService: LoginService, private router:Router, private http:HttpClient) { }

  ngOnInit() {
    this.load();
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
        // Mostrar un mensaje al usuario
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
