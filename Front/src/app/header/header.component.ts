import { Component, EventEmitter, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() sidenavToggle = new EventEmitter<void>();

  currentSectionTitle: string = '';

  constructor(
    private loginService: LoginService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setCurrentSectionTitle();
      // Forzar detección de cambios cuando cambia la ruta
      this.cdr.detectChanges();
    });

    // por si ya hay una ruta al cargar
    this.setCurrentSectionTitle();
    // Forzar detección de cambios inicial
    this.cdr.detectChanges();
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
    return this.loginService.isLoggedAsAdmin();
  }

  toggleSidenav(): void {
    this.sidenavToggle.emit();
  }

  logout(): void {
    this.loginService.logout();
    // Modificación aquí: siempre redirigir a /main/ofertas independientemente del rol
    this.router.navigate(['/main/ofertas']);
  }

  private setCurrentSectionTitle(): void {
    const path = this.router.url;

    if (path.includes('/main/empresa')) {
      this.currentSectionTitle = 'Panel de Empresa';
    } else if (path.includes('/main/ofertas')) {
      this.currentSectionTitle = 'Ofertas disponibles';
    } else if (path.includes('/main/publicar')) {
      this.currentSectionTitle = 'Publicar oferta';
    } else if (path.includes('/main/candidato')) {
      this.currentSectionTitle = 'Mi perfil';
    } else if (path.includes('/main/admin')) {
      this.currentSectionTitle = 'Panel de Administración';
    } else {
      this.currentSectionTitle = '';
    }
  }
}