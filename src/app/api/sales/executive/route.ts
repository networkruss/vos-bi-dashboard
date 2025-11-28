// src/app/api/sales/executive/route.ts
import { NextResponse } from "next/server";

// Mock data
const mockData = {
  kpi: {
    totalNetSales: 1250000,
    growthVsPrevious: 8.5,
    grossMargin: 32.4,
    collectionRate: 87.2,
  },
  salesTrend: [
    { date: "Jan", netSales: 120000 },
    { date: "Feb", netSales: 150000 },
    { date: "Mar", netSales: 130000 },
    { date: "Apr", netSales: 140000 },
    { date: "May", netSales: 160000 },
    { date: "Jun", netSales: 170000 },
  ],
  divisionSales: [
    { division: "Electronics", netSales: 400000 },
    { division: "Appliances", netSales: 300000 },
    { division: "Furniture", netSales: 250000 },
    { division: "Hardware", netSales: 300000 },
  ],
  topCustomers: [
    { rank: 1, customerName: "ACME Corp", division: "Electronics", branch: "Manila", netSales: 150000, percentOfTotal: 12, invoiceCount: 10, lastInvoiceDate: "2025-11-15" },
    { rank: 2, customerName: "Beta Co", division: "Appliances", branch: "Quezon City", netSales: 120000, percentOfTotal: 10, invoiceCount: 8, lastInvoiceDate: "2025-11-12" },
    // ...add more as needed
  ],
  topSalesmen: [
    { rank: 1, salesmanName: "John Doe", division: "Electronics", branch: "Manila", netSales: 180000, target: 650000, targetAttainment: 27.7, invoiceCount: 12 },
    { rank: 2, salesmanName: "Jane Smith", division: "Appliances", branch: "Quezon City", netSales: 150000, target: 650000, targetAttainment: 23.1, invoiceCount: 10 },
    // ...add more as needed
  ],
  summary: {
    grossSales: 1800000,
    totalDiscount: 200000,
    netSales: 1600000,
    returns: 50000,
    invoiceCount: 120,
  },
};

export async function GET() {
  return NextResponse.json(mockData);
}