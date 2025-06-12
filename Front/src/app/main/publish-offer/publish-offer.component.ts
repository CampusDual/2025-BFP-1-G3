import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-publish-offer',
  templateUrl: './publish-offer.component.html',
  styleUrls: ['./publish-offer.component.css']
})
export class PublishOfferComponent implements OnInit {
  offerForm: FormGroup;
  submitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  companyId: number | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.offerForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const token = sessionStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No se encontró token de autenticación.';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
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
      this.errorMessage = 'No se pudo obtener el ID de la empresa.';
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No se encontró token de autenticación.';
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
      'Authorization': 'Bearer ' + token
    });
    this.http.post('http://localhost:30030/offers/add', offerData, { headers })
      .subscribe({
        next: (response) => {
          this.successMessage = 'Oferta publicada con éxito.';
          this.offerForm.reset();
          this.submitting = false;
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error al publicar la oferta.';
          this.submitting = false;
        }
      });
  }
}
