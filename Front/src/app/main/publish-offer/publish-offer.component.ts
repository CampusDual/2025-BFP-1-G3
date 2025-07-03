import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TechLabel } from 'src/app/model/tech-label';

@Component({
  selector: 'app-publish-offer',
  templateUrl: './publish-offer.component.html',
  styleUrls: ['./publish-offer.component.css']
})
export class PublishOfferComponent implements OnInit {
  offerForm: FormGroup;
  submitting = false;
  errorMessage = '';
  successMessage = '';
  companyId: number | null = null;
  selectedTechLabels: TechLabel[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private loginService: LoginService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.offerForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(70)]],
      descripcion: ['', [Validators.required, Validators.maxLength(1500)]]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    // const token = sessionStorage.getItem('token');
    if (!this.loginService.isAuthenticated()) {
      this.errorMessage = 'No está logueado.';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });

    this.http.get<{ companyId: number }>('http://localhost:30030/auth/profile', { headers })
      .subscribe({
        next: (response) => {
          this.companyId = response.companyId;
        },
        error: (error) => {
          this.errorMessage = 'Error al obtener el perfil del usuario.';
        }
      });
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    if (this.offerForm.invalid) {
      this.errorMessage = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    if (this.companyId === null) {
      // this.errorMessage = 'No se pudo obtener el ID de la empresa.';
      return;
    }

    if (!this.loginService.isAuthenticated()) {
      this.errorMessage = 'No está logueado.';
      return;
    }

    const offerData = {
      title: String(this.offerForm.value.titulo).trim(),
      offerDescription: String(this.offerForm.value.descripcion).trim(),
      companyId: this.companyId
    };

    this.submitting = true;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });
    this.http.post('http://localhost:30030/offers/add', offerData, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta del servidor:', response);
          
          // Si tenemos un ID de oferta y etiquetas seleccionadas, guardarlas
          if (response && typeof response === 'number' && this.selectedTechLabels.length > 0) {
            const labelIds = this.selectedTechLabels.map(label => label.id);
            this.loginService.updateOfferLabels(response, labelIds).subscribe({
              next: () => {
                this.showSuccessAndRedirect();
              },
              error: (error) => {
                console.error('Error guardando etiquetas:', error);
                // Mostrar éxito de la oferta pero advertir sobre etiquetas
                this.snackBar.open('Oferta creada, pero hubo un error al guardar las etiquetas', 'Cerrar', {
                  duration: 5000,
                  panelClass: ['snackbar-warning']
                });
                this.router.navigate(['/main/empresa']);
                this.submitting = false;
              }
            });
          } else {
            this.showSuccessAndRedirect();
          }
        },
        error: (error) => {
          console.error('Error completo:', error);
          this.submitting = false;
          
          if (error.status === 403) {
            this.snackBar.open('No tienes permisos para publicar ofertas', 'Cerrar', {
              duration: 5000,
              panelClass: ['snackbar-failed']
            });
          } else {
            this.snackBar.open('Error al publicar la oferta. Inténtalo de nuevo.', 'Cerrar', {
              duration: 5000,
              panelClass: ['snackbar-failed']
            });
          }
        }
      });
  }

  onLabelsChanged(labels: TechLabel[]): void {
    this.selectedTechLabels = labels;
  }

  private showSuccessAndRedirect(): void {
    this.snackBar.open('¡Oferta publicada exitosamente!', 'Cerrar', {
      duration: 5000,
      panelClass: ['snackbar-success']
    });
    this.router.navigate(['/main/empresa']);
    this.submitting = false;
  }
}


