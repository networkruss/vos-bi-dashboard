// src/app/api/sales/executive/route.ts
import { NextResponse } from "next/server";

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://100.126.246.124:8060';

interface ProcessedInvoice {
  invoice_id: string;
  invoice_no: string;
  order_id: string;
  invoice_date: string;
  customer_code: string;
  customer_name: string;
  salesman_id: number;
  salesman_name: string;
  division_id: number;
  division_name: string;
  branch_id: number;
  branch_name: string;
  total_amount: number;
  discount_amount: number;
  return_amount: number;
  return_discount: number;
  netSales: number;
}

// Fetch with retry logic
async function fetchWithRetry(url: string, name: string, retries = 3, delay = 1000): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`⏳ Fetching ${name} (attempt ${i + 1}/${retries})...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const text = await response.text();
        console.error(`❌ ${name} failed:`, response.status, text);
        
        // If 503, retry after delay
        if (response.status === 503 && i < retries - 1) {
          console.log(`⏸️ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error(`Failed to fetch ${name}: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ ${name}: ${data.data?.length || 0} records`);
      return data;
      
    } catch (error: any) {
      console.error(`💥 ${name} error (attempt ${i + 1}):`, error.message);
      
      // If last retry, throw error
      if (i === retries - 1) {
        throw new Error(`${name}: ${error.message}`);
      }
      
      // Wait before retry
      console.log(`⏸️ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`${name}: Max retries reached`);
}

// Optional fetch - returns empty data if fails
async function fetchOptional(url: string, name: string): Promise<any> {
  try {
    return await fetchWithRetry(url, name, 2, 500);
  } catch (error) {
    console.warn(`⚠️ ${name} failed, using empty data`);
    return { data: [] };
  }
}

export async function GET(request: Request) {
  try {
    console.log('🔍 Starting dashboard API...');
    console.log('📡 DIRECTUS_URL:', DIRECTUS_URL);

    // Get query params for filters
    const { searchParams } = new URL(request.url);
    const divisionFilter = searchParams.get('division');

    // Build URLs
    const urls = {
      invoices: `${DIRECTUS_URL}/items/sales_invoice?limit=-1`,
      returns: `${DIRECTUS_URL}/items/sales_return?limit=-1`,
      salesmen: `${DIRECTUS_URL}/items/salesman?limit=-1`,
      divisions: `${DIRECTUS_URL}/items/division?limit=-1`,
      customers: `${DIRECTUS_URL}/items/customer?limit=-1`,
      branches: `${DIRECTUS_URL}/items/branches?limit=-1`,
    };

    console.log('📡 Fetching data...');

    // Fetch critical data (with retry)
    const [invoices, returns] = await Promise.all([
      fetchWithRetry(urls.invoices, 'Invoices', 3, 2000),
      fetchWithRetry(urls.returns, 'Returns', 3, 2000),
    ]);

    // Fetch optional data (won't break if fails)
    const [salesmen, divisions, customers, branches] = await Promise.all([
      fetchOptional(urls.salesmen, 'Salesmen'),
      fetchOptional(urls.divisions, 'Divisions'),
      fetchOptional(urls.customers, 'Customers'),
      fetchOptional(urls.branches, 'Branches'),
    ]);

    // Validate critical data
    if (!invoices.data || !Array.isArray(invoices.data)) {
      throw new Error('Invalid invoices data');
    }

    console.log('✅ Data fetched:', {
      invoices: invoices.data?.length || 0,
      returns: returns.data?.length || 0,
      salesmen: salesmen.data?.length || 0,
      divisions: divisions.data?.length || 0,
      customers: customers.data?.length || 0,
      branches: branches.data?.length || 0,
    });

    // Build lookup maps
    const salesmanMap = new Map();
    (salesmen.data || []).forEach((s: any) => {
      salesmanMap.set(s.id, s);
    });

    const divisionMap = new Map();
    (divisions.data || []).forEach((d: any) => {
      divisionMap.set(d.division_id, d.division_name || 'Unknown');
    });
    console.log('📊 Divisions available:', Array.from(divisionMap.values()));

    const customerMap = new Map();
    (customers.data || []).forEach((c: any) => {
      customerMap.set(c.customer_code, c);
    });

    const branchMap = new Map();
    (branches.data || []).forEach((b: any) => {
      branchMap.set(b.id, b.branch_name || 'Unknown');
    });

    // Build returns map
    const returnsMap = new Map();
    (returns.data || []).forEach((r: any) => {
      const key = r.invoice_no;
      if (!returnsMap.has(key)) {
        returnsMap.set(key, []);
      }
      returnsMap.get(key).push(r);
    });

    // Process invoices
    const processedInvoices: ProcessedInvoice[] = (invoices.data || []).map((inv: any) => {
      const invoiceTotal = parseFloat(inv.total_amount || 0);
      const invoiceDiscount = parseFloat(inv.discount_amount || 0);
      
      const invReturns = returnsMap.get(inv.invoice_no) || [];
      const returnTotal = invReturns.reduce((sum: number, r: any) => 
        sum + parseFloat(r.total_amount || 0), 0);
      const returnDiscount = invReturns.reduce((sum: number, r: any) => 
        sum + parseFloat(r.discount_amount || 0), 0);

      const netSales = (invoiceTotal - invoiceDiscount) - (returnTotal - returnDiscount);

      const salesman = salesmanMap.get(inv.salesman_id);
      const divisionId = salesman?.division_id;
      const divisionName = divisionMap.get(divisionId) || 'Unknown';
      
      const customer = customerMap.get(inv.customer_code);
      const branchName = branchMap.get(inv.branch_id) || 'Unknown';

      return {
        invoice_id: inv.invoice_id,
        invoice_no: inv.invoice_no,
        order_id: inv.order_id,
        invoice_date: inv.invoice_date,
        customer_code: inv.customer_code,
        customer_name: customer?.customer_name || 'Unknown',
        salesman_id: inv.salesman_id,
        salesman_name: salesman?.salesman_name || 'Unknown',
        division_id: divisionId,
        division_name: divisionName,
        branch_id: inv.branch_id,
        branch_name: branchName,
        total_amount: invoiceTotal,
        discount_amount: invoiceDiscount,
        return_amount: returnTotal,
        return_discount: returnDiscount,
        netSales: netSales,
      };
    });

    console.log('✅ Processed:', processedInvoices.length, 'invoices');

    // Apply filters
    let filteredInvoices = processedInvoices;
    if (divisionFilter && divisionFilter !== 'all') {
      filteredInvoices = filteredInvoices.filter((inv: ProcessedInvoice) => 
        inv.division_name === divisionFilter
      );
      console.log(`🔍 Filtered by "${divisionFilter}": ${filteredInvoices.length} invoices`);
    }

    // Calculate KPIs
    const totalNetSales = filteredInvoices.reduce((sum: number, inv: ProcessedInvoice) => sum + inv.netSales, 0);
    const totalGrossSales = filteredInvoices.reduce((sum: number, inv: ProcessedInvoice) => sum + inv.total_amount, 0);
    const totalDiscount = filteredInvoices.reduce((sum: number, inv: ProcessedInvoice) => sum + inv.discount_amount, 0);
    const totalReturns = filteredInvoices.reduce((sum: number, inv: ProcessedInvoice) => sum + inv.return_amount, 0);
    
    const grossMargin = totalGrossSales > 0 ? ((totalNetSales / totalGrossSales) * 100) : 0;

    // Division sales
    const divisionSalesMap = new Map<string, number>();
    filteredInvoices.forEach((inv: ProcessedInvoice) => {
      const current = divisionSalesMap.get(inv.division_name) || 0;
      divisionSalesMap.set(inv.division_name, current + inv.netSales);
    });
    
    const divisionSales = Array.from(divisionSalesMap.entries())
      .map(([division, netSales]) => ({ division, netSales }))
      .sort((a, b) => b.netSales - a.netSales);

    // Sales trend
    const salesByDate = new Map<string, number>();
    filteredInvoices.forEach((inv: ProcessedInvoice) => {
      const date = inv.invoice_date?.split('T')[0] || inv.invoice_date;
      const current = salesByDate.get(date) || 0;
      salesByDate.set(date, current + inv.netSales);
    });
    
    const salesTrend = Array.from(salesByDate.entries())
      .map(([date, netSales]) => ({ date, netSales }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top customers
    const customerSalesMap = new Map();
    filteredInvoices.forEach((inv: ProcessedInvoice) => {
      const key = inv.customer_code;
      if (!customerSalesMap.has(key)) {
        customerSalesMap.set(key, {
          customerName: inv.customer_name,
          division: inv.division_name,
          branch: inv.branch_name,
          netSales: 0,
          invoiceCount: 0,
          lastInvoiceDate: inv.invoice_date,
        });
      }
      const customer = customerSalesMap.get(key);
      customer.netSales += inv.netSales;
      customer.invoiceCount += 1;
      if (inv.invoice_date > customer.lastInvoiceDate) {
        customer.lastInvoiceDate = inv.invoice_date;
      }
    });

    const topCustomers = Array.from(customerSalesMap.values())
      .sort((a, b) => b.netSales - a.netSales)
      .slice(0, 10)
      .map((c, index) => ({
        rank: index + 1,
        customerName: c.customerName,
        division: c.division,
        branch: c.branch,
        netSales: c.netSales,
        percentOfTotal: totalNetSales > 0 ? ((c.netSales / totalNetSales) * 100) : 0,
        invoiceCount: c.invoiceCount,
        lastInvoiceDate: c.lastInvoiceDate?.split('T')[0] || c.lastInvoiceDate,
      }));

    // Top salesmen
    const salesmanSalesMap = new Map();
    filteredInvoices.forEach((inv: ProcessedInvoice) => {
      const key = inv.salesman_id;
      if (!salesmanSalesMap.has(key)) {
        salesmanSalesMap.set(key, {
          salesmanName: inv.salesman_name,
          division: inv.division_name,
          branch: inv.branch_name,
          netSales: 0,
          invoiceCount: 0,
          target: 1000000,
        });
      }
      const salesman = salesmanSalesMap.get(key);
      salesman.netSales += inv.netSales;
      salesman.invoiceCount += 1;
    });

    const topSalesmen = Array.from(salesmanSalesMap.values())
      .sort((a, b) => b.netSales - a.netSales)
      .slice(0, 10)
      .map((s, index) => ({
        rank: index + 1,
        salesmanName: s.salesmanName,
        division: s.division,
        branch: s.branch,
        netSales: s.netSales,
        target: s.target,
        targetAttainment: s.target > 0 ? ((s.netSales / s.target) * 100) : 0,
        invoiceCount: s.invoiceCount,
      }));

    const dashboardData = {
      kpi: {
        totalNetSales,
        growthVsPrevious: 5.2,
        grossMargin,
        collectionRate: 92.5,
      },
      salesTrend,
      divisionSales,
      topCustomers,
      topSalesmen,
      summary: {
        grossSales: totalGrossSales,
        totalDiscount,
        netSales: totalNetSales,
        returns: totalReturns,
        invoiceCount: filteredInvoices.length,
      },
    };

    console.log('✅ Dashboard ready - Net Sales:', totalNetSales.toFixed(2));
    return NextResponse.json(dashboardData);

  } catch (error: any) {
    console.error('💥 API ERROR:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Server error',
        details: error.stack?.split('\n').slice(0, 3).join('\n'),
        directusUrl: DIRECTUS_URL,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}