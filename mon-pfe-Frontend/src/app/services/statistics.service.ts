import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private baseUrl = 'http://localhost:8080/api/statistics';

  constructor(private http: HttpClient) { }

  // Obtenir les statistiques basiques des tickets
  getTicketStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tickets`);
  }
  
  // Obtenir les statistiques complètes pour le tableau de bord
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard`);
  }
  
  // Helper methods for chart data formatting
  formatDataForPieChart(data: Map<string, number>): any[] {
    if (!data) return [];
    
    return Object.entries(data).map(([label, value]) => {
      return { name: label, value: value };
    });
  }
  
  formatDataForBarChart(data: Map<string, number>): any[] {
    if (!data) return [];
    
    return Object.entries(data).map(([name, value]) => {
      return { name, value };
    });
  }
  
  formatStatusPercentageData(data: any): any[] {
    if (!data) return [];
    
    const result: any[] = [];
    
    // Reconfigure for bar-vertical-2d format which expects:
    // [{ name: 'Project1', series: [{ name: 'Status1', value: value1 }, ...] }, ...]
    Object.entries(data).forEach(([projectName, statusMap]: [string, any]) => {
      Object.entries(statusMap).forEach(([status, percentage]: [string, any]) => {
        result.push({
          name: status,
          series: projectName,
          value: percentage
        });
      });
    });
    
    return result;
  }
} 