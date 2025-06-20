import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(private loginService: LoginService, private router: Router) {}

  isLoggedIn(): boolean {
    return this.loginService.isAuthenticated();
  }

  isLoggedAsCompany(): boolean {
    return this.loginService.isLoggedAsCompany();
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/main']);
  }
}