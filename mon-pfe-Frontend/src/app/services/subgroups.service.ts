import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SousGroupe } from '../models/sous-groupe.model';

@Injectable({
  providedIn: 'root'
})
export class SubgroupsService {
  private baseUrl = 'http://localhost:8080/api/sous-groupes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<SousGroupe[]> {
    return this.http.get<SousGroupe[]>(this.baseUrl);
  }

  getByGroup(groupId: number): Observable<SousGroupe[]> {
    return this.http.get<SousGroupe[]>(`${this.baseUrl}/groupe/${groupId}`);
  }

  getById(id: number): Observable<SousGroupe> {
    return this.http.get<SousGroupe>(`${this.baseUrl}/${id}`);
  }

  create(subgroup: SousGroupe): Observable<SousGroupe> {
    return this.http.post<SousGroupe>(this.baseUrl, subgroup);
  }

  update(id: number, subgroup: SousGroupe): Observable<SousGroupe> {
    return this.http.put<SousGroupe>(`${this.baseUrl}/${id}`, subgroup);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
