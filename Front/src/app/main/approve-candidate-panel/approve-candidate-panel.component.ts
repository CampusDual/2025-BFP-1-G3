import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserData } from 'src/app/model/userData';
import { LoginService } from 'src/app/services/login.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-approve-candidate-panel',
  templateUrl: './approve-candidate-panel.component.html',
  styleUrls: ['./approve-candidate-panel.component.css']
})
export class ApproveCandidatePanelComponent {

  successMessage: string = '';
  errorMessage: string = '';
  userData: UserData | null = null;
  candidateId!: number;
  applicationState: number = 0; // Estado actual de la aplicación
  applicationId: number = 0; // ID de la aplicación

  constructor(private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private router: Router,
    private loginService: LoginService,
    private route: ActivatedRoute,
    private location: Location
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.candidateId = Number(params['id']);
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state?.['applicationId']) {
        this.applicationId = navigation.extras.state['applicationId'];
        if (navigation.extras.state?.['applicationState'] !== undefined) {
          this.applicationState = navigation.extras.state['applicationState'];
          console.log('Estado de la aplicación recibido en estado de navegación:', this.applicationState);
        }
      }
      this.retrieveCandidateData(this.candidateId); // Guarda el parámetro 'id' en la variable offerId
    });
  }

  retrieveCandidateData(id: number) {
    console.log('ID recibido para recuperar candidato:', id);
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });
    this.http.post('http://localhost:30030/candidate/get', { id: id }, { headers: headers }).subscribe(
      (response: any) => {
        console.log('Datos del candidato obtenidos:', response);
        if (response) {
          this.userData = {
            candidate: {
              id: response.id,
              name: response.name,
              surname1: response.surname1,
              surname2: response.surname2,
              phone: response.phone,
              email: response.email,
              linkedin: response.linkedin

            }
          };
        }
      },
      (error) => {
        console.error('Error obteniendo datos del candidato:', error);
        this.errorMessage = 'Error al cargar los datos del perfil';
      }
    )
  }

  // Método para actualizar el estado de la aplicación
  updateState(newState: number): void {
    if (!this.userData?.candidate) return;

    this.loginService.updateApplicationState(this.applicationId, newState).subscribe({
      next: () => {
        this.applicationState = newState;
        this.snackBar.open('Estado actualizado correctamente', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-success'],
        });
      },
      error: (error) => {
        console.error('Error actualizando estado:', error);
        this.snackBar.open('Error al actualizar el estado', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-info'],
        });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

   getStateClass(state: number): string {
    switch (state) {
      case 0: return 'state-pending';
      case 1: return 'state-accepted';
      case 2: return 'state-rejected';
      default: return 'state-unknown';
    }
  }
}
