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
        // console.log("Respuesta del backend:", response);
        // Cambiado para redirigir a ofertas en lugar de index
        if (response.empresa === "" && this.loginService.clickedApplyOffer) {
          this.applyOfferAfterLogIn();
          this.router.navigate(['/main/ofertas']);
        } else if (response.empresa === "") {
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
        
        const applicationData = {
          id_candidate: this.loginService.candidateId,
          id_offer: this.loginService.idOffer
        };
        console.log(applicationData)
        this.http.post('http://localhost:30030/applications/add', applicationData, { headers })
          .subscribe({
            next: (response) => {
              this.snackBar.open('Aplicación recibida con éxito.', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                panelClass: ['snackbar-success'],
              });
              this.router.navigate(['/main/ofertas']);
            },
            error: (error) => {
              this.snackBar.open('Error al aplicar a la oferta.', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                panelClass: ['snackbar-failed'],
              });
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
      }
    });
  }
}