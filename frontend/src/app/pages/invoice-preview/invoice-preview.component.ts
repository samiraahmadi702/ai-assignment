import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="actions-bar no-print">
      <a routerLink="/" class="btn btn-secondary">Back to Dashboard</a>
      <div class="action-buttons">
        <a [routerLink]="['/invoices', invoice!.id, 'edit']" class="btn btn-secondary" *ngIf="invoice">Edit</a>
        <button class="btn btn-primary" (click)="printInvoice()">Print / Download PDF</button>
      </div>
    </div>

    <div class="invoice-paper" *ngIf="invoice">
      <div class="invoice-header">
        <div class="company-info">
          <h2>INVOICE</h2>
          <p class="company-name">Your Company Name</p>
          <p>123 Business St, City, State 12345</p>
          <p>info&#64;yourcompany.com</p>
        </div>
        <div class="invoice-meta">
          <div class="meta-row">
            <span class="meta-label">Invoice #</span>
            <span class="meta-value">{{ invoice.invoice_number }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Date</span>
            <span class="meta-value">{{ invoice.date }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Due Date</span>
            <span class="meta-value">{{ invoice.due_date }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Status</span>
            <span class="badge" [ngClass]="'badge-' + invoice.status">{{ invoice.status }}</span>
          </div>
        </div>
      </div>

      <div class="bill-to">
        <h4>Bill To:</h4>
        <p class="client-name">{{ invoice.client_name || 'N/A' }}</p>
        <p *ngIf="invoice.client_email">{{ invoice.client_email }}</p>
        <p *ngIf="invoice.client_phone">{{ invoice.client_phone }}</p>
        <p *ngIf="invoice.client_address">{{ invoice.client_address }}</p>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th class="desc-col">Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th class="amount-col">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of invoice.items">
            <td>{{ item.description }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.unit_price | currency }}</td>
            <td class="amount-col">{{ item.quantity * item.unit_price | currency }}</td>
          </tr>
        </tbody>
      </table>

      <div class="totals-section">
        <div class="total-row">
          <span>Subtotal</span>
          <span>{{ invoice.subtotal | currency }}</span>
        </div>
        <div class="total-row">
          <span>Tax ({{ invoice.tax_rate }}%)</span>
          <span>{{ invoice.tax_amount | currency }}</span>
        </div>
        <div class="total-row total-final">
          <span>Total</span>
          <span>{{ invoice.total | currency }}</span>
        </div>
      </div>

      <div class="notes-section" *ngIf="invoice.notes">
        <h4>Notes</h4>
        <p>{{ invoice.notes }}</p>
      </div>
    </div>
  `,
  styles: [`
    .actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .action-buttons { display: flex; gap: 0.75rem; }
    .invoice-paper {
      background: #fff;
      padding: 3rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 800px;
      margin: 0 auto;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #e9ecef;
    }
    .company-info h2 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      color: #1a1a2e;
    }
    .company-name { font-weight: 600; font-size: 1.1rem; }
    .company-info p { margin: 0.15rem 0; color: #6c757d; font-size: 0.9rem; }
    .invoice-meta { text-align: right; }
    .meta-row {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-bottom: 0.35rem;
    }
    .meta-label { color: #6c757d; font-size: 0.85rem; }
    .meta-value { font-weight: 600; min-width: 100px; text-align: right; }
    .badge {
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-draft { background: #e9ecef; color: #6c757d; }
    .badge-sent { background: #dbeafe; color: #2563eb; }
    .badge-paid { background: #d1fae5; color: #059669; }
    .bill-to {
      margin-bottom: 2rem;
    }
    .bill-to h4 {
      color: #6c757d;
      font-size: 0.8rem;
      text-transform: uppercase;
      margin: 0 0 0.5rem 0;
    }
    .client-name { font-weight: 600; font-size: 1.1rem; margin: 0 0 0.15rem 0; }
    .bill-to p { margin: 0.15rem 0; color: #555; }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
    }
    .items-table th {
      background: #f8f9fa;
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.8rem;
      text-transform: uppercase;
      color: #6c757d;
      border-bottom: 2px solid #e9ecef;
    }
    .items-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f0f0f0;
    }
    .amount-col { text-align: right; }
    .desc-col { width: 45%; }
    .totals-section {
      max-width: 300px;
      margin-left: auto;
      margin-bottom: 2rem;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.4rem 0;
      font-size: 0.95rem;
    }
    .total-final {
      border-top: 2px solid #333;
      padding-top: 0.5rem;
      margin-top: 0.25rem;
      font-weight: 700;
      font-size: 1.15rem;
    }
    .notes-section {
      border-top: 1px solid #e9ecef;
      padding-top: 1rem;
    }
    .notes-section h4 {
      color: #6c757d;
      font-size: 0.8rem;
      text-transform: uppercase;
      margin: 0 0 0.5rem 0;
    }
    .notes-section p { color: #555; margin: 0; }
    @media print {
      .no-print { display: none !important; }
      .invoice-paper { box-shadow: none; padding: 0; }
    }
  `]
})
export class InvoicePreviewComponent implements OnInit {
  invoice: Invoice | null = null;

  constructor(
    private invoiceService: InvoiceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.invoiceService.getById(id).subscribe(data => {
      this.invoice = data;
    });
  }

  printInvoice() {
    window.print();
  }
}
