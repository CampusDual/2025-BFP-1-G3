import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-candidate-panel',
  templateUrl: './candidate-panel.component.html',
  styleUrls: ['./candidate-panel.component.css']
})
export class CandidatePanelComponent implements OnInit {

  username: string = sessionStorage.getItem('user') ?? '';
  profileForm!: FormGroup;
  signUpError: string = '';
  submitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  // candidateId ya no es necesario - se obtiene del token en el backend

  constructor(private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private router: Router,
    private loginService: LoginService) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      surname1: ['', Validators.required],
      surname2: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      linkedin: null
    });
  }

  retrieveCandidateData() {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });

    // El endpoint /candidate/get ahora es seguro y obtiene el candidateId del token
    // No necesitamos enviar el ID en el cuerpo
    this.http.post('http://localhost:30030/candidate/get', {}, {headers: headers}).subscribe(
      (response: any) =>
      {
        console.log('Datos del candidato obtenidos:', response);
        if (response) {
          this.profileForm.patchValue({
            name: response.name,
            surname1: response.surname1,
            surname2: response.surname2,
            phone: response.phone,
            email: response.email,
            linkedin: response.linkedin
          });
        }
      },
      (error) => {
        console.error('Error obteniendo datos del candidato:', error);
        this.errorMessage = 'Error al cargar los datos del perfil';
      }
    )
  }

  ngOnInit(): void {
    // Directamente cargar los datos del candidato autenticado
    // El endpoint /candidate/get es ahora seguro y obtiene los datos del token
    this.retrieveCandidateData();
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.signUpError = 'Por favor, complete todos los campos requeridos.';
      return;
    }
    const registerData = {
      // No enviamos ID - el backend lo obtiene del token de forma segura
      name: String(this.profileForm.value.name).trim(),
      surname1: String(this.profileForm.value.surname1).trim(),
      surname2: String(this.profileForm.value.surname2).trim(),
      phone: String(this.profileForm.value.phone).trim(),
      email: String(this.profileForm.value.email).trim(),
      linkedin: (String(this.profileForm.value.linkedin).trim() !== '') ? 
      String(this.profileForm.value.linkedin).trim():null
    };

    this.submitting = true;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });

    // Usar el endpoint seguro /candidate/profile para PUT
    this.http.put('http://localhost:30030/candidate/profile', registerData, { headers })
      .subscribe({
        next: (response) => {
          this.snackBar.open('Perfil actualizado con éxito.', 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['snackbar-success'],
          });
          console.log('Perfil actualizado exitosamente');
          this.signUpError = '';
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error al actualizar perfil:', error);
          this.signUpError = 'Error al actualizar el perfil.';
          this.submitting = false;
        }
      });
  }

}
