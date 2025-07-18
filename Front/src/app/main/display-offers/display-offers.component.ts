// @ts-nocheck
/* eslint-disable */
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
export class DisplayOffersComponent implements OnInit, OnDestroy {
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  loading = false;
  isLoading = false; // alias for template compatibility
  error = false;
  searchTerm = '';
  companyName = ''; // for template compatibility
  isSearchActive = false;
  applicationsCacheReady = false; // Indica si el caché de aplicaciones está listo
  
  // Cache para evitar llamadas repetitivas en el template
  private appliedOffersCache = new Map<number, boolean>();
  
  // Tech labels del candidato para calcular coincidencias
  candidateTechLabelIds: number[] = [];
  
  // Recommended offers properties
  recommendedOffers: Offer[] = [];
  showRecommendedSection = false;
  isRecommendedSectionCollapsed = false;
  loadingRecommended = false;
  recommendedScrollPosition = 0;
  canScrollLeft = false;
  canScrollRight = false;
  
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
    // Establecer estado de carga desde el inicio
    this.loading = true;
    this.isLoading = true;
    
    // Si es candidato, cargar caché y ofertas en paralelo para mayor velocidad
    if (this.loginService.isLoggedAsCandidate()) {
      // Verificar si el caché ya está disponible para optimizar
      const cachePromise = this.loginService.applicationsCacheLoaded ? 
        Promise.resolve(this.loginService.candidateApplicationsCache || []) :
        this.loginService.loadApplicationsCacheIfCandidate()?.toPromise() || Promise.resolve([]);
      
      const offersPromise = this.loadOffersAsync();
      
      Promise.all([cachePromise, offersPromise]).then(
        ([cacheResult, offersResult]) => {
          console.log('✅ Carga paralela completada - Caché y ofertas listos');
          this.applicationsCacheReady = true;
          // Actualizar el caché de ofertas aplicadas para evitar verificaciones repetitivas
          this.updateAppliedOffersCache();
          
          // Si es candidato, cargar tech labels primero y luego ofertas recomendadas
          if (this.loginService.isLoggedAsCandidate()) {
            this.loginService.getCandidateData().subscribe({
              next: (candidateData) => {
                this.candidateTechLabelIds = candidateData.techLabelIds || [];
                this.loadRecommendedOffers();
              },
              error: (error) => {
                console.error('Error cargando datos del candidato:', error);
                // Intentar cargar ofertas recomendadas de todos modos
                this.loadRecommendedOffers();
              }
            });
          }
          
          // Ahora SÍ terminamos el loading para mostrar las ofertas con el estado correcto
          this.loading = false;
          this.isLoading = false;
        }
      ).catch(
        (error) => {
          console.error('❌ Error en carga paralela:', error);
          this.applicationsCacheReady = true;
          // Asegurar que el loading se detenga incluso si hay errores
          this.loading = false;
          this.isLoading = false;
        }
      );
    } else {
      // Si no es candidato, cargar ofertas directamente
      this.applicationsCacheReady = true;
      this.loadOffers();
    }
  }

  // Método asíncrono para cargar ofertas (usado en carga paralela)
  private loadOffersAsync(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loginService.getOffersPaginated(this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.offers = response.offers || [];
          this.filteredOffers = [...this.offers];
          this.totalOffers = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
          this.hasNextPage = this.currentPage < (this.totalPages - 1);
          this.hasPreviousPage = this.currentPage > 0;
          // NO establecer loading = false aquí cuando es candidato, esperar al Promise.all
          if (!this.loginService.isLoggedAsCandidate()) {
            this.loading = false;
            this.isLoading = false;
          }
          this.updateDisplayOffers();
          resolve(response);
        },
        error: (error) => {
          console.error('Error loading offers:', error);
          this.error = true;
          this.loading = false;
          this.isLoading = false;
          reject(error);
        }
      });
    });
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
    this.router.navigate(['/main/detalles-de-la-oferta', offerId]);
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
        sessionStorage.setItem('redirectAfterLogin', `/main/detalles-de-la-oferta/${offerId}`);
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
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }

  // Método para verificar si el candidato está inscrito en una oferta
  isAppliedToOffer(offerId: number): boolean {
    // Si no hay caché o no es candidato, devolver false
    if (!this.loginService.isLoggedAsCandidate() || !this.applicationsCacheReady) {
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
    // Optimización: usar también el estado del caché del servicio como fallback
    const isCacheReady = this.applicationsCacheReady || this.loginService.applicationsCacheLoaded;
    return this.loginService.isLoggedAsCandidate() && isCacheReady;
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      // Al cambiar de página, no necesitamos recargar el caché (ya está en memoria)
      this.loadOffers();
      this.updateAppliedOffersCache();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage--;
      // Al cambiar de página, no necesitamos recargar el caché (ya está en memoria)
      this.loadOffers();
      this.updateAppliedOffersCache();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      // Al cambiar de página, no necesitamos recargar el caché (ya está en memoria)
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
    if (this.loginService.isLoggedAsCandidate() && this.applicationsCacheReady) {
      this.offers.forEach(offer => {
        const isApplied = this.loginService.isAppliedToOffer(offer.id);
        this.appliedOffersCache.set(offer.id, isApplied);
      });
    }
  }

  // === MÉTODOS PARA OFERTAS RECOMENDADAS ===

  /**
   * Carga las 5 ofertas más recomendadas para el candidato
   */
  private loadRecommendedOffers(): void {
    if (!this.loginService.isLoggedAsCandidate()) {
      return;
    }

    this.loadingRecommended = true;
    
    const token = sessionStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Solicitar solo las 5 mejores ofertas (página 0, tamaño 4)
    const url = `http://localhost:30030/offers/recommended?page=0&size=4`;

    fetch(url, { headers })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('🎯 Top 5 ofertas recomendadas recibidas:', data);
        
        this.recommendedOffers = data.offers || [];
        
        // Filtrar ofertas que realmente tengan coincidencias con el candidato
        // Solo mostrar la sección si hay ofertas con al menos 1 coincidencia
        const offersWithMatches = this.recommendedOffers.filter(offer => 
          this.getSharedTechLabelsCount(offer) > 0
        );
        
        // Si el candidato no tiene tech labels, no mostrar recomendaciones
        if (this.candidateTechLabelIds.length === 0) {
          console.log('ℹ️ Candidato sin tech labels - no se muestran recomendaciones');
          this.showRecommendedSection = false;
        } else if (offersWithMatches.length > 0) {
          this.showRecommendedSection = true;
          console.log(`✅ ${offersWithMatches.length} ofertas con coincidencias encontradas`);
        } else {
          this.showRecommendedSection = false;
          console.log('ℹ️ No hay ofertas con coincidencias de tech labels');
        }
        
        this.loadingRecommended = false;
        
        // Inicializar estado del scroll después de que el DOM se actualice
        setTimeout(() => {
          this.updateScrollButtons();
        }, 100);
        
        if (this.recommendedOffers.length === 0) {
          console.log('ℹ️ No hay ofertas recomendadas para este candidato');
        }
      })
      .catch(error => {
        console.error('❌ Error cargando ofertas recomendadas:', error);
        this.loadingRecommended = false;
        this.showRecommendedSection = false;
      });
  }

  /**
   * Navegar hacia la izquierda en el carrusel de ofertas recomendadas
   */
  scrollRecommendedLeft(): void {
    const container = document.querySelector('.recommended-carousel-container') as HTMLElement;
    if (container) {
      const cardWidth = 310; // Ancho de cada card (280px) + gap (1.5rem = 24px) + padding
      container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  /**
   * Navegar hacia la derecha en el carrusel de ofertas recomendadas
   */
  scrollRecommendedRight(): void {
    const container = document.querySelector('.recommended-carousel-container') as HTMLElement;
    if (container) {
      const cardWidth = 310; // Ancho de cada card (280px) + gap (1.5rem = 24px) + padding
      container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  /**
   * Actualizar el estado de los botones de navegación del carrusel
   */
  private updateScrollButtons(): void {
    setTimeout(() => {
      const container = document.querySelector('.recommended-carousel-container') as HTMLElement;
      if (container) {
        // Verificar si hay contenido que requiera scroll
        const hasOverflow = container.scrollWidth > container.clientWidth;
        
        // Actualizar atributo data para CSS condicional
        container.setAttribute('data-has-overflow', hasOverflow.toString());
        
        if (!hasOverflow) {
          // Si no hay overflow, ocultar ambos botones
          this.canScrollLeft = false;
          this.canScrollRight = false;
        } else {
          // Si hay overflow, evaluar posición actual
          this.canScrollLeft = container.scrollLeft > 5; // Pequeño margen para evitar flickering
          this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 5);
        }
      } else {
        // Si no se encuentra el contenedor, ocultar botones
        this.canScrollLeft = false;
        this.canScrollRight = false;
      }
    }, 100);
  }

  /**
   * Obtener el número de tech labels compartidas entre candidato y oferta
   */
  getSharedTechLabelsCount(offer: Offer): number {
    if (!offer.techLabels || !Array.isArray(offer.techLabels) || !this.candidateTechLabelIds.length) {
      return 0;
    }
    
    // Contar cuántas tech labels de la oferta coinciden con las del candidato
    return offer.techLabels.filter(label => 
      this.candidateTechLabelIds.includes(label.id)
    ).length;
  }

  /**
   * Manejar scroll del carrusel para actualizar botones
   */
  onRecommendedScroll(): void {
    this.updateScrollButtons();
  }

  /**
   * Navegar a la vista completa de ofertas recomendadas
   */
  viewAllRecommendedOffers(): void {
    this.router.navigate(['/main/ofertas-recomendadas']);
  }

  /**
   * Alternar la visibilidad de la sección de ofertas recomendadas
   */
  toggleRecommendedSection(): void {
    this.isRecommendedSectionCollapsed = !this.isRecommendedSectionCollapsed;
    
    // Actualizar botones después de la animación
    setTimeout(() => {
      this.updateScrollButtons();
    }, 800); // Tiempo de la animación CSS
  }

  /**
   * Listener para redimensionar ventana y actualizar botones
   */
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.updateScrollButtons();
  }

  /**
   * Verificar si el usuario logueado es candidato (método público para el template)
   */
  isLoggedAsCandidate(): boolean {
    return this.loginService.isLoggedAsCandidate();
  }

  ngOnDestroy(): void {
    // Limpiar cualquier suscripción o recurso si es necesario
  }
}
