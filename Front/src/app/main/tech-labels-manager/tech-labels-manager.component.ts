import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TechLabel } from '../../model/tech-label';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-tech-labels-manager',
  templateUrl: './tech-labels-manager.component.html',
  styleUrls: ['./tech-labels-manager.component.css']
})
export class TechLabelsManagerComponent implements OnInit {
  @Input() selectedLabels: TechLabel[] = [];
  @Input() maxLabels: number = 5;
  @Input() readonly: boolean = false;
  @Input() offerId?: number;
  @Output() labelsChanged = new EventEmitter<TechLabel[]>();

  availableLabels: TechLabel[] = [];
  loading: boolean = false;

  constructor(
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.loadAvailableLabels();
  }

  loadAvailableLabels(): void {
    this.loading = true;
    this.loginService.getAllTechLabels().subscribe({
      next: (labels) => {
        this.availableLabels = labels;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando etiquetas:', error);
        alert('Error al cargar las etiquetas disponibles');
        this.loading = false;
      }
    });
  }

  isLabelSelected(label: TechLabel): boolean {
    return this.selectedLabels.some(selected => selected.id === label.id);
  }

  toggleLabel(label: TechLabel): void {
    if (this.readonly) return;

    const isSelected = this.isLabelSelected(label);
    
    if (isSelected) {
      // Remover etiqueta
      this.selectedLabels = this.selectedLabels.filter(selected => selected.id !== label.id);
    } else {
      // Agregar etiqueta (verificar límite)
      if (this.selectedLabels.length >= this.maxLabels) {
        alert(`Máximo ${this.maxLabels} etiquetas permitidas`);
        return;
      }
      this.selectedLabels = [...this.selectedLabels, label];
    }

    this.labelsChanged.emit(this.selectedLabels);
  }

  removeLabel(label: TechLabel): void {
    if (this.readonly) return;
    
    this.selectedLabels = this.selectedLabels.filter(selected => selected.id !== label.id);
    this.labelsChanged.emit(this.selectedLabels);
  }

  saveLabels(): void {
    if (!this.offerId || this.readonly) return;

    const labelIds = this.selectedLabels.map(label => label.id);
    this.loading = true;

    this.loginService.updateOfferLabels(this.offerId, labelIds).subscribe({
      next: () => {
        alert('Etiquetas actualizadas exitosamente');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error actualizando etiquetas:', error);
        alert('Error al actualizar las etiquetas');
        this.loading = false;
      }
    });
  }
}
