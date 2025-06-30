import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Offer } from 'src/app/model/offer';
import { LoginService } from 'src/app/services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.css']
})
export class OfferDetailsComponent implements OnInit {

  offer: Offer | null = null;
  candidates: any[] = [];
  loading: boolean = true;
  error: string = '';
  offerId: number = 0;
  token: string = sessionStorage.getItem('token') ?? '';
  headers: HttpHeaders = new HttpHeaders({
    'Authorization': 'Bearer ' + this.token
  });

  // Propiedades para edición
  isEditing: boolean = false;
  editedOffer: Offer | null = null;
  isSubmitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private loginService: LoginService,
    private snackBar: MatSnackBar,
    private location: Location
  ) { }

  ngOnInit(): void {
    // Intentar obtener la oferta del estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['offer']) {
      this.offer = navigation.extras.state['offer'];
      this.loading = false;
      this.loadCandidates();
      return;
    }

    // Si no hay oferta en el estado, intentar obtenerla de la URL
    this.route.params.subscribe(params => {
      this.offerId = Number(params['id']);
      if (this.offerId) {
        this.loadOfferFromList();
        this.loadCandidates();
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
        this.loading = false;
        return;
      }
    }
    
    // Si no se encuentra en el storage, mostrar error
    this.error = 'Oferta no encontrada';
    this.loading = false;
  }

  loadCandidates(): void {
    // Por ahora, simular que no hay candidatos ya que el endpoint no está implementado
    // En el futuro, cuando tengas el endpoint de candidatos, puedes usar:
    // this.http.get<any[]>(`http://localhost:30030/api/offers/${this.offerId}/candidates`, { headers: this.headers })
    console.log('Cargando candidatos para la oferta:', this.offerId);
    this.candidates = []; // Simular lista vacía por ahora
    
    // Comentado hasta que el endpoint esté disponible:
    /*
    this.http.get<any[]>(`http://localhost:30030/api/offers/${this.offerId}/candidates`, { headers: this.headers })
      .subscribe(
        candidates => {
          this.candidates = candidates;
        },
        error => {
          console.error('Error al cargar candidatos:', error);
          this.candidates = [];
        }
      );
    */
  }

  goBack(): void {
    this.location.back();
  }

  viewCandidateProfile(candidate: any): void {
    // Implementar navegación al perfil del candidato
    this.router.navigate(['/main/candidate-profile', candidate.id]);
  }

  downloadCV(candidate: any): void {
    if (candidate.cvUrl) {
      // Implementar descarga de CV
      window.open(candidate.cvUrl, '_blank');
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

    this.isSubmitting = true;

    this.loginService.updateOffer(this.editedOffer).subscribe({
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
}
