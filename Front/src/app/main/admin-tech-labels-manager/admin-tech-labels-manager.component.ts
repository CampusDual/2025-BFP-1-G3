import { Component, OnInit } from '@angular/core';
import { TechLabel } from '../../model/tech-label';
import { LoginService } from '../../services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-tech-labels-manager',
  templateUrl: './admin-tech-labels-manager.component.html',
  styleUrls: ['./admin-tech-labels-manager.component.css']
})
export class AdminTechLabelsManagerComponent implements OnInit {
  allLabels: TechLabel[] = [];
  displayedLabels: TechLabel[] = [];
  loading: boolean = false;
  errorMessage: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 15;
  totalPages: number = 1;

  // For create and edit
  newLabelName: string = '';
  editLabelId: number | null = null;
  editLabelName: string = '';

  constructor(private loginService: LoginService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadLabels();
  }

  loadLabels(): void {
    this.loading = true;
    this.loginService.getAllTechLabels().subscribe({
      next: (labels) => {
        this.allLabels = labels;
        this.totalPages = Math.ceil(this.allLabels.length / this.pageSize);
        
        // Si la página actual es mayor que el total de páginas, ir a la última página válida
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        }
        
        // Si no hay etiquetas, resetear a la página 1
        if (this.allLabels.length === 0) {
          this.currentPage = 1;
          this.totalPages = 1;
        }
        
        this.setPage(this.currentPage);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading labels:', error);
        this.errorMessage = 'Error al cargar las etiquetas';
        this.loading = false;
      }
    });
  }

  setPage(page: number): void {
    // Validar que la página esté en el rango válido
    if (page < 1) {
      page = 1;
    }
    if (page > this.totalPages && this.totalPages > 0) {
      page = this.totalPages;
    }
    
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedLabels = this.allLabels.slice(startIndex, endIndex);
  }

  previousPage(): void {
    this.setPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.setPage(this.currentPage + 1);
  }

  createLabel(): void {
    const trimmedName = this.newLabelName.trim();
    if (!trimmedName) return;

    const normalizedNewName = trimmedName.toLowerCase();
    const exists = this.allLabels.some(label => label.name.trim().toLowerCase() === normalizedNewName);
    if (exists) {
      this.snackBar.open('La etiqueta ya existe.', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-failed'],
      });
      return;
    }

    this.loading = true;
    this.loginService.insertTechLabel({ name: trimmedName } as TechLabel).subscribe({
      next: () => {
         this.snackBar.open('Etiqueta creada con éxito.', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success'],
          });
        this.newLabelName = '';
        this.loadLabelsAndGoToLastPage();
      },
      error: (error) => {
         this.snackBar.open('Error al crear la etiqueta. Ya existe.', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-failed'],
          });
        console.error('Error creating label:', error);
        // this.errorMessage = 'Error creating label';
        this.loading = false;
      }
    });
  }

  startEditLabel(label: TechLabel): void {
    this.editLabelId = label.id;
    this.editLabelName = label.name;
  }

  saveEditLabel(): void {
    if (this.editLabelId === null) return;
    const trimmedName = this.editLabelName.trim();
    if (!trimmedName) return;

    const normalizedNewName = trimmedName.toLowerCase();
    const exists = this.allLabels.some(label => label.name.trim().toLowerCase() === normalizedNewName && label.id !== this.editLabelId);
    if (exists) {
      this.snackBar.open('La etiqueta ya existe.', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-failed'],
      });
      return;
    }

    this.loading = true;
    this.loginService.updateTechLabel({ id: this.editLabelId, name: trimmedName } as TechLabel).subscribe({
      next: () => {
        this.editLabelId = null;
        this.editLabelName = '';
        this.snackBar.open('Etiqueta actualizada con éxito.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-success'],
        });
        this.loadLabels();
      },
      error: (error) => {
        this.snackBar.open('Error al actualizar la etiqueta.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-failed'],
        });
        this.loading = false;
      }
    });
  }

  cancelEditLabel(): void {
    this.editLabelId = null;
    this.editLabelName = '';
  }

  deleteLabel(label: TechLabel): void {
    // Evitar múltiples clics mientras se procesa la eliminación
    if (this.loading) return;
    
    if (!confirm(`¿Estás seguro de que deseas eliminar la etiqueta "${label.name}"?`)) return;

    this.loading = true;
    this.loginService.deleteTechLabel(label).subscribe({
      next: () => {
        // Eliminar de la lista local inmediatamente para actualizar la vista
        this.allLabels = this.allLabels.filter(l => l.id !== label.id);
        
        // Recalcular paginación
        this.totalPages = Math.ceil(this.allLabels.length / this.pageSize);
        
        // Si la página actual está vacía después de la eliminación, ir a la página anterior
        if (this.displayedLabels.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        
        // Si no hay más páginas, resetear a la página 1
        if (this.totalPages === 0) {
          this.currentPage = 1;
          this.totalPages = 1;
        }
        
        // Si la página actual es mayor que el total de páginas, ir a la última página válida
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        }
        
        // Actualizar la vista
        this.setPage(this.currentPage);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deleting label:', error);
        this.errorMessage = 'Error al borrar la etiqueta';
        this.loading = false;
      }
    });
  }

  loadLabelsAndGoToLastPage(): void {
    this.loading = true;
    this.loginService.getAllTechLabels().subscribe({
      next: (labels) => {
        this.allLabels = labels;
        this.totalPages = Math.ceil(this.allLabels.length / this.pageSize);
        
        // Si no hay etiquetas, resetear a la página 1
        if (this.allLabels.length === 0) {
          this.currentPage = 1;
          this.totalPages = 1;
        } else {
          // Ir a la última página donde está la nueva etiqueta
          this.currentPage = this.totalPages;
        }
        
        this.setPage(this.currentPage);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading labels:', error);
        this.errorMessage = 'Error al cargar las etiquetas';
        this.loading = false;
      }
    });
  }
}
