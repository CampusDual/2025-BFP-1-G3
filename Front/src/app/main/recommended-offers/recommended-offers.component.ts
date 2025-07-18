// @ts-nocheck
/* eslint-disable */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { Offer } from '../../model/offer';
import { ApplicationSummaryDTO } from '../../model/application-summary';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-recommended-offers',
  templateUrl: './recommended-offers.component.html',
  styleUrls: ['./recommended-offers.component.css']
})
export class RecommendedOffersComponent implements OnInit {
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  loading = false;
  isLoading = false;
  error = false;
  searchTerm = '';
  isSearchActive = false;
  applicationsCacheReady = false;
  
  // Tech labels del candidato para calcular coincidencias
  candidateTechLabelIds: number[] = [];
  
  // Cache para evitar llamadas repetitivas en el template
  private appliedOffersCache = new Map<number, boolean>();
  
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
    // Verificar que el usuario sea candidato
    if (!this.loginService.isLoggedAsCandidate()) {
      this.snackBar.open('Solo los candidatos pueden ver ofertas recomendadas', 'Cerrar', {
        duration: 5000,
        panelClass: ['snackbar-failed'],
        verticalPosition: 'top'
      });
      this.router.navigate(['/main/ofertas']);
      return;
    }

    // Establecer estado de carga desde el inicio
    this.loading = true;
    this.isLoading = true;
    
