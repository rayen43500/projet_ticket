import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { StatisticsDashboardComponent } from './statistics-dashboard.component';

@NgModule({
  declarations: [
    StatisticsDashboardComponent
  ],
  imports: [
    CommonModule,
    NgChartsModule,
    RouterModule.forChild([
      { path: 'dashboard', component: StatisticsDashboardComponent }
    ])
  ],
  providers: [
    DecimalPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StatisticsModule { } 