import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-header">
      <h1>Invoices</h1>
      <a routerLink="/invoices/new" class="btn btn-primary">+ New Invoice</a>
    </div>

    <div class="filters">
      <button class="filter-btn" [class.active]="statusFilter === ''" (click)="filterByStatus('')">All</button>
      <button class="filter-btn" [class.active]="statusFilter === 'draft'" (click)="filterByStatus('draft')">Draft</button>
      <button class="filter-btn" [class.active]="statusFilter === 'sent'" (click)="filterByStatus('sent')">Sent</button>
      <button class="filter-btn" [class.active]="statusFilter === 'paid'" (click)="filterByStatus('paid')">Paid</button>
    </div>

    <div class="table-wrapper">
      <table class="table" *ngIf="invoices.length > 0; else empty">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Client</th>
            <th>Date</th>
            <th>Due Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let inv of invoices">
            <td><strong>{{ inv.invoice_number }}</strong></td>
            <td>{{ inv.client_name || 'N/A' }}</td>
            <td>{{ inv.date }}</td>
            <td>{{ inv.due_date }}</td>
            <td>{{ inv.total | currency }}</td>
            <td>
              <span class="badge" [ngClass]="'badge-' + inv.status">{{ inv.status }}</span>
            </td>
            <td class="actions">
              <a [routerLink]="['/invoices', inv.id, 'preview']" class="btn-sm btn-view">View</a>
              <a [routerLink]="['/invoices', inv.id, 'edit']" class="btn-sm btn-edit">Edit</a>
              <button class="btn-sm btn-delete" (click)="deleteInvoice(inv)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <ng-template #empty>
        <div class="empty-state">
          <p>No invoices found.</p>
          <a routerLink="/invoices/new" class="btn btn-primary">Create your first invoice</a>
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
    .filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .filter-btn {
      padding: 0.4rem 1rem;
      border: 1px solid #ddd;
      background: #fff;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    .filter-btn:hover { border-color: #4361ee; color: #4361ee; }
    .filter-btn.active { background: #4361ee; color: #fff; border-color: #4361ee; }
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
      vertical-align: middle;
    }
    .table tbody tr:hover { background: #f8f9ff; }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-draft { background: #e9ecef; color: #6c757d; }
    .badge-sent { background: #dbeafe; color: #2563eb; }
    .badge-paid { background: #d1fae5; color: #059669; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-sm {
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.8rem;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid #ddd;
      background: #fff;
    }
    .btn-view { color: #4361ee; border-color: #4361ee; }
    .btn-view:hover { background: #4361ee; color: #fff; }
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
    .empty-state p { color: #6c757d; margin-bottom: 1rem; }
  `]
})
export class DashboardComponent implements OnInit {
  invoices: Invoice[] = [];
  statusFilter = '';

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.invoiceService.getAll(this.statusFilter || undefined).subscribe(data => {
      this.invoices = data;
    });
  }

  filterByStatus(status: string) {
    this.statusFilter = status;
    this.loadInvoices();
  }

  deleteInvoice(inv: Invoice) {
    if (confirm(`Delete invoice ${inv.invoice_number}?`)) {
      this.invoiceService.delete(inv.id!).subscribe(() => this.loadInvoices());
    }
  }
}
