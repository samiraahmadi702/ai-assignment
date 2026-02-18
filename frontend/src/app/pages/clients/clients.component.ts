import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Clients</h1>
      <button class="btn btn-primary" (click)="showForm = !showForm; resetForm()">
        {{ showForm ? 'Cancel' : '+ Add Client' }}
      </button>
    </div>

    <div class="card form-card" *ngIf="showForm">
      <h3>{{ editingClient ? 'Edit Client' : 'New Client' }}</h3>
      <form (ngSubmit)="saveClient()">
        <div class="form-row">
          <div class="form-group">
            <label>Name *</label>
            <input type="text" [(ngModel)]="form.name" name="name" required placeholder="Client name">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="form.email" name="email" placeholder="email&#64;example.com">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Phone</label>
            <input type="text" [(ngModel)]="form.phone" name="phone" placeholder="Phone number">
          </div>
          <div class="form-group">
            <label>Address</label>
            <input type="text" [(ngModel)]="form.address" name="address" placeholder="Address">
          </div>
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="!form.name">
          {{ editingClient ? 'Update' : 'Save' }} Client
        </button>
      </form>
    </div>

    <div class="table-wrapper">
      <table class="table" *ngIf="clients.length > 0; else empty">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let client of clients">
            <td><strong>{{ client.name }}</strong></td>
            <td>{{ client.email || '-' }}</td>
            <td>{{ client.phone || '-' }}</td>
            <td>{{ client.address || '-' }}</td>
            <td class="actions">
              <button class="btn-sm btn-edit" (click)="editClient(client)">Edit</button>
              <button class="btn-sm btn-delete" (click)="deleteClient(client)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <ng-template #empty>
        <div class="empty-state">
          <p>No clients yet. Add your first client to get started.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-header h1 { margin: 0; font-size: 1.75rem; }
    .form-card {
      margin-bottom: 1.5rem;
      padding: 1.5rem;
    }
    .form-card h3 { margin-top: 0; margin-bottom: 1rem; }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .table-wrapper { overflow-x: auto; }
    .table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .table th {
      background: #f8f9fa;
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.8rem;
      text-transform: uppercase;
      color: #6c757d;
      border-bottom: 2px solid #e9ecef;
    }
    .table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f0f0f0;
    }
    .table tbody tr:hover { background: #f8f9ff; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-sm {
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      border: 1px solid #ddd;
      background: #fff;
    }
    .btn-edit { color: #f59e0b; border-color: #f59e0b; }
    .btn-edit:hover { background: #f59e0b; color: #fff; }
    .btn-delete { color: #ef4444; border-color: #ef4444; }
    .btn-delete:hover { background: #ef4444; color: #fff; }
    .empty-state {
      text-align: center;
      padding: 3rem;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .empty-state p { color: #6c757d; }
  `]
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  showForm = false;
  editingClient: Client | null = null;
  form: Client = { name: '', email: '', phone: '', address: '' };

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getAll().subscribe(data => this.clients = data);
  }

  resetForm() {
    this.editingClient = null;
    this.form = { name: '', email: '', phone: '', address: '' };
  }

  editClient(client: Client) {
    this.editingClient = client;
    this.form = { ...client };
    this.showForm = true;
  }

  saveClient() {
    if (!this.form.name) return;

    const obs = this.editingClient
      ? this.clientService.update(this.editingClient.id!, this.form)
      : this.clientService.create(this.form);

    obs.subscribe(() => {
      this.loadClients();
      this.showForm = false;
      this.resetForm();
    });
  }

  deleteClient(client: Client) {
    if (confirm(`Delete client "${client.name}"?`)) {
      this.clientService.delete(client.id!).subscribe(() => this.loadClients());
    }
  }
}
