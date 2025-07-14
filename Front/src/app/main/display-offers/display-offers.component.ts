// @ts-nocheck
/* eslint-disable */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { Offer } from '../../model/offer';
import { ApplicationSummaryDTO } from '../../model/application-summary';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-display-offers',
  templateUrl: './display-offers.component.html',
  styleUrls: ['./display-offers.component.css']
})
export class DisplayOffersComponent implements OnInit {
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  loading = false;
  isLoading = false; // alias for template compatibility
  error = false;
  searchTerm = '';
  companyName = ''; // for template compatibility
  isSearchActive = false;
  applicationsCacheReady = false; // Indica si el caché de aplicaciones está listo
  
  // Pagination properties
  currentPage = 0;
  pageSize = 20;
  totalOffers = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  constructor(
    private loginService: LoginService, 
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Si es candidato, cargar primero el caché antes de las ofertas para evitar parpadeos
    if (this.loginService.isLoggedAsCandidate()) {
      this.loginService.loadApplicationsCacheIfCandidate()?.subscribe({
        next: () => {
          console.log('Caché de aplicaciones cargado - procediendo a cargar ofertas');
          this.applicationsCacheReady = true;
          this.loadOffers();
        },
        error: (error) => {
          console.error('Error cargando caché de aplicaciones:', error);
          // Aunque falle el caché, marcarlo como "listo" y cargar las ofertas
          this.applicationsCacheReady = true;
          this.loadOffers();
        }
      });
    } else {
      // Si no es candidato, el caché no es relevante
      this.applicationsCacheReady = true;
      this.loadOffers();
    }
  }

  loadOffers(): void {
    this.loading = true;
    this.isLoading = true;
    this.error = false;
    
    this.loginService.getOffersPaginated(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.offers = response.offers || [];
        this.filteredOffers = [...this.offers];
        this.totalOffers = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.hasNextPage = this.currentPage < (this.totalPages - 1);
        this.hasPreviousPage = this.currentPage > 0;
        this.loading = false;
        this.isLoading = false;
        this.updateDisplayOffers();
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.error = true;
        this.loading = false;
        this.isLoading = false;
      }
    });
  }

  updateDisplayOffers(): void {
    if (this.searchTerm) {
      this.isSearchActive = true;
      this.filteredOffers = this.offers.filter(offer => 
        offer.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        offer.offerDescription?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.isSearchActive = false;
      this.filteredOffers = [...this.offers];
    }
  }

  viewOfferDetails(offerId: number): void {
    this.router.navigate(['/main/offer-details', offerId]);
  }

  isCandidate(): boolean {
    return this.loginService.isLoggedAsCandidate();
  }

  isCompany(): boolean {
    return this.loginService.isLoggedAsCompany();
  }

  applyOffer(offerId: number): void {
    if (!this.isCandidate()) {
      // Si no es candidato, verificar si está logueado
      if (!this.loginService.isLoggedIn()) {
        // No está logueado, redirigir al login
        sessionStorage.setItem('redirectAfterLogin', `/main/offer-details/${offerId}`);
        this.router.navigate(['/main/login']);
        return;
      } else {
        // Está logueado pero no es candidato (probablemente empresa)
        this.snackBar.open('Solo los candidatos pueden inscribirse a ofertas', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        return;
      }
    }
    
    // Obtener el ID del candidato del token
    const candidateId = this.loginService.getCandidateIdFromToken();
    
    if (!candidateId) {
      // Si no se pudo obtener el candidateId, intentar cargar el perfil del usuario
      console.log('No se pudo obtener candidateId, cargando perfil...');
      this.loginService.loadUserProfile().subscribe({
        next: () => {
          // Después de cargar el perfil, intentar de nuevo
          const updatedCandidateId = this.loginService.getCandidateIdFromToken();
          if (updatedCandidateId) {
            this.proceedWithApplicationCheck(updatedCandidateId, offerId);
          } else {
            this.snackBar.open('Error al obtener información del candidato', 'Cerrar', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        },
        error: () => {
          this.snackBar.open('Error al obtener información del candidato', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });
      return;
    }

    this.proceedWithApplicationCheck(candidateId, offerId);
  }

  private proceedWithApplicationCheck(candidateId: number, offerId: number): void {
    // Verificar usando el caché del servicio
    const isAlreadyApplied = this.loginService.isAppliedToOffer(offerId);

    if (isAlreadyApplied) {
      this.snackBar.open('Ya estás inscrito a esta oferta', 'Cerrar', {
        duration: 5000,
        panelClass: ['snackbar-info']
      });
    } else {
      // No está inscrito, proceder con la inscripción
      this.loginService.applyToOfferService(offerId).subscribe({
        next: (response) => {
          this.snackBar.open('Inscripción recibida con éxito', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          
          // Actualizar el caché agregando la nueva aplicación
          const offer = this.offers.find(o => o.id === offerId);
          if (offer) {
            const newApplication: ApplicationSummaryDTO = {
              id: response.id || Date.now(),
              state: 1,
              offer: offer
            };
            this.loginService.addApplicationToCache(newApplication);
          }
        },
        error: (error) => {
          console.error('Error en la inscripción:', error);
          let errorMessage = 'Error al procesar la inscripción';
          
          if (error.status === 400) {
            errorMessage = 'Ya estás inscrito a esta oferta';
          } else if (error.status === 401) {
            errorMessage = 'Debes estar logueado para inscribirte';
          } else if (error.status === 403) {
            errorMessage = 'No tienes permisos para inscribirte a esta oferta';
          }

          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }

  // Método para verificar si el candidato está inscrito en una oferta
  isAppliedToOffer(offerId: number): boolean {
    return this.loginService.isAppliedToOffer(offerId);
  }

  // Método para verificar si debe mostrar el estado de inscripción
  shouldShowApplicationStatus(): boolean {
    return this.loginService.isLoggedAsCandidate() && this.applicationsCacheReady;
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      // Al cambiar de página, no necesitamos recargar el caché (ya está en memoria)
      this.loadOffers();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage--;
      // Al cambiar de página, no necesitamos recargar el caché (ya está en memoria)
      this.loadOffers();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      // Al cambiar de página, no necesitamos recargar el caché (ya está en memoria)
      this.loadOffers();
    }
  }

  get currentPageDisplay(): number {
    return this.currentPage + 1;
  }

  get startIndex(): number {
    return this.currentPage * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalOffers);
  }
}
