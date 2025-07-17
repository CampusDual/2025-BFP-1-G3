import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Offer } from 'src/app/model/offer';
import { Candidate } from 'src/app/model/candidate';
import { Application, ApplicationStateHelper } from 'src/app/model/application';
import { ApplicationSummaryDTO } from 'src/app/model/application-summary';
import { TechLabel } from 'src/app/model/tech-label';
import { LoginService } from 'src/app/services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.css']
})
export class OfferDetailsComponent implements OnInit {

  offer: Offer | null = null;
  candidates: Application[] = [];
  loading: boolean = true;
  loadingCandidates: boolean = false;
  error: string = '';
  offerId: number = 0;
  token: string = sessionStorage.getItem('token') ?? '';
  applicationId: number = 0;
  
  // Inicializar headers de forma dinámica
  get headers(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    if (token) {
      return new HttpHeaders({
        'Authorization': 'Bearer ' + token
      });
    }
    return new HttpHeaders();
  }

  // Getter para el texto del toggle según el estado activo de la oferta
  get toggleLabel(): string {
    if (!this.offer) {
      return '';
    }
    return this.offer.active ? 'Desactivar' : 'Activar';
  }

  // Propiedades para edición
  isEditing: boolean = false;
  editedOffer: Offer | null = null;
  isSubmitting: boolean = false;

  // Propiedades para etiquetas
  isEditingLabels: boolean = false;
  originalLabels: TechLabel[] = [];
  
  // Propiedades para el estado de aplicación del candidato
  isAlreadyApplied: boolean = false;
  checkingApplicationStatus: boolean = false;
  candidateApplications: ApplicationSummaryDTO[] = [];
  
  // Opciones para el tipo de trabajo
  workTypes = [
    { value: 'remote', label: 'Remoto' },
    { value: 'hybrid', label: 'Híbrido' },
    { value: 'onsite', label: 'Presencial' }
  ];

  //

  //

  // Propiedades para la tabla de candidatos
  candidatesDisplayedColumns: string[] = ['name', 'email', 'phone', 'linkedin', 'state'];
  candidatesDataSource!: MatTableDataSource<Application>;
  
  // Propiedades para búsqueda de candidatos
  searchTerm = '';
  isSearchActive = false;
  filteredCandidates: Application[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private loginService: LoginService,
    private snackBar: MatSnackBar,
    private location: Location
  ) { }

  ngOnInit(): void {
    console.log('OfferDetailsComponent ngOnInit iniciado');

    // Suscribirse a eventos de navegación para refrescar estado al volver a esta ruta
this.router.events.subscribe(event => {
  if (event.constructor.name === "NavigationEnd") {
    if (this.loginService.isLoggedAsCandidate() && this.offerId) {
      const candidateId = this.loginService.getCandidateIdFromToken();
      if (candidateId !== null && candidateId !== undefined) {
        // Forzar recarga desde backend para asegurar estado actualizado
        this.performApplicationCheck(candidateId);
      } else {
        console.warn('Candidate ID is null or undefined, skipping application check');
      }
    }
  }
});

    // Primero, intentar obtener el ID de la URL
    this.route.params.subscribe(params => {
      this.offerId = Number(params['id']);
      console.log('Parámetros de la ruta:', params);
      console.log('OfferId obtenido de la URL:', this.offerId);

      if (this.offerId) {
        // Establecer loading desde el inicio
        this.loading = true;
        
        // Si es candidato, optimizar carga con Promise.all para paralelismo
        if (this.loginService.isLoggedAsCandidate()) {
          // Verificar si el caché ya está disponible para optimizar
          const cachePromise = this.loginService.applicationsCacheLoaded ? 
            Promise.resolve(this.loginService.candidateApplicationsCache || []) :
            this.loginService.loadApplicationsCacheIfCandidate()?.toPromise() || Promise.resolve([]);
          
          const contentPromise = this.loadOfferContentAsync();
          
Promise.all([cachePromise, contentPromise]).then(
  ([cacheResult, contentResult]) => {
    console.log('✅ Carga paralela completada en detalles');
    // Ahora SÍ terminamos el loading y verificamos el estado
    this.loading = false;
    // Verificar estado de aplicación ahora que el caché está listo
    this.checkApplicationStatusFromCache();
    const candidateId = this.loginService.getCandidateIdFromToken();
    if (candidateId !== null && candidateId !== undefined) {
      // Forzar recarga desde backend para asegurar estado actualizado
      this.performApplicationCheck(candidateId);
    } else {
      console.warn('Candidate ID is null or undefined, skipping application check');
    }
  }
).catch(
  (error) => {
    console.error('❌ Error en carga paralela en detalles:', error);
    // Continuar aún con errores
    this.loading = false;
    this.checkApplicationStatusFromCache();
    const candidateId = this.loginService.getCandidateIdFromToken();
    if (candidateId !== null && candidateId !== undefined) {
      // Forzar recarga desde backend para asegurar estado actualizado
      this.performApplicationCheck(candidateId);
    } else {
      console.warn('Candidate ID is null or undefined, skipping application check');
    }
  }
);
        } else {
          this.loadOfferContent();
        }
      } else {
        console.error('No se pudo obtener el ID de la oferta de la URL');
        this.error = 'No se pudo cargar la oferta';
        this.loading = false;
      }
    });
  }

