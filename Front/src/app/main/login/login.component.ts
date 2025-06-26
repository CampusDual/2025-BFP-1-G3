import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hide = true;
  user: string = '';
  password: string = '';
  loginError: string = '';

  constructor(private loginService: LoginService, private router: Router, private http: HttpClient, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loginService.loadUserProfile();
  }

  login(user: string, password: string) {
    console.log("Datos recogidos del formulario:", user, password);
    this.loginError = '';

    this.loginService.login(user, password).subscribe(
      response => {
        // Comprobar primero si es admin - esto tiene prioridad sobre todo lo demás
        if (response.roles === 'role_admin') {
          // Si es admin, cancelar cualquier intento de aplicación pendiente
          this.loginService.clickedApplyOffer = false;
          this.router.navigate(['/main/admin']);
        }
        // Comprobar si es empresa - también tiene prioridad
        else if (response.roles === 'role_company') {
          // Si es empresa, cancelar cualquier intento de aplicación pendiente
          this.loginService.clickedApplyOffer = false;
          this.router.navigate(['/main/empresa']);
        }
        // Si no es admin ni empresa, seguir con la lógica normal
        else if (response.empresa === "" && this.loginService.clickedApplyOffer) {
          // Si intentó aplicar a una oferta, manejamos eso primero
          this.applyOfferAfterLogIn();
          this.loginService.clickedApplyOffer = false;
        } else if (response.roles === 'role_candidate') {
          this.router.navigate(['/main/candidato']);
        } else {
          this.router.navigate(['/main/empresa']);
        }
      },
      error => {
        console.error("Error en login:", error);
        if (error.message.includes("401")) {
          this.loginError = "Usuario o contraseña incorrectos";
        } else {
          this.loginError = "Error de conexión con el servidor";
        }
      }
    );
  }

  applyOfferAfterLogIn(): void {
    this.loginService.loadUserProfile().subscribe({
      next: () => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem('token')
        });

        const candidateId = this.loginService.candidateId;
        const offerId = this.loginService.idOffer;
        
        // Primero verificar si ya está inscrito
        this.http.get(`http://localhost:30030/applications/check/${candidateId}/${offerId}`, { headers })
          .subscribe({
            next: (response: any) => {
              if (response && response.exists) {
                // Ya está inscrito, mostrar mensaje informativo
                this.snackBar.open('Ya estás inscrito a esta oferta', 'Cerrar', {
                  duration: 5000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom',
                  panelClass: ['snackbar-info'],
                });
                // Navegar a ofertas
                this.router.navigate(['/main/ofertas']);
              } else {
                // No está inscrito, proceder con la inscripción
                this.submitApplication(candidateId, offerId, headers);
              }
            },
            error: () => {
              // Si hay error en la verificación, intentar inscribir de todos modos
              this.submitApplication(candidateId, offerId, headers);
            }
          });
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
        this.snackBar.open('Error al cargar perfil de usuario.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-failed'],
        });
        // Navegar a ofertas incluso en caso de error
        this.router.navigate(['/main/ofertas']);
      }
    });
  }

  // Método auxiliar para enviar la solicitud de inscripción
  private submitApplication(candidateId: number, offerId: number, headers: HttpHeaders): void {
    const applicationData = {
      id_candidate: candidateId,
      id_offer: offerId
    };
    
    this.http.post('http://localhost:30030/applications/add', applicationData, { headers })
      .subscribe({
        next: (response) => {
          this.snackBar.open('Inscripción recibida con éxito.', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['snackbar-success'],
          });
          // Navegar después de completar la inscripción
          this.router.navigate(['/main/ofertas']);
        },
        error: (error) => {
          if (this.isAlreadyAppliedError(error)) {
            this.snackBar.open('Ya estás inscrito a esta oferta', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['snackbar-info'],
            });
          } else {
            this.snackBar.open('Error al inscribirse a la oferta.', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['snackbar-failed'],
            });
          }
          // Navegar a ofertas incluso en caso de error
          this.router.navigate(['/main/ofertas']);
        }
      });
  }

  // Método auxiliar para detectar si el error es por ya estar inscrito
  private isAlreadyAppliedError(error: any): boolean {
    // Verificar por código de estado
    if (error.status === 409 || error.status === 400 || error.status === 500) {
      return true;
    }

    // Verificar en error.error (string)
    if (error.error && typeof error.error === 'string') {
      if (error.error.includes('ya inscrito') ||
        error.error.includes('already applied') ||
        error.error.includes('duplicate') ||
        error.error.includes('Internal Server Error')) {
        return true;
      }
    }
    
    // Verificar en error.error.message
    if (error.error && error.error.message) {
      if (error.error.message.includes('ya inscrito') ||
        error.error.message.includes('already applied') ||
        error.error.message.includes('duplicate')) {
        return true;
      }
    }
    
    // Verificar en error.message
    if (error.message) {
      if (error.message.includes('ya inscrito') ||
        error.message.includes('already applied') ||
        error.message.includes('duplicate')) {
        return true;
      }
    }
    
    return false;
  }
}