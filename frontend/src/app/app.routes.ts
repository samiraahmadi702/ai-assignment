import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'invoices/new', loadComponent: () => import('./pages/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent) },
  { path: 'invoices/:id/edit', loadComponent: () => import('./pages/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent) },
  { path: 'invoices/:id/preview', loadComponent: () => import('./pages/invoice-preview/invoice-preview.component').then(m => m.InvoicePreviewComponent) },
  { path: 'clients', loadComponent: () => import('./pages/clients/clients.component').then(m => m.ClientsComponent) },
  { path: '**', redirectTo: '' }
];
