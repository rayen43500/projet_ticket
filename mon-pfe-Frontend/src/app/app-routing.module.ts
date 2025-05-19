import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { SubgroupsComponent } from './admin/subgroups/subgroups.component';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { CreateTicketComponent } from './user/create-ticket/create-ticket.component';
import { MyTicketsComponent } from './user/my-tickets/my-tickets.component';
import { ViewTicketComponent } from './user/view-ticket/view-ticket.component';
import { UpdateTicketComponent } from './user/update-ticket/update-ticket.component';
import { IntervenantDashboardComponent } from './intervenant/intervenant-dashboard/intervenant-dashboard.component';
import { TicketsToHandleComponent } from './intervenant/tickets-to-handle/tickets-to-handle.component';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path:'home', component: HomeComponent },
  { path:'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: 'sidebar', component: SidebarComponent },
  { path: 'search-tickets', component: SearchTicketsComponent },
  { path: 'contact', component: ContactComponent },
  
  // Routes Admin
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'groups', component: GroupsComponent },
      { path: 'subgroups', component: SubgroupsComponent }
    ]
  },
  
  // Routes Utilisateur
  {
    path: 'user',
    canActivate: [RoleGuard],
    data: { role: 'UTILISATEUR' },
    children: [
      { path: 'dashboard', component: UserDashboardComponent }, 
      { path: 'create-ticket', component: CreateTicketComponent },
      { path: 'my-tickets', component: MyTicketsComponent },
      { path: 'ticket/:id', component: ViewTicketComponent },
      { path: 'update-ticket/:id', component: UpdateTicketComponent }
    ]
  },
  
  // Routes Intervenant
  {
    path: 'intervenant',
    canActivate: [RoleGuard],
    data: { role: 'INTERVENANT' },
    children: [
      { path: 'dashboard', component: IntervenantDashboardComponent },
      { path: 'tickets-to-handle', component: TicketsToHandleComponent },
      { path: 'ticket/:id', component: ViewTicketComponent }
    ]
  },
  
  {
    path: 'statistics',
    loadChildren: () => import('./statistics/statistics.module').then(m => m.StatisticsModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
