import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Offer } from 'src/app/model/offer';
import { Candidate } from 'src/app/model/candidate';
import { Application } from 'src/app/model/application';
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
  
  // Opciones para el tipo de trabajo
  workTypes = [
    { value: 'remote', label: 'Remoto' },
    { value: 'hybrid', label: 'Híbrido' },
    { value: 'onsite', label: 'Presencial' }
  ];

  // Propiedades para la tabla de candidatos
  candidatesDisplayedColumns: string[] = ['name', 'email', 'phone', 'linkedin']; // 'actions' comentado temporalmente
  candidatesDataSource!: MatTableDataSource<Application>;

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

    // Primero, intentar obtener el ID de la URL
    this.route.params.subscribe(params => {
      this.offerId = Number(params['id']);
      console.log('Parámetros de la ruta:', params);
      console.log('OfferId obtenido de la URL:', this.offerId);

      if (this.offerId) {
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

        // Verificar estado de aplicación si es candidato
        if (this.loginService.isLoggedAsCandidate()) {
          this.checkApplicationStatus();
        }
      } else {
        console.error('No se pudo obtener el ID de la oferta de la URL');
        this.error = 'No se pudo cargar la oferta';
        this.loading = false;
      }
    });
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
        
        // Verificar estado de aplicación si es candidato
        if (this.loginService.isLoggedAsCandidate()) {
          this.checkApplicationStatus();
        }
      },
      (error) => {
        console.error('Error al cargar la oferta:', error);
        this.error = 'Error al cargar la oferta. Inténtalo de nuevo más tarde.';
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

  goBack(): void {
    this.location.back();
  }

  viewCandidateProfile(application: Application): void {
    // Implementar navegación al perfil del candidato
    if (application.candidate) {
      this.router.navigate(['/main/candidate-profile', application.candidate.id]);
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


  // == NO USADO ACUTLAMENTE ==

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
      sessionStorage.setItem('redirectAfterLogin', `/main/offer-details/${this.offer.id}`);
    }
    this.router.navigate(['/main/login']);
  }

  // Método para obtener el texto del botón de aplicación
  getApplyButtonText(): string {
    if (this.checkingApplicationStatus) {
      return 'Verificando...';
    }
    if (this.isAlreadyApplied) {
      return 'Ya estás inscrito';
    }
    return 'Inscribirse';
  }

  // Método para verificar si el botón de aplicación debe estar deshabilitado
  isApplyButtonDisabled(): boolean {
    return this.checkingApplicationStatus || this.isAlreadyApplied;
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

    // Verificar si ya está inscrito
    this.loginService.checkApplicationExists(candidateId, this.offer.id!).subscribe({
      next: (response: any) => {
        if (response && response.exists) {
          // Ya está inscrito, mostrar mensaje informativo
          this.snackBar.open('Ya estás inscrito a esta oferta', 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-info']
          });
        } else {
          // No está inscrito, proceder con la inscripción
          this.submitApplication();
        }
      },
      error: () => {
        // Si hay error en la verificación, intentar inscribir de todos modos
        this.submitApplication();
      }
    });
  }

  private submitApplication(): void {
    if (!this.offer?.id) return;

    this.loginService.applyToOfferService(this.offer.id).subscribe({
      next: (response) => {
        this.snackBar.open('Inscripción recibida con éxito', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        // Actualizar el estado para mostrar que ya está aplicado
        this.isAlreadyApplied = true;
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
}
