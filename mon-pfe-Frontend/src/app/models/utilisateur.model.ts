export interface Utilisateur {
  id?: number;
  nom: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'INTERVENANT' | 'UTILISATEUR';
  groupe?: {
    id: number;
    nom?: string;
  };
}