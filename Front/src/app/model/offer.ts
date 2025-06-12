export class Offer{
    id!: number;
    title!: string;
    offerDescription!: string;
    description!: string; // Para compatibilidad con el código existente
    companyId!: number;
    companyName!: string; // Nuevo campo para el nombre de la compañía
}
