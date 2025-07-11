import { TechLabel } from './tech-label';

export class Offer {
    id!: number;
    title!: string;
    description!: string;
    offerDescription!: string;
    companyId!: number;
    companyName!: string;
    company?: {
        id: number;
        name: string;
    };
    
    // Nuevos campos añadidos
    location!: string;
    publishingDate!: string;
    type!: string; // 'remote', 'hybrid', 'onsite'
    requirements!: string;
    desirable!: string;
    benefits!: string;
    
    // Campos existentes que mantienen compatibilidad
    startDate!: string;
    endDate!: string;
    active!: boolean;
    techLabels?: TechLabel[];
}
