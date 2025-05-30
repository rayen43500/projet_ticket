export interface Ticket {
  id?: number;
  sujet: string;
  description: string;
  dateCreation?: string | Date;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TRAITE' | 'CLOTURE';
  type: 'INCIDENT' | 'DEMANDE' | 'ASSISTANCE' | 'AUTRE';
  urgence: 'FAIBLE' | 'MOYENNE' | 'HAUTE';
  
  // API direct fields
  createurId?: number;
  createurNom?: string;
  intervenantId?: number;
  intervenantNom?: string;
  groupeId?: number;
  groupeNom?: string;
  sousGroupeId?: number | null;
  sousGroupeNom?: string | null;
  
  // Object representations (for compatibility with existing code)
  createur?: {
    id: number;
    nom: string;
    email?: string;
  };
  intervenant?: {
    id: number;
    nom: string;
    email?: string;
  };
  groupe?: {
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
    dateCreation: string | Date;
    auteurNom: string;
    auteurId: number;
    ticketId?: number;
  }>;
  
  piecesJointes?: Array<{
    id: number;
    nomFichier: string;
    dateUpload?: string | Date;
    uploader?: {
      id: number;
      nom: string;
    }
  }>;
} 