  // Método asíncrono para cargar contenido de oferta (usado en carga paralela)
  private loadOfferContentAsync(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Intentar obtener la oferta del estado de navegación
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state?.['offer']) {
        console.log('Oferta obtenida del estado de navegación');
        this.offer = navigation.extras.state['offer'];
        // Convertir active de int a boolean
        if (this.offer && typeof this.offer.active === 'number') {
          this.offer.active = this.offer.active === 1;
        }
        // NO establecer loading = false aquí cuando es candidato, esperar al Promise.all
        if (!this.loginService.isLoggedAsCandidate()) {
          this.loading = false;
        }
        
        // Cargar candidatos si puede editar
        if (this.canEdit()) {
          this.loadCandidates();
        }
        
        resolve(this.offer);
      } else {
        console.log('Cargando oferta desde la lista...');
        this.loadOfferFromListAsync().then(resolve).catch(reject);
      }
    });
  }

  // Método asíncrono para cargar oferta desde servidor
  private loadOfferFromListAsync(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loginService.getOfferById(this.offerId).subscribe(
        (offer: Offer) => {
          console.log('Oferta obtenida del servidor:', offer);
          this.offer = offer;
          
          // Convertir active de int a boolean si es necesario
          if (this.offer && typeof this.offer.active === 'number') {
            this.offer.active = this.offer.active === 1;
          }
          
          this.loadOfferLabels(); // Cargar etiquetas de la oferta
          
          // NO establecer loading = false aquí cuando es candidato, esperar al Promise.all
          if (!this.loginService.isLoggedAsCandidate()) {
            this.loading = false;
          }
          
          // Cargar candidatos si puede editar
          if (this.canEdit()) {
            this.loadCandidates();
          }
          
          resolve(offer);
        },
        (error) => {
          console.error('Error obteniendo la oferta:', error);
          this.error = 'Error al cargar la oferta';
          this.loading = false;
          reject(error);
        }
      );
    });
  }

  private loadOfferContent(): void {
    // Intentar obtener la oferta del estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['offer']) {
      console.log('Oferta obtenida del estado de navegación');
      this.offer = navigation.extras.state['offer'];
      // Convertir active de int a boolean
      if (this.offer && typeof this.offer.active === 'number') {
        this.offer.active = this.offer.active === 1;
      }
      this.loading = false;
    } else {
      console.log('Cargando oferta desde la lista...');
      this.loadOfferFromList();
    }

    // Cargar candidatos solo si el usuario puede editar (es una empresa)
    if (this.canEdit()) {
      this.loadCandidates();
    }

    // Verificar estado de aplicación si es candidato (usando caché ya cargado)
    if (this.loginService.isLoggedAsCandidate()) {
      this.checkApplicationStatusFromCache();
    }
  }


  // Método para obtener la oferta desde el servidor
  loadOfferFromList(): void {
    this.loading = true;
    
    // Usar el nuevo endpoint público para obtener la oferta
    this.loginService.getOfferById(this.offerId).subscribe(
      (offer: Offer) => {
        console.log('Oferta obtenida del servidor:', offer);
        this.offer = offer;
        
        // Convertir active de int a boolean si es necesario
        if (this.offer && typeof this.offer.active === 'number') {
          this.offer.active = this.offer.active === 1;
        }
        
        this.loadOfferLabels(); // Cargar etiquetas de la oferta
        this.loading = false;
        
        // Verificar estado de aplicación si es candidato (el caché ya debería estar cargado)
        if (this.loginService.isLoggedAsCandidate()) {
          this.checkApplicationStatusFromCache();
        }
      },
      (error) => {
        console.error('Error obteniendo la oferta:', error);
        this.error = 'Error al cargar la oferta';
        this.loading = false;
      }
    );
  }

  loadCandidates(): void {
    if (!this.offerId) {
      console.error('No hay offerId disponible para cargar candidatos');
      return;
    }

    console.log('Cargando candidatos para la oferta:', this.offerId);
    this.loadingCandidates = true;

    this.loginService.getCandidatesByOfferId(this.offerId).subscribe(
      (candidates: Application[]) => {
        console.log('Candidatos cargados exitosamente:', candidates);
        this.candidates = candidates;
        this.filteredCandidates = [...candidates]; // Inicializar candidatos filtrados

        // Inicializar la tabla de candidatos
        this.candidatesDataSource = new MatTableDataSource(candidates);

        // Custom filter predicate to filter by candidate full name or email
        this.candidatesDataSource.filterPredicate = (data: Application, filter: string) => {
          const filterValue = filter.trim().toLowerCase();

          // Get candidate full name
          const fullName = this.getCandidateFullName(data.candidate).toLowerCase();

          // Get candidate email
          const email = data.candidate?.email?.toLowerCase() || '';

          return fullName.includes(filterValue) || email.includes(filterValue);
        };

        // Configurar sorting y paginación cuando esté disponible
        setTimeout(() => {
          if (this.sort) {
            this.candidatesDataSource.sort = this.sort;
          }
          if (this.paginator) {
            this.candidatesDataSource.paginator = this.paginator;
          }
        });

        this.loadingCandidates = false;
      },
      error => {
        console.error('Error al cargar candidatos:', error);
        this.candidates = [];
        this.candidatesDataSource = new MatTableDataSource<Application>([]);
        this.loadingCandidates = false;
      }
    );
  }
  
  // Método para filtrar candidatos basado en el término de búsqueda
  updateDisplayCandidates(): void {
    if (this.searchTerm) {
      this.isSearchActive = true;
      this.filteredCandidates = this.candidates.filter(application => {
        const fullName = this.getCandidateFullName(application.candidate).toLowerCase();
        const email = application.candidate?.email?.toLowerCase() || '';
        const searchTermLower = this.searchTerm.toLowerCase();
        
        return fullName.includes(searchTermLower) || email.includes(searchTermLower);
      });
      
      // Actualizar el dataSource de la tabla con los resultados filtrados
      this.candidatesDataSource.data = this.filteredCandidates;
    } else {
      this.isSearchActive = false;
      this.filteredCandidates = [...this.candidates];
      // Restaurar todos los candidatos en la tabla
      this.candidatesDataSource.data = this.candidates;
    }
  }
  
  goBack(): void {
    this.location.back();
  }

  // Método para navegar a la página de perfil del candidato
  viewCandidateProfile(application: Application): void {
    if (application.candidate) {
      this.router.navigate(['/main/detallesCandidato', application.candidate.id], { state: { applicationId: application.id, applicationState: application.state } });
    }
  }

  downloadCV(application: Application): void {
    if (application.candidate?.cvUrl) {
      // Implementar descarga de CV
      window.open(application.candidate.cvUrl, '_blank');
    } else {
      this.snackBar.open('CV no disponible', 'Cerrar', { duration: 3000 });
    }
  }

  // Verificar de forma síncrona si puede editar (para uso en template)
  canEdit(): boolean {
    if (!this.offer || !this.loginService.isLoggedAsCompany()) {
      return false;
    }

    // Obtener el ID de la empresa logueada del token
    const currentCompanyId = this.loginService.getCompanyIdFromToken();
    
    console.log('DEBUG canEdit - currentCompanyId:', currentCompanyId);
    console.log('DEBUG canEdit - offer.companyId:', this.offer.companyId);
    
    // Solo permitir edición si la empresa es la propietaria de la oferta
    return currentCompanyId !== null && this.offer.companyId === currentCompanyId;
  }

  // Iniciar edición
  startEditing(): void {
    if (this.offer) {
      this.editedOffer = { ...this.offer }; // Crear copia para editar
      this.isEditing = true;
    }
  }

  // Cancelar edición
  cancelEditing(): void {
    this.isEditing = false;
    this.editedOffer = null;
  }

  // Guardar cambios
  saveChanges(): void {
    if (!this.editedOffer) return;

    // Validar campos requeridos
    if (!this.editedOffer.title || !this.editedOffer.offerDescription || 
        !this.editedOffer.location || !this.editedOffer.requirements) {
      this.snackBar.open('Por favor, completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    // Validar límites de caracteres
    if (this.editedOffer.title.length > 100) {
      this.snackBar.open('El título no puede superar los 100 caracteres', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.editedOffer.offerDescription.length > 2500) {
      this.snackBar.open('La descripción no puede superar los 2500 caracteres', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.editedOffer.location.length > 255) {
      this.snackBar.open('La ubicación no puede superar los 255 caracteres', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.editedOffer.requirements.length > 5000) {
      this.snackBar.open('Los requisitos no pueden superar los 5000 caracteres', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.editedOffer.desirable && this.editedOffer.desirable.length > 5000) {
      this.snackBar.open('Los conocimientos deseables no pueden superar los 5000 caracteres', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.editedOffer.benefits && this.editedOffer.benefits.length > 5000) {
      this.snackBar.open('Los beneficios no pueden superar los 5000 caracteres', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    // Crear copia para enviar al backend con active como número
    const offerToUpdate = { ...this.editedOffer };
    if (typeof offerToUpdate.active === 'boolean') {
      (offerToUpdate.active as any) = offerToUpdate.active ? 1 : 0;
    }

    this.isSubmitting = true;

    this.loginService.updateOffer(offerToUpdate).subscribe({
      next: (response) => {
        this.snackBar.open('Oferta actualizada exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });

        // Actualizar la oferta mostrada
        this.offer = { ...this.editedOffer! };

        // Actualizar también en sessionStorage si existe
        const storedOffers = sessionStorage.getItem('company_offers');
        if (storedOffers) {
          const offers: Offer[] = JSON.parse(storedOffers);
          const index = offers.findIndex(o => o.id === this.offer!.id);
          if (index !== -1) {
            offers[index] = { ...this.offer! };
            sessionStorage.setItem('company_offers', JSON.stringify(offers));
          }
        }

        this.isEditing = false;
        this.editedOffer = null;
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error al actualizar la oferta:', error);
        this.snackBar.open('Error al actualizar la oferta. Inténtalo de nuevo.', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        this.isSubmitting = false;
      }
    });
  }

  // Método para obtener el nombre completo del candidato
  getCandidateFullName(candidate: Candidate | undefined): string {
    if (!candidate) return 'Candidato no disponible';

    let fullName = candidate.name;
    if (candidate.surname1) {
      fullName += ' ' + candidate.surname1;
    }
    if (candidate.surname2) {
      fullName += ' ' + candidate.surname2;
    }
    return fullName;
  }


  // == LÓGICA BÚSQUEDA CANDIDATOS

  // Método: recibe un evento 
  // Filtrar la tabla de candidatos
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    if (this.candidatesDataSource) {
      this.candidatesDataSource.filter = filterValue.trim().toLowerCase();

      if (this.candidatesDataSource.paginator) {
        this.candidatesDataSource.paginator.firstPage();
      }
    }
  }


  // == NO USADO ACUTLMENTE ==

  // Método: Recibe un string email
  // Abrir un email en la aplicación predeterminada
  // openEmailClient(email: string): void {
  //   window.location.href = `mailto:${email}`;
  // }


  // == LÓGICA TOGGLE ==

  toggleActive(newState: boolean): void {
    if (!this.offer) return;

    this.isSubmitting = true;
    this.loginService.toggleOfferActive(this.offer.id).subscribe({
      next: () => {
        // Actualizar el estado activo localmente según newState
        this.offer!.active = newState;

        this.snackBar.open('Estado de la oferta actualizado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error al actualizar estado de la oferta:', error);
        this.snackBar.open('Error al actualizar el estado de la oferta. Inténtalo de nuevo.', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        this.isSubmitting = false;
      }
    });
  }

  // === MÉTODOS PARA MANEJAR ETIQUETAS ===

  loadOfferLabels(): void {
    if (!this.offerId) return;

    this.loginService.getOfferLabels(this.offerId).subscribe({
      next: (labels) => {
        if (this.offer) {
          this.offer.techLabels = labels;
          this.originalLabels = [...labels];
        }
      },
      error: (error) => {
        console.error('Error cargando etiquetas de la oferta:', error);
      }
    });
  }

  onLabelsChanged(labels: TechLabel[]): void {
    if (this.offer) {
      this.offer.techLabels = labels;
    }
  }

  startEditingLabels(): void {
    this.isEditingLabels = true;
    if (this.offer?.techLabels) {
      this.originalLabels = [...this.offer.techLabels];
    }
  }

  cancelEditingLabels(): void {
    this.isEditingLabels = false;
    if (this.offer) {
      this.offer.techLabels = [...this.originalLabels];
    }
  }

  saveLabels(): void {
    if (!this.offer || !this.offerId) return;

    const labelIds = this.offer.techLabels?.map(label => label.id) || [];

    this.loginService.updateOfferLabels(this.offerId, labelIds).subscribe({
      next: () => {
        this.snackBar.open('Etiquetas actualizadas exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.isEditingLabels = false;
        this.originalLabels = [...(this.offer?.techLabels || [])];
      },
      error: (error) => {
        console.error('Error actualizando etiquetas:', error);
        this.snackBar.open('Error al actualizar las etiquetas', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  // Método para verificar si el usuario es candidato
  isCandidate(): boolean {
    return this.loginService.isLoggedAsCandidate();
  }

  // Verificar si el usuario está logueado (cualquier rol)
  isLoggedIn(): boolean {
    return this.loginService.isLoggedIn();
  }

  // Verificar si debe mostrar el botón de inscripción
  shouldShowApplyButton(): boolean {
    // Mostrar si es candidato logueado O si no está logueado (para ir a login)
    // NO mostrar si es empresa
    return !this.loginService.isLoggedAsCompany();
  }

  // Método para verificar si el candidato ya está aplicado a esta oferta
  checkApplicationStatus(): void {
    if (!this.offer?.id || !this.loginService.isLoggedAsCandidate()) {
      return;
    }

    // Verificación instantánea usando el caché de aplicaciones
    this.checkApplicationStatusLocally();
  }

  // Verificación instantánea usando el caché del servicio
  checkApplicationStatusFromCache(): void {
    if (!this.offer?.id || !this.loginService.isLoggedAsCandidate()) {
      return;
    }

    // Usar el caché del servicio para verificación instantánea
    this.isAlreadyApplied = this.loginService.isAppliedToOffer(this.offer.id);
  }

  // Método para cargar las aplicaciones del candidato una sola vez
  loadCandidateApplications(): void {
    if (!this.loginService.isLoggedAsCandidate()) {
      return;
    }

    this.loginService.getCandidateApplications().subscribe({
      next: (applications: ApplicationSummaryDTO[]) => {
        this.candidateApplications = applications;
        // Una vez cargadas las aplicaciones, verificar el estado localmente
        this.checkApplicationStatusLocally();
      },
      error: (error) => {
        console.error('Error cargando aplicaciones del candidato:', error);
        this.candidateApplications = [];
        // Si falla la carga, usar el método anterior como fallback
        this.checkApplicationStatusFallback();
      }
    });
  }

  // Verificación instantánea usando aplicaciones cacheadas
  private checkApplicationStatusLocally(): void {
    if (!this.offer?.id) {
      return;
    }

    // Buscar si ya existe una aplicación para esta oferta
    this.isAlreadyApplied = this.candidateApplications.some(
      application => application.offer.id === this.offer!.id
    );
  }

  // Método de fallback usando la verificación HTTP original
  private checkApplicationStatusFallback(): void {
    if (!this.offer?.id || !this.loginService.isLoggedAsCandidate()) {
      return;
    }

    const candidateId = this.loginService.getCandidateIdFromToken();
    if (!candidateId) {
      // Si no se puede obtener el candidateId, intentar cargar el perfil
      this.loginService.loadUserProfile().subscribe({
        next: () => {
          const updatedCandidateId = this.loginService.getCandidateIdFromToken();
          if (updatedCandidateId) {
            this.performApplicationCheck(updatedCandidateId);
          }
        },
        error: () => {
          console.log('No se pudo cargar el perfil del usuario para verificar aplicación');
        }
      });
      return;
    }

    this.performApplicationCheck(candidateId);
  }

  private performApplicationCheck(candidateId: number): void {
    if (!this.offer?.id) return;

    this.checkingApplicationStatus = true;
    this.loginService.checkApplicationExists(candidateId, this.offer.id).subscribe({
      next: (response: any) => {
        this.isAlreadyApplied = response && response.exists;
        this.checkingApplicationStatus = false;
      },
      error: () => {
        this.isAlreadyApplied = false;
        this.checkingApplicationStatus = false;
      }
    });
  }

  // Método para redirigir a login cuando no está logueado
  redirectToLogin(): void {
    // Guardar el ID de la oferta para redirigir después del login
    if (this.offer?.id) {
      this.loginService.clickedApplyOffer = true;
      this.loginService.idOffer = this.offer.id;
      sessionStorage.setItem('redirectAfterLogin', `/main/offer-details/${this.offer.id}`);
    }
    this.router.navigate(['/main/login']);
  }

  // Método para obtener el texto del botón de aplicación
  getApplyButtonText(): string {
    if (this.isAlreadyApplied) {
      return 'Ya estás inscrito';
    }
    return 'Inscribirse';
  }

  // Método para verificar si el botón de aplicación debe estar deshabilitado
  isApplyButtonDisabled(): boolean {
    return this.isAlreadyApplied;
  }

  // Método para que un candidato se inscriba a la oferta
  applyToOffer(): void {
    // Si ya está aplicado, no hacer nada
    if (this.isAlreadyApplied) {
      return;
    }

    if (!this.offer || !this.isCandidate()) {
      this.snackBar.open('No tienes permisos para inscribirte a esta oferta', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (!this.offer.active) {
      this.snackBar.open('Esta oferta no está activa', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
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
            this.proceedWithApplication(updatedCandidateId);
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

    this.proceedWithApplication(candidateId);
  }

  private proceedWithApplication(candidateId: number): void {
    if (!this.offer?.id) return;

    // Verificar localmente usando el caché del servicio
    const isAlreadyApplied = this.loginService.isAppliedToOffer(this.offer.id);

    if (isAlreadyApplied) {
      // Ya está inscrito, mostrar mensaje informativo
      this.snackBar.open('Ya estás inscrito a esta oferta', 'Cerrar', {
        duration: 5000,
        panelClass: ['snackbar-info']
      });
      this.isAlreadyApplied = true;
    } else {
      // No está inscrito, proceder con la inscripción
      this.submitApplication();
    }
  }

  private submitApplication(): void {
    if (!this.offer?.id) return;

    this.loginService.applyToOfferService(this.offer.id).subscribe({
      next: (response) => {
        this.snackBar.open('Inscripción recibida con éxito', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        
        // Actualizar el estado local inmediatamente
        this.isAlreadyApplied = true;
        
        // Actualizar el caché del servicio
        if (this.offer) {
          const newApplication: ApplicationSummaryDTO = {
            id: response.id || Date.now(), // Usar el ID de la respuesta o un temporal
            state: 1, // Estado activo
            offer: this.offer
          };
          this.loginService.addApplicationToCache(newApplication);
        }
      },
      error: (error) => {
        console.error('Error en la inscripción:', error);
        let errorMessage = 'Error al procesar la inscripción';
        
        if (error.status === 400) {
          errorMessage = 'Ya estás inscrito a esta oferta';
          // Si el error es porque ya está inscrito, actualizar el estado
          this.isAlreadyApplied = true;
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

  // Método para cargar el estado en el que se encuentra la inscripción del candidato 
  getState(state: number): string {
    return ApplicationStateHelper.getStateDescription(state);
  }

  getStateClass(state: number): string {
    switch (state) {
      case 0: return 'state-pending';
      case 1: return 'state-accepted';
      case 2: return 'state-rejected';
      default: return 'state-unknown';
    }
  }

  // Método para actualizar estado
  updateState(application: Application, newState: number): void {
    this.loginService.updateApplicationState(application.id, newState).subscribe({
      next: (response) => {
        application.state = newState; // Actualizar estado localmente para reflejar el cambio en la UI
        this.getState(newState);
        if (this.candidatesDataSource) {
          this.candidatesDataSource._updateChangeSubscription(); // Forzar actualización de la tabla
        }
      },
      error: (error) => {
        console.error('Error actualizando estados:', error);
        this.snackBar.open('Error al actualizar los estados', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }
}

