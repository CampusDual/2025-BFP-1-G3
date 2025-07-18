import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Comprobar si el usuario está autenticado
    if (!this.loginService.isAuthenticated()) {
      this.router.navigate(['/main/login']);
      return false;
    }

    // Obtener el rol del usuario usando los métodos públicos del servicio
    let role = '';
    if (this.loginService.isLoggedAsCandidate()) {
      role = 'role_candidate';
    } else if (this.loginService.isLoggedAsCompany()) {
      role = 'role_company';
    } else if (this.loginService.isLoggedAsAdmin()) {
      role = 'role_admin';
    }

    // Obtener la URL a la que se intenta acceder
    const url = state.url;

    // Definir rutas permitidas para cada rol
    const candidateRoutes = ['/main/candidato', '/main/ofertas', '/main/offer-details', '/main/ofertas-recomendadas'];
    const companyRoutes = ['/main/empresa', '/main/publicar', '/main/ofertas', '/main/offer-details', '/main/detallesCandidato'];
    const adminRoutes = ['/main/admin', '/main/admin/etiquetas'];

    // Función para comprobar si la ruta está permitida para el rol
    const isAllowed = (allowedRoutes: string[]) => {
      return allowedRoutes.some(route => url.startsWith(route));
    };

    // Comprobar rol y ruta permitida
    if (role === 'role_candidate' && isAllowed(candidateRoutes)) {
      return true;
    } else if (role === 'role_company' && isAllowed(companyRoutes)) {
      return true;
    } else if (role === 'role_admin') {
      // Para admin, solo permitir rutas adminRoutes
      if (isAllowed(adminRoutes)) {
        return true;
      } else {
        // Si admin intenta acceder a cualquier otra ruta, redirigir a admin
        if (url.startsWith('/main/ofertas')) {
          this.router.navigate(['/main/admin']);
        } else {
          this.router.navigate(['/main/admin']);
        }
        return false;
      }
    } else {
      this.router.navigate(['/main/ofertas']);
      return false;
    }
  }
}
