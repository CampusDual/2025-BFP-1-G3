import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  hide = true;

  user: string = '';
  password: string = '';
  loginError: string = '';

  constructor(private loginService: LoginService, private router: Router) { }

  login(user: string, password: string) {
    console.log("Datos recogidos del formulario:", user, password);
    this.loginError = '';

    this.loginService.login(user, password).subscribe(
      response => {
        // console.log("Respuesta del backend:", response);
        // Cambiado para redirigir a ofertas en lugar de index
        if (response.empresa === "") {
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
}