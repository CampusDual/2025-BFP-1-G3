import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { ApplicationSummaryDTO } from 'src/app/model/application-summary';
import { UserData } from 'src/app/model/userData';
import { TechLabel } from 'src/app/model/tech-label';
import { Candidate } from 'src/app/model/candidate';

@Component({
  selector: 'app-candidate-panel',
  templateUrl: './candidate-panel.component.html',
  styleUrls: ['./candidate-panel.component.css']
})
export class CandidatePanelComponent implements OnInit {

  username: string = sessionStorage.getItem('user') ?? '';
  profileForm!: FormGroup;
  professionalForm!: FormGroup;
  signUpError: string = '';
  submitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  userData: UserData | null = null;

  // Nuevas propiedades para las pestañas
  selectedTabIndex: number = 0;
  myApplications: ApplicationSummaryDTO[] = [];
  loadingApplications: boolean = false;
  applicationsError: string = '';

  // Propiedades para el perfil profesional
  professionalError: string = '';
  submittingProfessional: boolean = false;
  
  // Propiedades para tech labels
  availableTechLabels: TechLabel[] = [];
  selectedTechLabels: TechLabel[] = [];
  loadingTechLabels: boolean = false;

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

    this.professionalForm = this.fb.group({
      professionalTitle: [''],
      yearsExperience: [null],
      employmentStatus: [''],
      availability: [''],
      preferredModality: [''],
      presentation: [''],
      githubProfile: ['']
    });
  }

  retrieveCandidateData() {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });
    this.http.post('http://localhost:30030/candidate/get', {}, { headers: headers }).subscribe(
      (response: any) => {
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

          // Cargar datos del perfil profesional
          this.professionalForm.patchValue({
            professionalTitle: response.professionalTitle || '',
            yearsExperience: response.yearsExperience || null,
            employmentStatus: response.employmentStatus || '',
            availability: response.availability || '',
            preferredModality: response.preferredModality || '',
            presentation: response.presentation || '',
            githubProfile: response.githubProfile || ''
          });

          // Cargar tech labels seleccionados
          if (response.techLabelIds && response.techLabelIds.length > 0) {
            // Filtrar las tech labels disponibles para marcar las seleccionadas
            this.selectedTechLabels = this.availableTechLabels.filter(
              label => response.techLabelIds.includes(label.id)
            );
          }

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

  // Nuevo método para cargar aplicaciones
  loadMyApplications(): void {
    this.loadingApplications = true;
    this.applicationsError = '';

    this.loginService.getCandidateApplications().subscribe({
      next: (applications: ApplicationSummaryDTO[]) => {
        console.log('Mis aplicaciones:', applications);
        this.myApplications = applications;
        this.loadingApplications = false;
      },
      error: (error) => {
        console.error('Error cargando aplicaciones:', error);
        this.applicationsError = 'Error al cargar las aplicaciones';
        this.loadingApplications = false;
      }
    });
  }

  // Método para obtener el texto del estado
  getStateText(state: number): string {
    switch (state) {
      case 0: return 'Pendiente';
      case 1: return 'Aceptada';
      case 2: return 'Rechazada';
      default: return 'Desconocido';
    }
  }

  // Método para obtener la clase CSS del estado
  getStateClass(state: number): string {
    switch (state) {
      case 0: return 'state-pending';
      case 1: return 'state-accepted';
      case 2: return 'state-rejected';
      default: return 'state-unknown';
    }
  }

  // Método para manejar el cambio de pestaña
  onTabChanged(event: any): void {
    this.selectedTabIndex = event.index;
    // Cargar aplicaciones cuando se selecciona la pestaña de aplicaciones (ahora es index 2)
    if (event.index === 2 && this.myApplications.length === 0) {
      this.loadMyApplications();
    }
  }

  ngOnInit(): void {
    // Cargar tech labels primero, luego los datos del candidato
    this.loadTechLabels();
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.signUpError = 'Por favor, complete todos los campos requeridos.';
      return;
    }
    const registerData = {
      name: String(this.profileForm.value.name).trim(),
      surname1: String(this.profileForm.value.surname1).trim(),
      surname2: String(this.profileForm.value.surname2).trim(),
      phone: String(this.profileForm.value.phone).trim(),
      email: String(this.profileForm.value.email).trim(),
      linkedin: (String(this.profileForm.value.linkedin).trim() !== '') ?
        String(this.profileForm.value.linkedin).trim() : null
    };

    this.submitting = true;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });

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

      //Recargamos la pagina para reflejar los cambios
      window.location.reload();

      
  }

  // Nuevo método para cargar tech labels
  loadTechLabels(): void {
    this.loadingTechLabels = true;
    this.loginService.getAllTechLabels().subscribe({
      next: (labels: TechLabel[]) => {
        this.availableTechLabels = labels;
        this.loadingTechLabels = false;
        // Cargar datos del candidato después de que las tech labels estén disponibles
        this.retrieveCandidateData();
      },
      error: (error) => {
        console.error('Error cargando tech labels:', error);
        this.loadingTechLabels = false;
        // Aún así cargar los datos del candidato
        this.retrieveCandidateData();
      }
    });
  }

  // Métodos para manejar la selección de tech labels
  isSelected(techLabelId: number): boolean {
    return this.selectedTechLabels.some(label => label.id === techLabelId);
  }

  onTechLabelChange(techLabel: TechLabel): void {
    const isCurrentlySelected = this.isSelected(techLabel.id);
    
    if (isCurrentlySelected) {
      // Deseleccionar
      this.selectedTechLabels = this.selectedTechLabels.filter(label => label.id !== techLabel.id);
    } else {
      // Seleccionar (si no hemos alcanzado el límite)
      if (this.selectedTechLabels.length < 10) {
        this.selectedTechLabels.push(techLabel);
      }
    }
  }

  // Método para enviar el perfil profesional
  onSubmitProfessional(): void {
    if (this.professionalForm.invalid) {
      this.professionalError = 'Por favor, complete los campos correctamente.';
      return;
    }

    const professionalData = {
      ...this.profileForm.value, // Incluir datos básicos
      ...this.professionalForm.value, // Incluir datos profesionales
      techLabelIds: this.selectedTechLabels.map(label => label.id)
    };

    this.submittingProfessional = true;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });

    this.http.put('http://localhost:30030/candidate/profile', professionalData, { headers })
      .subscribe({
        next: (response) => {
          this.snackBar.open('Perfil profesional actualizado con éxito.', 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['snackbar-success'],
          });
          console.log('Perfil profesional actualizado exitosamente');
          this.professionalError = '';
          this.submittingProfessional = false;
        },
        error: (error) => {
          console.error('Error al actualizar perfil profesional:', error);
          this.professionalError = 'Error al actualizar el perfil profesional.';
          this.submittingProfessional = false;
        }
      });
  }
}