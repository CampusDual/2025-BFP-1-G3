import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from 'src/app/services/login.service';
import { Offer } from 'src/app/model/offer';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  candidateId: number | null = null;
  token: string = sessionStorage.getItem('token') ?? '';
  headers: HttpHeaders = new HttpHeaders({
    'Authorization': 'Bearer ' + this.token
  });

  constructor(private loginService: LoginService, private router: Router, private http: HttpClient, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.load();
    this.loadCompanyName();
    this.loadUserProfile();
  }

  loadCompanyName(): void {
    this.companyName = sessionStorage.getItem('empresa') || '';
  }

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
    if (this.loadUserProfile()) {
      this.router.navigate(['/main/publicar']);
    } else {
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

    this.http.get<{ companyId: number, candidateId: number }>('http://localhost:30030/auth/profile', { headers })
      .subscribe({
        next: (response) => {
          this.companyId = response.companyId;
          this.candidateId = response.candidateId;
        },
        error: (error) => {
          this.errorMessage = 'Error al obtener el perfil del usuario.';
          return false;
        }
      });
    return true;
  }

  applyOffer(idOffer: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });

    const applicationData = {
      id_candidate: this.candidateId,
      id_offer: idOffer
    };

    if (this.loadUserProfile()) {
      this.http.post('http://localhost:30030/applications/add', applicationData, { headers })
        .subscribe({
          next: (response) => {
            this.snackBar.open('Aplicación recibida con éxito.', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['snackbar-success'],
            });
            this.router.navigate(['/main/ofertas']);
          },
          error: (error) => {
            this.snackBar.open('Error al aplicar a la oferta.', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['snackbar-failed'],
            });
          }
        });
    } else {
      this.router.navigate(['main/login']);
    }
  }
}