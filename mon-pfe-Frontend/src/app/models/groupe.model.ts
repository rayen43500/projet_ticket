import { Utilisateur } from './utilisateur.model';
import { SousGroupe } from './sous-groupe.model';

export interface Groupe {
  id?: number;
  nom: string;
  intervenants?: Utilisateur[];
  sousGroupes?: SousGroupe[];
}
