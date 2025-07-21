import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoginService } from './services/login.service';
import { TokenWatcherService } from './services/token-watcher.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'projectTrials';
  currentAdminSection: string = 'empresas';

  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    private router: Router, 
    private loginService: LoginService,
    private tokenWatcher: TokenWatcherService,
    private cdr: ChangeDetectorRef
  ) {
    // Detectar cambios de ruta para actualizar la sección activa
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateAdminSection();
      
      // Solo iniciar vigilancia si no está ya vigilando y el usuario está autenticado
      if (this.loginService.isAuthenticated() && !this.tokenWatcher.isWatching) {
        this.tokenWatcher.startWatching();
      } else if (!this.loginService.isAuthenticated()) {
        // Detener vigilancia si no hay sesión activa
        this.tokenWatcher.stopWatching();
      }
      
      // Forzar detección de cambios para actualizar la vista
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    // Verificar estado de autenticación al inicializar
    if (this.loginService.isAuthenticated() && !this.tokenWatcher.isWatching) {
      this.tokenWatcher.startWatching();
    }
    
    // Forzar detección de cambios inicial
    this.cdr.detectChanges();
  }

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