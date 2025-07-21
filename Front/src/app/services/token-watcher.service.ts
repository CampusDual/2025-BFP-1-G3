import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class TokenWatcherService {
  private checkInterval = 5000; // Reducido de 3 a 5 segundos para ser menos agresivo
  public isWatching = false; // Cambiado a público para poder verificar desde el AppComponent
  private tokenValid = new BehaviorSubject<boolean>(true);
  private originalToken: string | null = null;
  private lastTokenChangeTime = 0;
  private tokenChangeGracePeriod = 10000; // Aumentado a 10 segundos de gracia

  constructor(
    private loginService: LoginService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  // Iniciar la vigilancia del token
  startWatching(): void {
    if (this.isWatching) return;
    
    this.isWatching = true;
    
    // Guardar el token original para comparar
    this.originalToken = sessionStorage.getItem('token');
    console.log("Iniciando vigilancia del token. Token original:", this.originalToken?.substring(0, 10) + "...");
    
    // Verificar inmediatamente al iniciar
    this.checkToken();
    
    // Configurar verificación periódica
    interval(this.checkInterval)
      .pipe(takeWhile(() => this.isWatching))
      .subscribe(() => this.checkToken());
  }

  // Detener la vigilancia
  stopWatching(): void {
    this.isWatching = false;
    console.log("Vigilancia del token detenida");
  }

  // Método para notificar un cambio de token legítimo (ej: cambio de usuario)
  notifyLegitimateTokenChange(): void {
    const currentToken = sessionStorage.getItem('token');
    this.originalToken = currentToken;
    this.lastTokenChangeTime = Date.now();
    console.log("Cambio legítimo de token notificado:", currentToken?.substring(0, 10) + "...");
  }

  // Verificar la validez del token
  private checkToken(): void {
    const currentToken = sessionStorage.getItem('token');
    
    // Si no hay token pero había uno antes, la sesión se ha cerrado
    if (!currentToken && this.originalToken) {
      this.stopWatching();
      return;
    }
    
    // Si no hay token y no había uno antes, no hay sesión que verificar
    if (!currentToken) {
      return;
    }
    
    // Detectar si el token ha cambiado manualmente
    if (this.originalToken && currentToken !== this.originalToken) {
      // Verificar si estamos dentro del período de gracia después de un cambio legítimo
      const timeSinceLastChange = Date.now() - this.lastTokenChangeTime;
      
      if (timeSinceLastChange < this.tokenChangeGracePeriod) {
        console.log("Cambio de token detectado dentro del período de gracia, actualizando token original");
        this.originalToken = currentToken;
        return;
      }
      
      console.log("¡Cambio detectado en el token! Original vs Actual:", 
                 this.originalToken?.substring(0, 10) + "... vs " + 
                 currentToken?.substring(0, 10) + "...");
      this.handleTokenTampered();
      return;
    }
    
    // Verificar si el token ha expirado
    if (!this.loginService.isTokenValid()) {
      console.log("Token expirado detectado");
      this.handleExpiredToken();
      return;
    }
  }

  // Manejar token expirado
  private handleExpiredToken(): void {
    this.tokenValid.next(false);
    this.loginService.logout();
    
    this.snackBar.open('Tu sesión ha caducado', 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-failed'],
    });
    
    this.router.navigate(['/main/ofertas']);
    this.stopWatching();
  }
  
  // Manejar token manipulado
  private handleTokenTampered(): void {
    this.tokenValid.next(false);
    this.loginService.logout();
    
    this.snackBar.open('Se ha detectado una manipulación de sesión. Por seguridad, se ha cerrado la sesión.', 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-failed'],
    });
    
    this.router.navigate(['/main/ofertas']);
    this.stopWatching();
  }

  // Verificar token cuando se recibe error 401
  checkTokenOnError(status: number): void {
    if (status === 401 && this.loginService.isAuthenticated()) {
      this.handleExpiredToken();
    }
  }
}