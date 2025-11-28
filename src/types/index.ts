// src/types/index.ts

export type UserRole = 'executive' | 'manager' | 'salesman' | 'encoder';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  division?: string;
  branch?: string;
  salesman_id?: string;
}

export interface FilterOptions {
  fromDate: Date;
  toDate: Date;
  division?: string;
  branch?: string;
}

export interface KPIData {
  totalNetSales: number;
  growthVsPrevious: number;
  grossMargin?: number;
  collectionRate?: number;
}

export interface SalesTrendData {
  date: string;
  netSales: number;
  target?: number;
}

export interface DivisionSalesData {
  division: string;
  netSales: number;
  grossSales: number;
  discount: number;
  returns: number;
  invoiceCount: number;
  avgInvoice: number;
  percentOfTotal: number;
}

export interface BranchSalesData {
  branch: string;
  division: string;
  netSales: number;
  grossSales: number;
  discount: number;
  returns: number;
  invoiceCount: number;
  avgInvoice: number;
  percentOfTotal: number;
}

export interface TopCustomer {
  rank: number;
  customerName: string;
  classification?: string;
  storeType?: string;
  division: string;
  branch: string;
  netSales: number;
  invoiceCount: number;
  avgInvoice: number;
  lastInvoiceDate: string;
  percentOfTotal: number;
}

export interface TopSalesman {
  rank: number;
  salesmanName: string;
  division: string;
  branch: string;
  netSales: number;
  grossSales: number;
  discount: number;
  returns: number;
  invoiceCount: number;
  avgInvoice: number;
  target?: number;
  targetAttainment?: number;
}

export interface SupplierTrendData {
  supplier: string;
  date: string;
  netSales: number;
}

export interface SupplierComparison {
  supplier: string;
  currentPeriodSales: number;
  previousPeriodSales: number;
  growth: number;
  invoiceCount: number;
  avgInvoice: number;
  shareOfTotal: number;
}

export interface SupplierMonthlyData {
  year: number;
  supplier: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
  total: number;
}

export interface InvoiceQueueItem {
  invoiceNo: string;
  date: string;
  customerName: string;
  amount: number;
  branch: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'encoded' | 'error';
}

export interface ValidationIssue {
  invoiceNo: string;
  errorType: string;
  description: string;
  customerName: string;
  date: string;
  status: 'open' | 'fixed';
  assignedTo?: string;
}

export interface SummaryBand {
  grossSales: number;
  totalDiscount: number;
  netSales: number;
  returns: number;
  invoiceCount: number;
}