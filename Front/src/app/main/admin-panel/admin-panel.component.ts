import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'email' ]; // ,'actions'
  dataSource!: MatTableDataSource<any>;
  isLoading = false;
  errorMessage = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const token = sessionStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No estás autenticado';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    // Llamada al endpoint para obtener todas las empresas
    this.http.get<any[]>('http://localhost:30030/company/getAll', { headers })
      .subscribe({
        next: (companies) => {
          this.dataSource = new MatTableDataSource(companies);
          
          // Asegurar que la paginación y ordenación se aplican después de tener los datos
          setTimeout(() => {
            if (this.paginator && this.sort) {
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            }
          });
          
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar empresas:', error);
          this.errorMessage = 'Error al cargar las empresas. Por favor, inténtalo de nuevo.';
          this.isLoading = false;
          
          this.showSnackBar('Error al cargar empresas', 'error');
        }
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editCompany(company: any): void {
    console.log('Editar empresa:', company);
  }

  deleteCompany(company: any): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la empresa ${company.name}?`)) {
      console.log('Eliminar empresa:', company);
    }
  }

  showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-failed']
    });
  }
}