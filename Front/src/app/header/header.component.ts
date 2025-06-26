import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LoginService } from '../services/login.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() sidenavToggle = new EventEmitter<void>();
  
  currentSectionTitle: string = '';

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setCurrentSectionTitle();
    });

    // por si ya hay una ruta al cargar
    this.setCurrentSectionTitle(); 
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

  toggleSidenav(): void {
    this.sidenavToggle.emit();
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/main']);
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