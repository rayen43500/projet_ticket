import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface StatData {
  total: number;
  percentChange: number;
}

interface ActivityItem {
  icon: string;
  title: string;
  subtitle: string;
  time: Date;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  today: Date = new Date();
  ticketChartPeriod: string = 'month';
  
  // Statistics data
  userStats: StatData = { total: 0, percentChange: 0 };
  groupStats: StatData = { total: 0, percentChange: 0 };
  subgroupStats: StatData = { total: 0, percentChange: 0 };
  ticketStats: StatData = { total: 0, percentChange: 0 };
  
  // Chart instances
  ticketStatusChart: any;
  userRolesChart: any;
  ticketsPerGroupChart: any;
  
  // Recent activity
  recentActivity: ActivityItem[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadStatistics();
    this.loadRecentActivity();
    
    // Mock data for now - would be replaced with real API calls
    this.userStats = { total: 48, percentChange: 15 };
    this.groupStats = { total: 12, percentChange: 0 };
    this.subgroupStats = { total: 34, percentChange: 22 };
    this.ticketStats = { total: 156, percentChange: 8 };
    
    this.recentActivity = [
      { 
        icon: 'person_add', 
        title: 'Nouvel utilisateur créé', 
        subtitle: 'Ahmed a créé le compte de Mehdi', 
        time: new Date(Date.now() - 1000 * 60 * 25) 
      },
      { 
        icon: 'group_add', 
        title: 'Nouveau groupe créé', 
        subtitle: 'Groupe "Support Technique" créé', 
        time: new Date(Date.now() - 1000 * 60 * 40) 
      },
      { 
        icon: 'folder', 
        title: 'Nouveau sous-groupe créé', 
        subtitle: 'Sous-groupe "Réseau" ajouté au groupe "IT"', 
        time: new Date(Date.now() - 1000 * 60 * 120) 
      },
      { 
        icon: 'edit', 
        title: 'Utilisateur modifié', 
        subtitle: 'Rôle de Karim changé à Intervenant', 
        time: new Date(Date.now() - 1000 * 60 * 180) 
      },
      { 
        icon: 'delete', 
        title: 'Groupe supprimé', 
        subtitle: 'Groupe "Test" a été supprimé', 
        time: new Date(Date.now() - 1000 * 60 * 240) 
      }
    ];
  }
  
  ngAfterViewInit(): void {
    this.initCharts();
  }
  
  loadStatistics(): void {
    // Would be replaced with actual HTTP calls to backend
    // Example:
    // this.http.get<any>(`${environment.apiUrl}/admin/stats/users`).subscribe(
    //   data => this.userStats = data
    // );
  }
  
  loadRecentActivity(): void {
    // Would be replaced with actual HTTP call to backend
    // Example:
    // this.http.get<ActivityItem[]>(`${environment.apiUrl}/admin/activity`).subscribe(
    //   data => this.recentActivity = data
    // );
  }
  
  initCharts(): void {
    this.initTicketStatusChart();
    this.initUserRolesChart();
    this.initTicketsPerGroupChart();
  }
  
  initTicketStatusChart(): void {
    const ctx = document.getElementById('ticketStatusChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    this.ticketStatusChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [
          {
            label: 'En attente',
            data: [12, 19, 15, 8, 10, 14, 18, 21, 25, 19, 16, 22],
            borderColor: '#ed8936',
            backgroundColor: 'rgba(237, 137, 54, 0.1)',
            tension: 0.4,
          },
          {
            label: 'En cours',
            data: [8, 12, 10, 5, 7, 9, 11, 14, 18, 12, 9, 15],
            borderColor: '#4299e1',
            backgroundColor: 'rgba(66, 153, 225, 0.1)',
            tension: 0.4,
          },
          {
            label: 'Résolus',
            data: [5, 15, 20, 25, 30, 25, 20, 18, 15, 22, 30, 35],
            borderColor: '#48bb78',
            backgroundColor: 'rgba(72, 187, 120, 0.1)',
            tension: 0.4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  initUserRolesChart(): void {
    const ctx = document.getElementById('userRolesChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    this.userRolesChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Administrateurs', 'Intervenants', 'Utilisateurs'],
        datasets: [{
          data: [3, 15, 30],
          backgroundColor: [
            '#805ad5',
            '#4299e1',
            '#48bb78'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          }
        },
        cutout: '70%'
      }
    });
  }
  
  initTicketsPerGroupChart(): void {
    const ctx = document.getElementById('ticketsPerGroupChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    this.ticketsPerGroupChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['IT', 'Support', 'Réseau', 'Développement', 'Maintenance'],
        datasets: [{
          label: 'Tickets par groupe',
          data: [42, 35, 28, 22, 18],
          backgroundColor: [
            'rgba(66, 153, 225, 0.7)',
            'rgba(72, 187, 120, 0.7)',
            'rgba(237, 137, 54, 0.7)',
            'rgba(128, 90, 213, 0.7)',
            'rgba(237, 100, 166, 0.7)'
          ],
          borderWidth: 0,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  downloadReport(): void {
    // Example implementation
    alert('Le rapport sera téléchargé au format PDF');
    
    // Actual implementation would call an API endpoint or generate a PDF
    // this.http.get(`${environment.apiUrl}/admin/reports/download`, { responseType: 'blob' })
    //   .subscribe(blob => {
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = 'rapport-admin.pdf';
    //     document.body.appendChild(a);
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    //   });
  }

  // Logout method
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
