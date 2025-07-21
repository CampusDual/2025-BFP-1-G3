import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { map, catchError, tap } from 'rxjs/operators'
import { OResponse } from "../model/response";
import { Offer } from "../model/offer";
import { Candidate } from "../model/candidate";
import { Application } from "../model/application";
import { TechLabel } from "../model/tech-label";
import { Router } from "@angular/router";
import { state } from "@angular/animations";
import { ApplicationSummaryDTO } from '../model/application-summary';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  // Cache de aplicaciones del candidato
  public candidateApplicationsCache: ApplicationSummaryDTO[] | null = null; // Público para optimización de UI
  public applicationsCacheLoaded: boolean = false; // Público para optimización de UI

  //Método para obtener aplicaciones de un candidato
  getCandidateApplications(): Observable<ApplicationSummaryDTO[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<ApplicationSummaryDTO[]>(`${this.urlEndPoint}/applications/getAplicationsByCandidate`, {}, { headers }).pipe(
      map(response => {
        console.log('Aplicaciones del candidato:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error obteniendo aplicaciones del candidato:', error);
        console.error('Status:', error.status);
        console.error('URL:', error.url);
        return throwError(() => error);
      })
    );
  }

  // Nuevo método para obtener una aplicación por su ID
  getApplicationById(applicationId: number): Observable<ApplicationSummaryDTO> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Usar POST con el ID en el body, similar a otros endpoints
    return this.http.post<ApplicationSummaryDTO>(`${this.urlEndPoint}/applications/getById`, 
      { id: applicationId }, 
      { headers }).pipe(
      map(response => {
        console.log('Aplicación obtenida por ID:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error obteniendo aplicación por ID:', error);
        return throwError(() => error);
      })
    );
  }

  // Nuevo método para obtener aplicaciones de un candidato por id
  getApplicationsByCandidate(candidateId: number): Observable<ApplicationSummaryDTO[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<ApplicationSummaryDTO[]>(`${this.urlEndPoint}/applications/getAplicationsByCandidate`, { id: candidateId }, { headers }).pipe(
      map(response => {
        console.log('Aplicaciones del candidato por id:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error obteniendo aplicaciones del candidato por id:', error);
        return throwError(() => error);
      })
    );
  }

  // Nuevo método para alternar estado activo de oferta
  toggleOfferActive(id: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.urlEndPoint}/offers/toggleActive/${id}`, null, { headers, responseType: 'text' }).pipe(
      map(response => {
        console.log('Estado activo de oferta alternado:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error alternando estado activo de oferta:', error);
        return throwError(() => error);
      })
    );
  }

  clickedApplyOffer: boolean = false;
  idOffer!: number;
  companyId!: number;
  candidateId!: number;
  role!: string;

  private urlEndPoint: string = 'http://localhost:30030'

  constructor(private http: HttpClient, private router: Router) {
    // Inicializar el rol desde el token si existe
    this.role = this.getRoleFromToken();
  }

  // Método para extraer el rol del token JWT
  private getRoleFromToken(): string {
    const token = sessionStorage.getItem('token');
    if (!token) return '';

    try {
      // Decodificar el payload del JWT
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Extraer el rol del campo 'role' del payload
      return payload.role || '';
    } catch (error) {
      console.error('Error decodificando token para obtener rol:', error);
      return '';
    }
  }

  // Método para obtener el rol (ahora solo del token)
  private getRole(): string {
    return this.getRoleFromToken();
  }

  // Método para obtener el ID del usuario del token JWT
  getUserIdFromToken(): number | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
      // Decodificar el payload del JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Extraer el ID del usuario del campo 'sub' o 'id' del payload
      return payload.sub || payload.id || null;
    } catch (error) {
      console.error('Error decodificando token para obtener ID de usuario:', error);
      return null;
    }
  }

  // Método para obtener el companyId del token (solo para empresas)
  getCompanyIdFromToken(): number | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
      // Decodificar el payload del JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Extraer el companyId del payload (solo estará presente si es una empresa)
      return payload.companyId || null;
    } catch (error) {
      console.error('Error decodificando token para obtener companyId:', error);
      return null;
    }
  }

  // Método para obtener el candidateId del token JWT
  getCandidateIdFromToken(): number | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
      // Decodificar el payload del JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      console.log('DEBUG getCandidateIdFromToken - payload completo:', payload);
      console.log('DEBUG getCandidateIdFromToken - candidateId desde token:', payload.candidateId);
      console.log('DEBUG getCandidateIdFromToken - candidateId desde servicio:', this.candidateId);
      
      // Primero intentar obtener el candidateId del token
      if (payload.candidateId) {
        return payload.candidateId;
      }
      
      // Si no está en el token, usar el que se cargó desde el perfil
      if (this.candidateId) {
        return this.candidateId;
      }
      
      return null;
    } catch (error) {
      console.error('Error decodificando token para obtener candidateId:', error);
      
      // Como fallback, usar el candidateId del servicio si está disponible
      return this.candidateId || null;
    }
  }

  login(user: string, password: string) {
    const url = this.urlEndPoint + "/auth/signin";
    const headers = new HttpHeaders({
      'Authorization': "Basic " + btoa(user + ":" + password)
    });

    return this.http.post<any>(url, {}, { headers })
      .pipe(
        tap(response => {
          sessionStorage.setItem('user', user);
          // sessionStorage.setItem('password', password);
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('empresa', response.empresa);
          // Ya no guardamos el rol en sessionStorage, se obtiene del token

          this.role = response.roles;
          
          // 🚀 OPTIMIZACIÓN: Precargar caché de aplicaciones para candidatos
          // Esto mejora la velocidad de navegación posterior
          setTimeout(() => {
            if (this.isLoggedAsCandidate()) {
              console.log('🔄 Precargando caché de aplicaciones tras login...');
              this.loadApplicationsCacheIfCandidate()?.subscribe({
                next: () => {
                  console.log('✅ Caché precargado exitosamente tras login');
                },
                error: (error) => {
                  console.warn('⚠️ Error precargando caché tras login:', error);
                }
              });
            }
          }, 100); // Pequeño delay para asegurar que el token esté guardado
        }),
        catchError(e => {
          if (e.status === 401) {
            console.error("Error de autenticación: " + e.message);
            return throwError(() => new Error("401 - Unauthorized"));
          } else {
            console.error(e.status + ": " + e.message);
            return throwError(() => e);
          }
        })
      );
  }

  getOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(this.urlEndPoint + "/offers/getAll").pipe(
      map(response => {
        console.log('Respuesta del servidor:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error obteniendo ofertas:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para obtener ofertas por empresa
  getOffersByCompanyId(companyId: number): Observable<Offer[]> {
    const token = sessionStorage.getItem('token');
    console.log(token);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Offer[]>(`${this.urlEndPoint}/offers/getOffersByCompany/${companyId}`, { headers }).pipe(
      map(response => {
        console.log('Respuesta del servidor:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error obteniendo ofertas:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para actualizar una oferta
  updateOffer(offer: Offer): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put<any>(`${this.urlEndPoint}/offers/update`, offer, { headers }).pipe(
      map(response => {
        console.log('Oferta actualizada:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error actualizando oferta:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para obtener ofertas paginadas
  getOffersPaginated(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.urlEndPoint}/offers/getPaginated?page=${page}&size=${size}`).pipe(
      map(response => {
        console.log('Respuesta paginada del servidor:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error obteniendo ofertas paginadas:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para obtener solo ofertas activas
  getAllActiveOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.urlEndPoint}/offers/getActive`).pipe(
      map(response => {
        console.log('Respuesta ofertas activas del servidor:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error obteniendo ofertas activas:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para obtener una oferta específica por ID (sin autenticación requerida)
  getOfferById(id: number): Observable<Offer> {
    return this.http.get<Offer>(`${this.urlEndPoint}/offers/${id}`).pipe(
      map(response => {
        console.log('Respuesta oferta por ID del servidor:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error obteniendo oferta por ID:', error);
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    return sessionStorage.getItem('token') !== null;
  }

  isLoggedAsCompany(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    const role = this.getRole();
    return role === 'role_company';
  }

  isLoggedAsCandidate(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    const role = this.getRole();
    return role === 'role_candidate';
  }

  isLoggedAsAdmin(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    const role = this.getRole();
    return role === 'role_admin';
  }

  // Verificar si el usuario está logueado (cualquier rol)
  isLoggedIn(): boolean {
    const token = sessionStorage.getItem('token');
    return token !== null && token.trim() !== '';
  }

  logout(): void {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('password');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('empresa');
    // No necesitamos limpiar 'role' de sessionStorage porque ya no lo usamos
    this.role = '';
    
    // Limpiar caché de aplicaciones
    this.clearApplicationsCache();

    console.log('Sesión cerrada correctamente');

    //Fuerzo que se recargue la página
    if (window.location.pathname === '/main/ofertas') {
      window.location.reload();
    }
  }

  loadUserProfile(): Observable<{ companyId: number, candidateId: number }> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      // this.errorMessage = 'No está logueado.';
      return new Observable(observer => {
        observer.error('No token found');
        observer.complete();
      });
    }

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.get<{ companyId: number, candidateId: number }>('http://localhost:30030/auth/profile', { headers }).pipe(
      tap(response => {
        this.companyId = response.companyId;
        this.candidateId = response.candidateId;
      })
    );
  }

  //Función que valida el token
  isTokenValid(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    try {
      // Decodificar el token JWT para obtener el payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);

      // Verificar expiración con un margen de 10 segundos
      return exp > (now + 10);
    } catch (error) {
      console.error('Error decodificando token:', error);
      return false;
    }
  }

  // Método para obtener candidatos inscritos en una oferta específica
  getCandidatesByOfferId(offerId: number): Observable<Application[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Application[]>(`${this.urlEndPoint}/offers/${offerId}/candidates`, { headers }).pipe(
      map(response => {
        console.log('Candidatos obtenidos para la oferta:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error obteniendo candidatos:', error);
        return throwError(() => error);
      })
    );
  }

  // === MÉTODOS PARA TECH LABELS ===

  /**
   * Obtener todas las etiquetas técnicas disponibles
   */
  getAllTechLabels(): Observable<TechLabel[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<TechLabel[]>(`${this.urlEndPoint}/tech-labels/getAll`, { headers }).pipe(
      map(response => {
        console.log('Etiquetas técnicas obtenidas:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error obteniendo etiquetas técnicas:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Insertar una nueva etiqueta técnica
   */
  insertTechLabel(label: TechLabel): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.urlEndPoint}/tech-labels/add`, label, { headers, responseType: 'text' }).pipe(
      map(response => {
        console.log('Etiqueta técnica insertada:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error insertando etiqueta técnica:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualizar una etiqueta técnica existente
   */
  updateTechLabel(label: TechLabel): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.urlEndPoint}/tech-labels/update`, label, { headers, responseType: 'text' }).pipe(
      map(response => {
        console.log('Etiqueta técnica actualizada:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error actualizando etiqueta técnica:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Eliminar una etiqueta técnica
   */
  deleteTechLabel(label: TechLabel): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.urlEndPoint}/tech-labels/delete`, label, { headers, responseType: 'text' }).pipe(
      map(response => {
        console.log('Etiqueta técnica eliminada:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error eliminando etiqueta técnica:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener etiquetas de una oferta específica
   */
  getOfferLabels(offerId: number): Observable<TechLabel[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<TechLabel[]>(`${this.urlEndPoint}/offers/${offerId}/labels`, { headers }).pipe(
      map(response => {
        console.log('Etiquetas de la oferta obtenidas:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error obteniendo etiquetas de la oferta:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Agregar etiqueta a una oferta
   */
  addLabelToOffer(offerId: number, labelId: number): Observable<string> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.urlEndPoint}/offers/${offerId}/labels/${labelId}`, {}, { headers, responseType: 'text' }).pipe(
      map(response => {
        console.log('Etiqueta agregada a la oferta:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error agregando etiqueta a la oferta:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Remover etiqueta de una oferta
   */
  removeLabelFromOffer(offerId: number, labelId: number): Observable<string> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete(`${this.urlEndPoint}/offers/${offerId}/labels/${labelId}`, { headers, responseType: 'text' }).pipe(
      map(response => {
        console.log('Etiqueta removida de la oferta:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error removiendo etiqueta de la oferta:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualizar todas las etiquetas de una oferta
   */
  updateOfferLabels(offerId: number, labelIds: number[]): Observable<string> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.urlEndPoint}/offers/${offerId}/labels`,
      { labelIds: labelIds },
      { headers, responseType: 'text' }
    ).pipe(
      map(response => {
        console.log('Etiquetas de la oferta actualizadas:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error actualizando etiquetas de la oferta:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para verificar si un candidato ya está inscrito en una oferta
  checkApplicationExists(candidateId: number, offerId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.urlEndPoint}/applications/check/${candidateId}/${offerId}`, { headers });
  }

  // Método para inscribirse a una oferta
  applyToOfferService(offerId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    const applicationData = {
      id_offer: offerId
    };
    
    return this.http.post(`${this.urlEndPoint}/applications/add`, applicationData, { headers });
  }

  // Método para actualizar el estado de una aplicación
  updateApplicationState(applicationId: number, newState: number): Observable<String> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const requestBody = {
      id: applicationId,
      state: newState
    };

    return this.http.put(`${this.urlEndPoint}/applications/toggleActive/${applicationId}`, requestBody,
      { headers, responseType: 'text' }).pipe(
        map(response => {
          console.log("Estado de la inscripción del candidato:", response);
          return response;
        }),
        catchError(error => {
          console.error('Error al cambiar el estado de la inscripción del candidato:', error);
          return throwError(() => error);
        })
      );
  }

  // Método para obtener aplicaciones del candidato con caché
  getCandidateApplicationsWithCache(): Observable<ApplicationSummaryDTO[]> {
    // Si ya tenemos el caché cargado, devolverlo inmediatamente
    if (this.applicationsCacheLoaded && this.candidateApplicationsCache) {
      return new Observable(observer => {
        observer.next(this.candidateApplicationsCache!);
        observer.complete();
      });
    }

    // Si no está cargado, cargar desde el servidor y guardar en caché
    return this.getCandidateApplications().pipe(
      tap(applications => {
        this.candidateApplicationsCache = applications;
        this.applicationsCacheLoaded = true;
        // 🔍 TEMPORAL: Para que veas el caché en console
        console.log('✅ CACHÉ CREADO:', this.candidateApplicationsCache);
        console.log('📊 Cantidad de aplicaciones:', applications.length);
      })
    );
  }

  // Método para verificar si un candidato está inscrito en una oferta (usando caché)
  isAppliedToOffer(offerId: number): boolean {
    if (!this.applicationsCacheLoaded || !this.candidateApplicationsCache) {
      console.log('⚠️ Caché no disponible para oferta:', offerId);
      return false; // Si no está cargado el caché, asumir que no está inscrito
    }

    const isApplied = this.candidateApplicationsCache.some(
      application => application.offer.id === offerId
    );
    
    console.log(`🔍 Verificando oferta ${offerId}: ${isApplied ? '✅ YA INSCRITO' : '❌ NO INSCRITO'}`);
    return isApplied;
  }

  // Método para agregar una nueva aplicación al caché
  addApplicationToCache(application: ApplicationSummaryDTO): void {
    if (this.candidateApplicationsCache) {
      this.candidateApplicationsCache.push(application);
    }
  }

  // Método para limpiar el caché (útil en logout)
  clearApplicationsCache(): void {
    this.candidateApplicationsCache = null;
    this.applicationsCacheLoaded = false;
  }

  // Método para cargar el caché de aplicaciones si es candidato
  loadApplicationsCacheIfCandidate(): Observable<ApplicationSummaryDTO[]> | null {
    if (!this.isLoggedAsCandidate()) {
      return null;
    }

    if (this.applicationsCacheLoaded) {
      console.log('💾 Caché de aplicaciones ya disponible, retornando desde memoria');
      return new Observable(observer => {
        observer.next(this.candidateApplicationsCache || []);
        observer.complete();
      });
    }

    console.log('📡 Cargando caché de aplicaciones desde servidor...');
    return this.getCandidateApplicationsWithCache();
  }

  // Método para obtener datos del candidato con tech labels
  getCandidateData(): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>('http://localhost:30030/candidate/get', {}, { headers }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
}
