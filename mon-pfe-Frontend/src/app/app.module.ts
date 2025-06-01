import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

// Register Chart.js plugins
import { Chart } from 'chart.js';
import { default as ChartDataLabels } from 'chartjs-plugin-datalabels';
import { registerables } from 'chart.js';

// Register required components
Chart.register(...registerables, ChartDataLabels);

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SearchTicketsComponent } from './search-tickets/search-tickets.component';
import { ContactComponent } from './contact/contact.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { UsersComponent } from './admin/users/users.component';
import { GroupsComponent } from './admin/groups/groups.component';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { CreateTicketComponent } from './user/create-ticket/create-ticket.component';
import { MyTicketsComponent } from './user/my-tickets/my-tickets.component';
import { ViewTicketComponent } from './user/view-ticket/view-ticket.component';
import { UpdateTicketComponent } from './user/update-ticket/update-ticket.component';
import { IntervenantDashboardComponent } from './intervenant/intervenant-dashboard/intervenant-dashboard.component';
import { TicketsToHandleComponent } from './intervenant/tickets-to-handle/tickets-to-handle.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LoaderComponent } from './loader/loader.component';
import { SubgroupsComponent } from './admin/subgroups/subgroups.component';

// Services
import { AuthService } from './services/auth.service';
import { TicketService } from './services/ticket.service';
import { StatisticsService } from './services/statistics.service';
import { EmailService } from './services/email.service';
import { TokenInterceptor } from './services/token.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    NavbarComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    SearchTicketsComponent,
    ContactComponent,
    AdminDashboardComponent,
    UsersComponent,
    GroupsComponent,
    SubgroupsComponent,
    UserDashboardComponent,
    CreateTicketComponent,
    MyTicketsComponent,
    ViewTicketComponent,
    UpdateTicketComponent,
    IntervenantDashboardComponent,
    TicketsToHandleComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgChartsModule
  ],
  providers: [
    AuthService,
    TicketService,
    StatisticsService,
    EmailService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }