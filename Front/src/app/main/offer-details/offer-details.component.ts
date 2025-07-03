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
  headers: HttpHeaders = new HttpHeaders({
    'Authorization': 'Bearer ' + sessionStorage.getItem('token')
  });


  // Propiedades para edición
  isEditing: boolean = false;
  editedOffer: Offer | null = null;
  isSubmitting: boolean = false;

  // Propiedades para etiquetas
  isEditingLabels: boolean = false;
  originalLabels: TechLabel[] = [];

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

        // Cargar candidatos después de tener el offerId
        this.loadCandidates();
      } else {
        console.error('No se pudo obtener el ID de la oferta de la URL');
        this.error = 'No se pudo cargar la oferta';
        this.loading = false;
      }
    });
  }


  // Método alternativo para obtener la oferta desde las ofertas cargadas
  loadOfferFromList(): void {
    this.loading = true;
    // Intentar obtener las ofertas del sessionStorage o del servicio
    const storedOffers = sessionStorage.getItem('company_offers');
    if (storedOffers) {
      const offers: Offer[] = JSON.parse(storedOffers);
      const foundOffer = offers.find(offer => offer.id === this.offerId);
      if (foundOffer) {
        this.offer = foundOffer;
        this.loadOfferLabels(); // Cargar etiquetas de la oferta
        this.loading = false;
        return;
      }
    }

    // Si no se encuentra en el storage, mostrar error
    this.error = 'Oferta no encontrada';
    this.loading = false;
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

    // Solo permitir edición si hay una oferta y el usuario es una empresa
    // En una implementación más robusta, también se verificaría que la empresa
    // sea la propietaria de la oferta comparando IDs
    return true;
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
    if (!this.editedOffer.title || !this.editedOffer.offerDescription) {
      this.snackBar.open('Por favor, completa todos los campos requeridos', 'Cerrar', {
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

}
