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
isLoggedAsCandidate(): any {
throw new Error('Method not implemented.');
}


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
    this.loginService.loadUserProfile();
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
    if (this.loginService.loadUserProfile()) {
      this.router.navigate(['/main/publicar']);
    } else {
      this.router.navigate(['/main/login']);
    }
  }

  applyOffer(idOffer: number): void {
    if (!this.isLoggedIn()) {
      this.loginService.clickedApplyOffer = true;
      this.loginService.idOffer = idOffer;
      this.router.navigate(['/main/login']);
      return;
    }

    this.loginService.clickedApplyOffer = true;
    this.loginService.idOffer = idOffer;
    console.log(this.loginService.idOffer);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });

    const applicationData = {
      id_candidate: this.loginService.candidateId,
      id_offer: idOffer
    };

    this.loginService.loadUserProfile().subscribe({
      next: () => {
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
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
        this.snackBar.open('Error al cargar perfil de usuario.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-failed'],
        });
      }
    });
  }
}