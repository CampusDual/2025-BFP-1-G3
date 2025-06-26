import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LoginService } from './services/login.service';
import { MatSidenav } from '@angular/material/sidenav';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'projectTrials';
  currentAdminSection: string = 'empresas';

  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(private router: Router, private loginService: LoginService) {
    // Detectar cambios de ruta para actualizar la sección activa
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateAdminSection();
    });
  }

  // Añadir este método para solucionar el error
  toggleSidenav() {
    this.sidenav.toggle();
  }

  isAdminRoute(): boolean {
    return this.router.url.includes('/main/admin');
  }

  isLoggedIn(): boolean {
    return this.loginService.isAuthenticated();
  }

  isLoggedAsCompany(): boolean {
    return this.loginService.isLoggedAsCompany();
  }

  isLoggedAsCandidate(): boolean {
    return this.loginService.isLoggedAsCandidate();
  }

  isLoggedAsAdmin(): boolean {
    // Implementa este método en tu servicio o crea una implementación aquí
    return this.loginService.isAuthenticated() &&
      this.loginService.isLoggedAsAdmin();
  }

  isActiveAdminSection(section: string): boolean {
    return this.currentAdminSection === section;
  }

  private updateAdminSection(): void {
    const url = this.router.url;

    if (url.includes('/main/admin/ofertas')) {
      this.currentAdminSection = 'ofertas';
    } else if (url.includes('/main/admin/candidatos')) {
      this.currentAdminSection = 'candidatos';
    } else if (url.includes('/main/admin')) {
      this.currentAdminSection = 'empresas';
    }
  }
}