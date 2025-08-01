import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { LoginService } from 'src/app/services/login.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
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

  // Datos completos del candidato para el avatar editable
  candidateData: Candidate | null = null;

  // Propiedades para el modo de edición
  isEditing: boolean = false;
  isSubmitting: boolean = false;
  originalFormData: any = null;

  constructor(private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private fileUploadService: FileUploadService,
    private location: Location) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      surname1: ['', Validators.required],
      surname2: [''],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      linkedin: ['', this.linkedinValidator]
    });

    this.professionalForm = this.fb.group({
      professionalTitle: [''],
      yearsExperience: [null],
      employmentStatus: [''],
      availability: [''],
      preferredModality: [''],
      presentation: [''],
      githubProfile: ['', this.githubValidator]
    });
  }

  linkedinValidator(control: AbstractControl): ValidationErrors | String {
    if (!control.value) {
      return ''; // No es obligatorio
    }
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.*$/i;
    return linkedinRegex.test(control.value) ? '' : { invalidLinkedin: true };
  }

  githubValidator(control: AbstractControl): ValidationErrors | '' {
    if (!control.value) {
      return ''; // No es obligatorio
    }
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/.*$/i;
    return githubRegex.test(control.value) ? '' : { invalidGithub: true };
  }

  retrieveCandidateData() {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });
    this.http.post('http://localhost:30030/candidate/get', {}, { headers: headers }).subscribe(
      (response: any) => {
        console.log('Datos del candidato obtenidos:', response);
        if (response) {
          this.candidateData = response; // Guardar datos completos del candidato

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

          // Cargar datos completos del candidato para el avatar editable
          this.candidateData = {
            id: response.id,
            name: response.name,
            surname1: response.surname1,
            surname2: response.surname2,
            phone: response.phone,
            email: response.email,
            linkedin: response.linkedin,
            professionalTitle: response.professionalTitle,
            yearsExperience: response.yearsExperience,
            employmentStatus: response.employmentStatus,
            availability: response.availability,
            preferredModality: response.preferredModality,
            presentation: response.presentation,
            githubProfile: response.githubProfile,
            profilePhotoUrl: response.profilePhotoUrl,
            profilePhotoFilename: response.profilePhotoFilename,
            profilePhotoContentType: response.profilePhotoContentType
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
    // Verificar si hay un parámetro de query para la pestaña
    const tabParam = this.route.snapshot.queryParams['tab'];
    if (tabParam) {
      this.selectedTabIndex = parseInt(tabParam, 10) || 0;
    }
    
    // Cargar tech labels primero, luego los datos del candidato
    this.loadTechLabels();
    this.loadMyApplications();
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.signUpError = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    // Recoger datos personales
    const personalData = {
      name: String(this.profileForm.value.name).trim(),
      surname1: String(this.profileForm.value.surname1).trim(),
      surname2: String(this.profileForm.value.surname2).trim(),
      phone: String(this.profileForm.value.phone).trim(),
      email: String(this.profileForm.value.email).trim(),
      linkedin: (String(this.profileForm.value.linkedin).trim() !== '') ?
        String(this.profileForm.value.linkedin).trim() : null
    };

    // Recoger datos profesionales (aunque estén vacíos o null)
    const professionalData = {
      professionalTitle: this.professionalForm?.value?.professionalTitle || '',
      yearsExperience: this.professionalForm?.value?.yearsExperience ?? null,
      employmentStatus: this.professionalForm?.value?.employmentStatus || '',
      availability: this.professionalForm?.value?.availability || '',
      preferredModality: this.professionalForm?.value?.preferredModality || '',
      presentation: this.professionalForm?.value?.presentation || '',
      githubProfile: this.professionalForm?.value?.githubProfile || null
    };

    // Combinar ambos objetos
    const registerData = { ...personalData, ...professionalData };

    this.submitting = true;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });

    this.http.put('http://localhost:30030/candidate/profile', registerData, { headers })
      .subscribe({
        next: (response) => {
          this.snackBar.open('Perfil actualizado con éxito.', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
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

  goToOfferDetails(offerId: number): void {
    this.router.navigate(['/main/detalles-de-la-oferta', offerId], {
      queryParams: { from: 'candidate-panel' }
    });
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

  onTechLabelChange(event: any, techLabel: TechLabel): void {
    const isChecked = event.checked;

    if (isChecked) {
      // Add the tech label if not already selected and under the limit
      if (!this.selectedTechLabels.some(label => label.id === techLabel.id) && this.selectedTechLabels.length < 10) {
        this.selectedTechLabels.push(techLabel);
      }
    } else {
      // Remove the tech label
      this.selectedTechLabels = this.selectedTechLabels.filter(label => label.id !== techLabel.id);
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
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
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

  // Métodos para el modo de edición del perfil
  startEditing(): void {
    this.isEditing = true;
    // Guardar los datos originales del formulario para poder cancelar
    this.originalFormData = {
      profile: { ...this.profileForm.value },
      professional: { ...this.professionalForm.value },
      techLabels: [...this.selectedTechLabels]
    };
  }

  cancelEditing(): void {
    this.isEditing = false;
    // Restaurar los datos originales
    if (this.originalFormData) {
      this.profileForm.patchValue(this.originalFormData.profile);
      this.professionalForm.patchValue(this.originalFormData.professional);
      this.selectedTechLabels = [...this.originalFormData.techLabels];
      this.originalFormData = null;
    }
  }

  saveChanges(): void {
    if (this.profileForm.valid && this.professionalForm.valid) {
      this.isSubmitting = true;

      // Crear los objetos de datos para enviar
      const basicData = {
        name: this.profileForm.get('name')?.value,
        surname1: this.profileForm.get('surname1')?.value,
        surname2: this.profileForm.get('surname2')?.value,
        email: this.profileForm.get('email')?.value,
        phone: this.profileForm.get('phone')?.value,
        linkedin: this.profileForm.get('linkedin')?.value || null
      };

      // Solo incluir datos profesionales si existen y no están vacíos
      const professionalData: any = {};
      
      const professionalTitle = this.professionalForm.get('professionalTitle')?.value;
      if (professionalTitle && professionalTitle.trim() !== '') {
        professionalData.professionalTitle = professionalTitle.trim();
      }

      const yearsExperience = this.professionalForm.get('yearsExperience')?.value;
      if (yearsExperience !== null && yearsExperience !== undefined && yearsExperience !== '') {
        professionalData.yearsExperience = yearsExperience;
      }

      const employmentStatus = this.professionalForm.get('employmentStatus')?.value;
      if (employmentStatus && employmentStatus.trim() !== '') {
        professionalData.employmentStatus = employmentStatus.trim();
      }

      const availability = this.professionalForm.get('availability')?.value;
      if (availability && availability.trim() !== '') {
        professionalData.availability = availability.trim();
      }

      const preferredModality = this.professionalForm.get('preferredModality')?.value;
      if (preferredModality && preferredModality.trim() !== '') {
        professionalData.preferredModality = preferredModality.trim();
      }

      const presentation = this.professionalForm.get('presentation')?.value;
      if (presentation && presentation.trim() !== '') {
        professionalData.presentation = presentation.trim();
      }

      const githubProfile = this.professionalForm.get('githubProfile')?.value;
      if (githubProfile && githubProfile.trim() !== '') {
        professionalData.githubProfile = githubProfile.trim();
      }

      // Solo incluir techLabelIds si hay etiquetas seleccionadas
      if (this.selectedTechLabels && this.selectedTechLabels.length > 0) {
        professionalData.techLabelIds = this.selectedTechLabels.map(label => Number(label.id));
      }

      // Combinar los datos - solo incluir campos profesionales si existen
      const combinedData = { ...basicData, ...professionalData };

      console.log('Datos básicos:', basicData); // Debug
      console.log('Datos profesionales:', professionalData); // Debug
      console.log('Datos combinados a enviar:', combinedData); // Debug
      console.log('Selected tech labels:', this.selectedTechLabels); // Debug

      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      });

      this.http.put('http://localhost:30030/candidate/profile', combinedData, { headers })
        .subscribe({
          next: (response) => {
            this.isEditing = false;
            this.isSubmitting = false;
            this.originalFormData = null;
            this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['snackbar-success'],
            });
            // Recargar datos del candidato
            this.retrieveCandidateData();
          },
          error: (error) => {
            console.error('Error completo al guardar cambios:', error);
            console.error('Error body:', error.error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            this.isSubmitting = false;

            // Mostrar mensaje de error más específico
            let errorMessage = 'Error al guardar los cambios';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }

            this.snackBar.open(errorMessage, 'Cerrar', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['snackbar-failed'],
            });
          }
        });
    }
  }

  // Método para manejar cambios en la foto de perfil desde el componente editable-avatar
  onPhotoChanged(event: {photoUrl?: string, filename?: string}): void {
    if (this.candidateData) {
      // Actualizar inmediatamente el estado local
      this.candidateData.profilePhotoUrl = event.photoUrl;
      this.candidateData.profilePhotoFilename = event.filename;
      
      // Forzar detección de cambios si es necesario
      console.log('Photo changed event received:', event);
      console.log('Updated candidateData.profilePhotoUrl:', this.candidateData.profilePhotoUrl);
      
      // Opcional: forzar una recarga completa de los datos del candidato para sincronizar
      if (event.photoUrl) {
        // Solo recargar si se subió una nueva foto, no si se eliminó
        setTimeout(() => {
          this.retrieveCandidateData();
        }, 1000);
      }
    }
  }

  // Helper methods for displaying enum values
  getEmploymentStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'EMPLEADO': 'Empleado',
      'DESEMPLEADO': 'Desempleado',
      'ESTUDIANTE': 'Estudiante',
      'FREELANCE': 'Freelance',
      'BUSCA_ACTIVAMENTE': 'Buscando activamente'
    };
    return statusMap[status] || status;
  }

  getAvailabilityText(availability: string): string {
    const availabilityMap: { [key: string]: string } = {
      'INMEDIATA': 'Inmediata',
      'UNA_SEMANA': 'En una semana',
      'DOS_SEMANAS': 'En dos semanas',
      'UN_MES': 'En un mes',
      'MAS_DE_UN_MES': 'Más de un mes'
    };
    return availabilityMap[availability] || availability;
  }

  getModalityText(modality: string): string {
    const modalityMap: { [key: string]: string } = {
      'PRESENCIAL': 'Presencial',
      'REMOTO': 'Remoto',
      'HIBRIDO': 'Híbrido'
    };
    return modalityMap[modality] || modality;
  }

  // Method to check if a tech label is selected
  isTechLabelSelected(labelId: number): boolean {
    return this.selectedTechLabels.some(selected => selected.id === labelId);
  }

  // Method to check if we can select more tech labels
  canSelectMoreTechLabels(labelId: number): boolean {
    return this.isTechLabelSelected(labelId) || this.selectedTechLabels.length < 10;
  }

  // Method to check if there is professional data to display
  hasProfessionalData(): boolean {
    return !!(
      this.professionalForm.get('professionalTitle')?.value ||
      this.professionalForm.get('yearsExperience')?.value ||
      this.professionalForm.get('employmentStatus')?.value ||
      this.professionalForm.get('availability')?.value ||
      this.professionalForm.get('preferredModality')?.value ||
      this.professionalForm.get('presentation')?.value ||
      this.professionalForm.get('githubProfile')?.value ||
      this.selectedTechLabels.length > 0
    );
  }

  // Method to get CSS class for employment status
  getEmploymentStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'EMPLOYED': 'status-employed',
      'UNEMPLOYED': 'status-unemployed',
      'STUDENT': 'status-student',
      'FREELANCER': 'status-freelancer'
    };
    return classMap[status] || '';
  }

  // Method to get CSS class for availability
  getAvailabilityClass(availability: string): string {
    const classMap: { [key: string]: string } = {
      'IMMEDIATE': 'availability-immediate',
      'TWO_WEEKS': 'availability-short',
      'ONE_MONTH': 'availability-medium',
      'THREE_MONTHS': 'availability-long'
    };
    return classMap[availability] || '';
  }

  // Method to get CSS class for modality
  getModalityClass(modality: string): string {
    const classMap: { [key: string]: string } = {
      'REMOTE': 'modality-remote',
      'ONSITE': 'modality-onsite',
      'HYBRID': 'modality-hybrid'
    };
    return classMap[modality] || '';
  }

  goBack(): void {
    this.location.back();
  }
}
