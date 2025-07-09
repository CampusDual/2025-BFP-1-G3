import { Candidate } from './candidate';

export interface Application {
  id: number;
  id_candidate: number;
  id_offer: number;
  candidate?: Candidate;
  state: number;
}

export enum ApplicationState {
  PENDING = 0,
  ACCEPTED = 1,
  REJECTED = 2
}

export class ApplicationStateHelper {
  static getStateDescription(state: number): string {
    switch (state) {
      case ApplicationState.PENDING:
        return 'Pendiente';
      case ApplicationState.ACCEPTED:
        return 'Aceptado';
      case ApplicationState.REJECTED:
        return 'Rechazado';
      default:
        return 'Desconocido';
    }
  }

   static getStateOptions() {
    return [
      { value: ApplicationState.ACCEPTED, label: 'Aceptar' },
      { value: ApplicationState.REJECTED, label: 'Descartar' }
    ];
  }
}