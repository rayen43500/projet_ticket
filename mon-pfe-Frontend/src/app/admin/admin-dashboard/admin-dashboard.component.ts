import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface StatData {
  total: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  today: Date = new Date();
  
  // Statistics data
  userStats: StatData = { total: 0 };
  groupStats: StatData = { total: 0 };
  subgroupStats: StatData = { total: 0 };
  ticketStats: StatData = { total: 0 };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadStatistics();
    
    // Mock data for now - would be replaced with real API calls
    this.userStats = { total: 48 };
    this.groupStats = { total: 12 };
    this.subgroupStats = { total: 34 };
    this.ticketStats = { total: 156 };
  }
  
  loadStatistics(): void {
    // Would be replaced with actual HTTP calls to backend
    // Example:
    // this.http.get<any>(`${environment.apiUrl}/admin/stats/users`).subscribe(
    //   data => this.userStats = data
    // );
  }
  
  downloadReport(): void {
    // Simulate download report functionality
    alert('Le rapport a été téléchargé avec succès.');
    
    // Actual implementation would make an API call to generate and download a report
    // Example:
    // this.http.get(`${environment.apiUrl}/admin/reports/download`, { responseType: 'blob' })
    //   .subscribe(
    //     (response: Blob) => {
    //       const url = window.URL.createObjectURL(response);
    //       const a = document.createElement('a');
    //       a.href = url;
    //       a.download = `admin-report-${new Date().toISOString().split('T')[0]}.pdf`;
    //       document.body.appendChild(a);
    //       a.click();
    //       window.URL.revokeObjectURL(url);
    //     },
    //     error => {
    //       console.error('Error downloading report:', error);
    //       alert('Une erreur est survenue lors du téléchargement du rapport.');
    //     }
    //   );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
