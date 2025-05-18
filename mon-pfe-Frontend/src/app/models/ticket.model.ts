export interface Ticket {
  id?: number;
  sujet: string;
  description: string;
  dateCreation?: Date;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TRAITE' | 'CLOTURE';
  type: 'INCIDENT' | 'DEMANDE' | 'ASSISTANCE' | 'AUTRE';
  urgence: 'FAIBLE' | 'MOYENNE' | 'HAUTE';
  createur?: {
    id: number;
    nom: string;
    email: string;
  };
  intervenant?: {
    id: number;
    nom: string;
    email: string;
  };
  groupe: {
    id: number;
    nom: string;
  };
  sousGroupe?: {
    id: number;
    nom: string;
  };
  commentaires?: Array<{
    id: number;
    contenu: string;
    dateCreation: Date;
    auteur: {
      id: number;
      nom: string;
    }
  }>;
  piecesJointes?: Array<{
    id: number;
    nomFichier: string;
    dateUpload: Date;
    uploader: {
      id: number;
      nom: string;
    }
  }>;
} 