    // Cargar datos del candidato primero para obtener sus tech labels
    this.loginService.getCandidateData().subscribe({
      next: (candidateData) => {
        // Guardar las tech labels del candidato
        this.candidateTechLabelIds = candidateData.techLabelIds || [];
        
        // Luego cargar caché y ofertas en paralelo
        const cachePromise = this.loginService.applicationsCacheLoaded ? 
          Promise.resolve(this.loginService.candidateApplicationsCache || []) :
          this.loginService.loadApplicationsCacheIfCandidate()?.toPromise() || Promise.resolve([]);
        
        const offersPromise = this.loadRecommendedOffersAsync();
        
        Promise.all([cachePromise, offersPromise]).then(
          ([cacheResult, offersResult]) => {
            this.applicationsCacheReady = true;
            // Actualizar el caché de ofertas aplicadas para evitar verificaciones repetitivas
            this.updateAppliedOffersCache();
            // Ahora SÍ terminamos el loading para mostrar las ofertas con el estado correcto
            this.loading = false;
            this.isLoading = false;
          }
        ).catch(
          (error) => {
            this.applicationsCacheReady = true;
            // Asegurar que el loading se detenga incluso si hay errores
            this.loading = false;
            this.isLoading = false;
          }
        );
      },
      error: (error) => {
        // Error cargando datos del candidato
        this.loading = false;
        this.isLoading = false;
        this.snackBar.open('Error cargando datos del candidato', 'Cerrar', {
          duration: 5000,
          panelClass: ['snackbar-failed'],
          verticalPosition: 'top',
        });
      }
    });
  }

  // Método asíncrono para cargar ofertas recomendadas (usado en carga paralela)
  private loadRecommendedOffersAsync(): Promise<any> {
    return new Promise((resolve, reject) => {
      const token = sessionStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const url = `http://localhost:30030/offers/recommended?page=${this.currentPage}&size=${this.pageSize}`;

      fetch(url, { headers })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          // Filtrar ofertas que tengan al menos una etiqueta técnica
          const allOffers = data.offers || [];
          this.offers = allOffers.filter(offer => 
            offer.techLabels && 
            Array.isArray(offer.techLabels) && 
            offer.techLabels.length > 0
          );
          
          // Ordenar ofertas por número de coincidencias (de mayor a menor)
          this.offers.sort((a, b) => {
            const matchesA = this.getSharedTechLabelsCount(a);
            const matchesB = this.getSharedTechLabelsCount(b);
            return matchesB - matchesA; // Orden descendente
          });
          
          this.filteredOffers = [...this.offers];
          this.totalOffers = data.totalElements || 0;
          this.totalPages = data.totalPages || 0;
          this.hasNextPage = this.currentPage < (this.totalPages - 1);
          this.hasPreviousPage = this.currentPage > 0;
          this.updateDisplayOffers();
          resolve(data);
        })
        .catch(error => {
          console.error('❌ Error cargando ofertas recomendadas:', error);
          this.error = true;
          reject(error);
        });
    });
  }

  loadOffers(): void {
    this.loading = true;
    this.isLoading = true;
    this.error = false;
    
    const token = sessionStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const url = `http://localhost:30030/offers/recommended?page=${this.currentPage}&size=${this.pageSize}`;

    fetch(url, { headers })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        // Filtrar ofertas que tengan al menos una etiqueta técnica
        const allOffers = data.offers || [];
        this.offers = allOffers.filter(offer => 
          offer.techLabels && 
          Array.isArray(offer.techLabels) && 
          offer.techLabels.length > 0
        );
        
        // Ordenar ofertas por número de coincidencias (de mayor a menor)
        this.offers.sort((a, b) => {
          const matchesA = this.getSharedTechLabelsCount(a);
          const matchesB = this.getSharedTechLabelsCount(b);
          return matchesB - matchesA; // Orden descendente
        });
        
        this.filteredOffers = [...this.offers];
        this.totalOffers = data.totalElements || 0;
        this.totalPages = data.totalPages || 0;
        this.hasNextPage = this.currentPage < (this.totalPages - 1);
        this.hasPreviousPage = this.currentPage > 0;
        this.loading = false;
        this.isLoading = false;
        this.updateDisplayOffers();
      })
      .catch(error => {
        console.error('❌ Error cargando ofertas recomendadas:', error);
        this.error = true;
        this.loading = false;
        this.isLoading = false;
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
    this.router.navigate(['/main/detalles-de-la-oferta', offerId]);
  }

  isCandidate(): boolean {
    return this.loginService.isLoggedAsCandidate();
  }

  applyOffer(offerId: number): void {
    // Obtener el ID del candidato del token
    const candidateId = this.loginService.getCandidateIdFromToken();
    
    if (!candidateId) {
      console.log('No se pudo obtener candidateId, cargando perfil...');
      this.loginService.loadUserProfile().subscribe({
        next: () => {
          const updatedCandidateId = this.loginService.getCandidateIdFromToken();
          if (updatedCandidateId) {
            this.proceedWithApplicationCheck(updatedCandidateId, offerId);
          } else {
            this.snackBar.open('Error al obtener información del candidato', 'Cerrar', {
              duration: 5000,
              panelClass: ['snackbar-failed'],
              verticalPosition: 'top'
            });
          }
        },
        error: () => {
          this.snackBar.open('Error al obtener información del candidato', 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-failed'],
            verticalPosition: 'top'
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
        panelClass: ['snackbar-info'],
        verticalPosition: 'top'
      });
    } else {
      // No está inscrito, proceder con la inscripción
      this.loginService.applyToOfferService(offerId).subscribe({
        next: (response) => {
          this.snackBar.open('Inscripción recibida con éxito', 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-success'],
            verticalPosition: 'top'
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
            // Actualizar también nuestro caché local
            this.appliedOffersCache.set(offerId, true);
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
            panelClass: ['snackbar-failed'],
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  // Método para verificar si el candidato está inscrito en una oferta
  isAppliedToOffer(offerId: number): boolean {
    if (!this.applicationsCacheReady) {
      return false;
    }
    
    // Usar caché local para evitar llamadas repetitivas
    if (this.appliedOffersCache.has(offerId)) {
      return this.appliedOffersCache.get(offerId)!;
    }
    
    // Solo hacer la verificación una vez por oferta
    const isApplied = this.loginService.isAppliedToOffer(offerId);
    this.appliedOffersCache.set(offerId, isApplied);
    return isApplied;
  }

  // Método para verificar si debe mostrar el estado de inscripción
  shouldShowApplicationStatus(): boolean {
    const isCacheReady = this.applicationsCacheReady || this.loginService.applicationsCacheLoaded;
    return this.loginService.isLoggedAsCandidate() && isCacheReady;
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadOffers();
      this.updateAppliedOffersCache();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage--;
      this.loadOffers();
      this.updateAppliedOffersCache();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadOffers();
      this.updateAppliedOffersCache();
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

  // Método para limpiar el caché de ofertas aplicadas
  private clearAppliedOffersCache(): void {
    this.appliedOffersCache.clear();
  }

  // Método para actualizar el caché cuando se cargan nuevas aplicaciones
  private updateAppliedOffersCache(): void {
    this.clearAppliedOffersCache();
    // Pre-poblar el caché para todas las ofertas actuales
    if (this.applicationsCacheReady) {
      this.offers.forEach(offer => {
        const isApplied = this.loginService.isAppliedToOffer(offer.id);
        this.appliedOffersCache.set(offer.id, isApplied);
      });
    }
  }

  // Método para obtener el número de tech labels que coinciden con el candidato
  getSharedTechLabelsCount(offer: Offer): number {
    if (!offer.techLabels || !Array.isArray(offer.techLabels) || !this.candidateTechLabelIds.length) {
      return 0;
    }
    
    // Contar cuántas tech labels de la oferta coinciden con las del candidato
    return offer.techLabels.filter(label => 
      this.candidateTechLabelIds.includes(label.id)
    ).length;
  }

  // Método para volver a la vista principal de ofertas
  goBackToOffers(): void {
    this.router.navigate(['/main/ofertas']);
  }
}
