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
  searchTerm: string = '';
  filteredOffers: Offer[] = [];
  isSearchActive: boolean = false;
  isLoading: boolean = false; // Added loading state

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
    this.isLoading = true; // Start loading
    const loadingTimeout = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false; // Stop loading after timeout
      }
    }, 5000); // 5 seconds timeout

    this.loginService.getOffers().subscribe(
      getOffers => {
        clearTimeout(loadingTimeout);
        this.isLoading = false;
        console.log('Ofertas recibidas:', getOffers);
        // Filtrar solo ofertas activas (active puede ser boolean o number)
        this.offers = getOffers.filter(offer => (offer.active as any) == 1);
        this.filteredOffers = this.offers;
        console.log('Ofertas activas filtradas:', this.offers);
        console.log('Cantidad de ofertas activas:', this.offers.length);

        if (this.offers.length > 0) {
          console.log('Primera oferta activa:', this.offers[0]);
        }
      },
      error => {
        clearTimeout(loadingTimeout);
        this.isLoading = false;
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

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });

    // Ya no enviamos id_candidate por seguridad - se obtiene del token en el backend
    const applicationData = {
      id_offer: idOffer
    };

    this.loginService.loadUserProfile().subscribe({
      next: () => {
        this.http.post('http://localhost:30030/applications/add', applicationData, { headers })
          .subscribe({
            next: (response) => {
              this.snackBar.open('Te has inscrito a la oferta con éxito.', 'Cerrar', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                panelClass: ['snackbar-success'],
              });
              this.router.navigate(['/main/ofertas']);
            },
            error: (error) => {
              // Imprimir error completo para depuración
              console.log('Error completo:', error);

              // También capturar errores 500 que probablemente sean por inscripción duplicada
              if (error.status === 409 ||
                error.status === 400 ||
                error.status === 500 // Añadir status 500
                // (error.error && typeof error.error === 'string' && 
                //   (error.error.includes('ya inscrito') || 
                //   error.error.includes('already applied') || 
                //   error.error.includes('duplicate') ||
                //   error.error.includes('Internal Server Error'))) || // Añadir mensaje de error interno
                // (error.error && error.error.message && 
                //   (error.error.message.includes('ya inscrito') || 
                //   error.error.message.includes('already applied') ||
                //   error.error.message.includes('duplicate'))) ||
                // (error.message && 
                //   (error.message.includes('ya inscrito') || 
                //   error.message.includes('already applied') ||
                //   error.message.includes('duplicate')))
              ) {
                // Mostrar mensaje informativo en lugar de error
                this.snackBar.open('Ya te has inscrito a esta oferta', 'Cerrar', {
                  duration: 5000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom',
                  panelClass: ['snackbar-info'],
                });
              } else {
                console.log('Error completo:', error);
                // Mostrar mensaje de error genérico para otros errores
                this.snackBar.open('Error al inscribirse en la oferta.', 'Cerrar', {
                  duration: 5000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom',
                  panelClass: ['snackbar-failed'],
                });
              }
            }
          });
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
        this.snackBar.open('Error al cargar perfil de usuario.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-failed'],
        });
      }
    });
  }

  // == BARRA DE BÚSQUEDA LÓGICA ==
  getFilterOffers(): Offer[] {
    if (!this.searchTerm) {
      return this.offers;
    }
    const lowerKeyText = this.searchTerm.toLowerCase();
    return this.offers.filter((offer) =>
      offer.title.toLowerCase().includes(lowerKeyText) ||
      offer.offerDescription.toLowerCase().includes(lowerKeyText)
    );
  }

  updateDisplayOffers(): void {
    this.isSearchActive = this.searchTerm.trim().length > 0;
    let currentOffers = this.getFilterOffers();
    this.filteredOffers = currentOffers;
  }
}