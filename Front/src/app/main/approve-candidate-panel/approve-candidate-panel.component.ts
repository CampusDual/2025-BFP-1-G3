import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserData } from 'src/app/model/userData';
import { LoginService } from 'src/app/services/login.service';
import { Location } from '@angular/common';
import { TechLabel } from 'src/app/model/tech-label';

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
  offerId: number = 0; // ID de la oferta
  applicationState: number = 0; // Estado actual de la aplicación
  applicationId: number = 0; // ID de la aplicación
  loadingApplicationState: boolean = false; // Indicador de carga del estado

  availableTechLabels: TechLabel[] = [];
  selectedTechLabels: TechLabel[] = [];
  loadingTechLabels: boolean = false;

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
      
      // Debug: Verificar URL actual
      console.log('URL actual:', window.location.href);
      console.log('Query params en la URL:', window.location.search);
      
      const navigation = this.router.getCurrentNavigation();
      console.log('Navigation state:', navigation?.extras?.state);
      
      // Primero verificar si hay query parameters (recarga o navegación con query params)
      this.route.queryParams.subscribe(queryParams => {
        console.log('Query params de Angular:', queryParams);
        
        if (queryParams['applicationId']) {
          // Tenemos applicationId en la URL - obtener estado actual desde BD
          this.applicationId = Number(queryParams['applicationId']);
          console.log('ApplicationId obtenido de query params:', this.applicationId);
          
          // También obtener offerId si está disponible
          if (queryParams['offerId']) {
            this.offerId = Number(queryParams['offerId']);
            console.log('OfferId obtenido de query params:', this.offerId);
          }
          
          // MEJORA: Usar el estado del navigation como valor inicial para evitar parpadeo
          if (navigation?.extras.state?.['applicationState'] !== undefined) {
            this.applicationState = navigation.extras.state['applicationState'];
            console.log('Estado inicial desde navigation state (evita parpadeo):', this.applicationState);
          }
          
          console.log('Obteniendo estado ACTUAL desde BD (puede haber cambiado)');
          this.loadCurrentApplicationState();
        } else if (navigation?.extras.state?.['applicationId']) {
          // Fallback: usar navigation state solo si no hay query params
          this.applicationId = navigation.extras.state['applicationId'];
          
          // También obtener offerId del state si está disponible
          if (navigation.extras.state?.['offerId']) {
            this.offerId = navigation.extras.state['offerId'];
            console.log('OfferId obtenido del navigation state:', this.offerId);
          }
          
          if (navigation.extras.state?.['applicationState'] !== undefined) {
            this.applicationState = navigation.extras.state['applicationState'];
            console.log('Estado de la aplicación recibido en estado de navegación (fallback):', this.applicationState);
          }
        } else {
          console.log('No hay applicationId disponible - estado por defecto');
        }
      });
      
      this.loadTechLabels();
      this.retrieveCandidateData(this.candidateId);
    });
  }

  loadTechLabels(): void {
    this.loadingTechLabels = true;
    this.loginService.getAllTechLabels().subscribe({
      next: (labels: TechLabel[]) => {
        this.availableTechLabels = labels;
        this.loadingTechLabels = false;
        this.setSelectedTechLabels();
      },
      error: (error) => {
        console.error('Error cargando tech labels:', error);
        this.loadingTechLabels = false;
        this.setSelectedTechLabels();
      }
    });
  }

  // Método para cargar el estado actual de la aplicación desde la BD
  loadCurrentApplicationState(): void {
    if (this.applicationId && this.offerId) {
      console.log('Cargando estado actual desde BD para applicationId:', this.applicationId, 'en offerId:', this.offerId);
      
      this.loadingApplicationState = true;
      // Usar método directo: obtener aplicaciones por oferta y filtrar
      this.loadCurrentApplicationStateAlternative();
    } else {
      console.log('No hay applicationId o offerId disponible para cargar estado');
    }
  }

  // Método para obtener el estado actual desde las aplicaciones de la oferta
  loadCurrentApplicationStateAlternative(): void {
    console.log('Obteniendo candidatos de la oferta', this.offerId);
    
    if (!this.offerId) {
      console.error('No hay offerId disponible para buscar candidatos');
      this.applicationState = 0;
      return;
    }
    
    this.loginService.getCandidatesByOfferId(this.offerId).subscribe({
      next: (applications) => {
        console.log('Aplicaciones encontradas para la oferta', this.offerId, ':', applications);
        
        // Buscar la aplicación específica por applicationId
        const currentApplication = applications.find(app => app.id === this.applicationId);
        
        if (currentApplication) {
          this.applicationState = currentApplication.state;
          console.log('Estado actual cargado exitosamente:', this.applicationState);
          console.log('Aplicación encontrada:', currentApplication);
        } else {
          console.error('No se encontró la aplicación', this.applicationId, 'en la oferta', this.offerId);
          console.log('Detalles de búsqueda:');
          console.log('- applicationId buscado:', this.applicationId);
          console.log('- offerId buscado:', this.offerId);
          console.log('- Aplicaciones disponibles:', applications.map(app => ({
            id: app.id,
            candidateId: app.id_candidate,
            state: app.state
          })));
          this.applicationState = 0; // Valor por defecto
        }
        this.loadingApplicationState = false;
      },
      error: (error) => {
        console.error('Error obteniendo candidatos de la oferta:', error);
        this.applicationState = 0; // Valor por defecto
        this.loadingApplicationState = false;
      }
    });
  }

  setSelectedTechLabels(): void {
    if (this.userData && this.userData.candidate && this.userData.candidate.techLabelIds) {
      this.selectedTechLabels = this.availableTechLabels.filter(label =>
        this.userData!.candidate!.techLabelIds!.includes(label.id)
      );
    }
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
              linkedin: response.linkedin,
              professionalTitle: response.professionalTitle,
              yearsExperience: response.yearsExperience,
              employmentStatus: response.employmentStatus,
              availability: response.availability,
              preferredModality: response.preferredModality,
              presentation: response.presentation,
              githubProfile: response.githubProfile,
              profilePhotoUrl: response.profilePhotoUrl,
              techLabelIds: response.techLabelIds
            }
          };
          this.setSelectedTechLabels();
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
        console.log('Estado actualizado en BD:', newState);
        
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

  getEmploymentStatusText(status: string | undefined): string {
    if (!status) return '';
    const statusMap: { [key: string]: string } = {
      'EMPLEADO': 'Empleado',
      'DESEMPLEADO': 'Desempleado',
      'ESTUDIANTE': 'Estudiante',
      'FREELANCE': 'Freelance',
      'BUSCA_ACTIVAMENTE': 'Buscando activamente'
    };
    return statusMap[status] || status;
  }

  getAvailabilityText(availability: string | undefined): string {
    if (!availability) return '';
    const availabilityMap: { [key: string]: string } = {
      'INMEDIATA': 'Inmediata',
      'UNA_SEMANA': 'En una semana',
      'DOS_SEMANAS': 'En dos semanas',
      'UN_MES': 'En un mes',
      'MAS_DE_UN_MES': 'Más de un mes'
    };
    return availabilityMap[availability] || availability;
  }

  getModalityText(modality: string | undefined): string {
    if (!modality) return '';
    const modalityMap: { [key: string]: string } = {
      'PRESENCIAL': 'Presencial',
      'REMOTO': 'Remoto',
      'HIBRIDO': 'Híbrido'
    };
    return modalityMap[modality] || modality;
  }
}
