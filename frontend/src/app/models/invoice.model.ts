export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id?: number;
  invoice_number?: string;
  client_id?: number;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid';
  tax_rate: number;
  notes?: string;
  items: InvoiceItem[];
  subtotal?: number;
  tax_amount?: number;
  total?: number;
  created_at?: string;
}
