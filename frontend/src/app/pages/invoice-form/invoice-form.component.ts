import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { ClientService } from '../../services/client.service';
import { Invoice, InvoiceItem } from '../../models/invoice.model';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>{{ isEdit ? 'Edit Invoice' : 'New Invoice' }}</h1>
      <a routerLink="/" class="btn btn-secondary">Back to Dashboard</a>
    </div>

    <form (ngSubmit)="save()" class="invoice-form">
      <div class="card">
        <h3>Invoice Details</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Client</label>
            <select [(ngModel)]="invoice.client_id" name="client_id">
              <option [ngValue]="null">-- Select Client --</option>
              <option *ngFor="let c of clients" [ngValue]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select [(ngModel)]="invoice.status" name="status">
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Invoice Date *</label>
            <input type="date" [(ngModel)]="invoice.date" name="date" required>
          </div>
          <div class="form-group">
            <label>Due Date *</label>
            <input type="date" [(ngModel)]="invoice.due_date" name="due_date" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Tax Rate (%)</label>
            <input type="number" [(ngModel)]="invoice.tax_rate" name="tax_rate" min="0" max="100" step="0.1">
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-header">
          <h3>Line Items</h3>
          <button type="button" class="btn btn-primary btn-sm" (click)="addItem()">+ Add Item</button>
        </div>
        <table class="items-table" *ngIf="invoice.items.length > 0">
          <thead>
            <tr>
              <th class="desc-col">Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of invoice.items; let i = index">
              <td>
                <input type="text" [(ngModel)]="item.description" [name]="'desc_' + i" placeholder="Item description" required>
              </td>
              <td>
                <input type="number" [(ngModel)]="item.quantity" [name]="'qty_' + i" min="0" step="1">
              </td>
              <td>
                <input type="number" [(ngModel)]="item.unit_price" [name]="'price_' + i" min="0" step="0.01">
              </td>
              <td class="amount">{{ item.quantity * item.unit_price | currency }}</td>
              <td>
                <button type="button" class="btn-remove" (click)="removeItem(i)">&times;</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="invoice.items.length === 0" class="no-items">No items added yet. Click "+ Add Item" to begin.</p>
      </div>

      <div class="card totals-card">
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <strong>{{ subtotal | currency }}</strong>
          </div>
          <div class="total-row">
            <span>Tax ({{ invoice.tax_rate }}%):</span>
            <strong>{{ taxAmount | currency }}</strong>
          </div>
          <div class="total-row total-final">
            <span>Total:</span>
            <strong>{{ total | currency }}</strong>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="form-group">
          <label>Notes</label>
          <textarea [(ngModel)]="invoice.notes" name="notes" rows="3" placeholder="Additional notes..."></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" [disabled]="!invoice.date || !invoice.due_date">
          {{ isEdit ? 'Update Invoice' : 'Create Invoice' }}
        </button>
        <a routerLink="/" class="btn btn-secondary">Cancel</a>
      </div>
    </form>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-header h1 { margin: 0; font-size: 1.75rem; }
    .card {
      background: #fff;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .card h3 { margin-top: 0; margin-bottom: 1rem; color: #333; }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .section-header h3 { margin-bottom: 0; }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    .items-table th {
      text-align: left;
      padding: 0.5rem;
      font-size: 0.8rem;
      text-transform: uppercase;
      color: #6c757d;
      border-bottom: 2px solid #e9ecef;
    }
    .items-table td {
      padding: 0.5rem;
    }
    .items-table input {
      width: 100%;
      box-sizing: border-box;
    }
    .desc-col { width: 40%; }
    .amount { font-weight: 600; white-space: nowrap; }
    .btn-remove {
      background: #fee2e2;
      color: #ef4444;
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.1rem;
      line-height: 1;
    }
    .btn-remove:hover { background: #ef4444; color: #fff; }
    .no-items { color: #6c757d; text-align: center; padding: 1rem; }
    .totals-card { max-width: 350px; margin-left: auto; }
    .totals { display: flex; flex-direction: column; gap: 0.5rem; }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
    }
    .total-final {
      border-top: 2px solid #333;
      padding-top: 0.5rem;
      margin-top: 0.25rem;
      font-size: 1.1rem;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.85rem; }
  `]
})
export class InvoiceFormComponent implements OnInit {
  invoice: Invoice = {
    client_id: undefined,
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'draft',
    tax_rate: 0,
    notes: '',
    items: []
  };

  clients: Client[] = [];
  isEdit = false;
  invoiceId: number | null = null;

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.clientService.getAll().subscribe(data => this.clients = data);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.invoiceId = Number(id);
      this.invoiceService.getById(this.invoiceId).subscribe(inv => {
        this.invoice = inv;
      });
    } else {
      // Set default due date to 30 days from now
      const due = new Date();
      due.setDate(due.getDate() + 30);
      this.invoice.due_date = due.toISOString().split('T')[0];
    }
  }

  get subtotal(): number {
    return this.invoice.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  }

  get taxAmount(): number {
    return this.subtotal * (this.invoice.tax_rate || 0) / 100;
  }

  get total(): number {
    return this.subtotal + this.taxAmount;
  }

  addItem() {
    this.invoice.items.push({ description: '', quantity: 1, unit_price: 0 });
  }

  removeItem(index: number) {
    this.invoice.items.splice(index, 1);
  }

  save() {
    const payload = {
      client_id: this.invoice.client_id,
      date: this.invoice.date,
      due_date: this.invoice.due_date,
      status: this.invoice.status,
      tax_rate: this.invoice.tax_rate,
      notes: this.invoice.notes,
      items: this.invoice.items
    };

    const obs = this.isEdit
      ? this.invoiceService.update(this.invoiceId!, payload)
      : this.invoiceService.create(payload);

    obs.subscribe(() => this.router.navigate(['/']));
  }
}
