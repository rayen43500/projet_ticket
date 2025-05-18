import { Component, OnInit, ViewChild } from '@angular/core';
import { StatisticsService } from '../services/statistics.service';
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-statistics-dashboard',
  templateUrl: './statistics-dashboard.component.html',
  styleUrls: ['./statistics-dashboard.component.css']
})
export class StatisticsDashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  
  loading = false;
  error = '';
  
  // Global statistics
  globalStats: any = {};
  
  // Chart configurations
  public projectBarChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  
  public urgencyPieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };
  
  public projectPercentagePieChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };
  
  public statusByProjectChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  
  // Chart options
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: {
        min: 0
      }
    },
    plugins: {
      legend: {
        display: true,
      }
    }
  };
  
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };
  
  // Chart types
  public barChartType: ChartType = 'bar';
  public pieChartType: ChartType = 'pie';
  public doughnutChartType: ChartType = 'doughnut';
  
  // Recurring interventions
  recurringInterventionsData: any[] = [];
  
  constructor(private statisticsService: StatisticsService) { }

  ngOnInit(): void {
    this.loadDashboardStatistics();
  }
  
  loadDashboardStatistics(): void {
    this.loading = true;
    this.error = '';
    
    this.statisticsService.getDashboardStats().subscribe({
      next: (data) => {
        this.processStatisticsData(data);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des statistiques';
        this.loading = false;
        console.error('Erreur lors du chargement des statistiques:', err);
      }
    });
  }
  
  processStatisticsData(data: any): void {
    // Global statistics
    this.globalStats = data.globalStats || {};
    
    // Tickets by project
    if (data.ticketsByProjectName) {
      this.projectBarChartData = {
        labels: Object.keys(data.ticketsByProjectName),
        datasets: [{
          data: Object.values(data.ticketsByProjectName),
          label: 'Nombre de tickets par projet',
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        }]
      };
    }
    
    // Tickets by urgency
    if (data.ticketsByUrgency) {
      this.urgencyPieChartData = {
        labels: Object.keys(data.ticketsByUrgency),
        datasets: [{
          data: Object.values(data.ticketsByUrgency),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      };
    }
    
    // Project percentage
    if (data.ticketsPercentageByProject) {
      this.projectPercentagePieChartData = {
        labels: Object.keys(data.ticketsPercentageByProject),
        datasets: [{
          data: Object.values(data.ticketsPercentageByProject),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
        }]
      };
    }
    
    // Status by project
    if (data.statusPercentageByProject) {
      const projects = Object.keys(data.statusPercentageByProject);
      const statusList = ['En attente', 'En cours', 'Traité', 'Clôturé'];
      
      this.statusByProjectChartData = {
        labels: projects,
        datasets: statusList.map((status, index) => {
          return {
            data: projects.map(project => data.statusPercentageByProject[project][status] || 0),
            label: status,
            backgroundColor: [`rgba(255, 99, 132, 0.7)`, `rgba(54, 162, 235, 0.7)`, 
                             `rgba(255, 206, 86, 0.7)`, `rgba(75, 192, 192, 0.7)`][index]
          };
        })
      };
    }
    
    // Recurring interventions
    this.recurringInterventionsData = data.recurringInterventions || [];
  }
} 