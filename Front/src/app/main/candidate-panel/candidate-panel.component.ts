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
  candidateId: number = this.loginService.candidateId;

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
      email: ['', Validators.required]
    });
  }

  retrieveCandidateData() {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });

    this.http.post('http://localhost:30030/candidate/get' , {id: this.candidateId}, {headers: headers}).subscribe(
      (response: any) =>
      {
        console.log(response);
        if (response) {
          this.profileForm.patchValue({
            login: response.login,
            name: response.name,
            surname1: response.surname1,
            surname2: response.surname2,
            phone: response.phone,
            email: response.email
          });
        }
      }
    )
  }

  ngOnInit(): void {
    this.loginService.loadUserProfile().subscribe({
      next: (response) => {
        this.candidateId = response.candidateId;
        this.retrieveCandidateData();
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.signUpError = 'Por favor, complete todos los campos requeridos.';
      return;
    }
    const registerData = {
      id: this.candidateId,
      name: String(this.profileForm.value.name).trim(),
      surname1: String(this.profileForm.value.surname1).trim(),
      surname2: String(this.profileForm.value.surname2).trim(),
      phone: String(this.profileForm.value.phone).trim(),
      email: String(this.profileForm.value.email).trim()
    };

    this.submitting = true;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });

    this.http.put('http://localhost:30030/candidate/update', registerData, { headers })
      .subscribe({
        next: (response) => {
          this.snackBar.open('Perfil actualizado con éxito.', 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['snackbar-success'],
          });
          console.log('Perfil actualizado exitosamente');
          // this.successMessage = 'Perfil actualizado con éxito.';
          this.submitting = false;
        },
        error: (error) => {
          this.signUpError = 'Error al actualizar el perfil.';
          this.submitting = false;
        }
      });
  }

}
