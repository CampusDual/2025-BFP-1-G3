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
    location!: string;
    salary!: number;
    requirements!: string;
    benefits!: string;
    startDate!: string;
    endDate!: string;
    active!: boolean;
    techLabels?: TechLabel[];
}
