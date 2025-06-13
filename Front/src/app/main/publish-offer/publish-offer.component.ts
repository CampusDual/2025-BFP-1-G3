import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(private fb: FormBuilder, 
    private http: HttpClient, private loginService: LoginService, 
    private router: Router,
    private snackBar: MatSnackBar) {
    this.offerForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required]
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
        next: (response) => {
          this.snackBar.open('Oferta publicada con éxito.', 'Cerrar', {
            duration: 10000, 
            horizontalPosition: 'center',
            verticalPosition: 'bottom', 
            panelClass: ['snackbar-success'],
          });
          this.successMessage = 'Oferta publicada con éxito.';
          this.offerForm.reset();
          this.submitting = false;
          // setTimeout(() => {
          //   this.successMessage = '';
          // }, 2000);
          this.router.navigate(['/main/ofertas']);
        },
        error: (error) => {
          this.errorMessage = 'Error al publicar la oferta.';
          this.submitting = false;
        }
      });
  }
}


