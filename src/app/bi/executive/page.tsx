// src/app/bi/executive/page.tsx
"use client";

import { useState, useEffect } from "react";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { KPICard, formatCurrency } from "@/components/dashboard/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, Percent, Receipt } from "lucide-react";

// ------------------ Types ------------------
type DashboardFilters = {
  fromDate: string;
  toDate: string;
  division?: string;
  branch?: string;
};

type Customer = {
  rank: number;
  customerName: string;
  division: string;
  branch: string;
  netSales: number;
  percentOfTotal: number;
  invoiceCount: number;
  lastInvoiceDate: string;
};

type Salesman = {
  rank: number;
  salesmanName: string;
  division: string;
  branch: string;
  netSales: number;
  target: number;
  targetAttainment: number;
  invoiceCount: number;
};

type SalesTrendData = {
  date: string;
  netSales: number;
};

type DivisionSalesData = {
  division: string;
  netSales: number;
};

type KPIData = {
  totalNetSales: number;
  growthVsPrevious: number;
  grossMargin: number;
  collectionRate: number;
};

type SummaryData = {
  grossSales: number;
  totalDiscount: number;
  netSales: number;
  returns: number;
  invoiceCount: number;
};

type DashboardData = {
  kpi: KPIData;
  salesTrend: SalesTrendData[];
  divisionSales: DivisionSalesData[];
  topCustomers: Customer[];
  topSalesmen: Salesman[];
  summary: SummaryData;
};

// ------------------ Component ------------------
export default function ExecutiveDashboard() {
  // State for filters
  const [filters, setFilters] = useState<DashboardFilters>({
    fromDate: '01/01/2024',
    toDate: '12/31/2025',
    division: undefined,
    branch: undefined,
  });

  // State for API data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataSource, setDataSource] = useState<'directus' | 'mock'>('directus');

  // Fetch data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.division && filters.division !== 'all') {
        params.append('division', filters.division);
      }
      
      const url = `/api/sales/executive?${params.toString()}`;
      console.log('🔍 Fetching:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`API Error: ${data.error}`);
      }

      console.log('✅ Dashboard data loaded:', data);
      setDashboardData(data);
      setDataSource('directus');
      
    } catch (error: any) {
      console.error('💥 Fetch failed:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []); // Empty dependency - load once on mount

  // Refetch when filters change
  useEffect(() => {
    if (dashboardData) { // Only refetch if we already have data
      fetchDashboardData();
    }
  }, [filters.division, filters.fromDate, filters.toDate]);

  const handleFilterChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
  };

  // ✨ NEW: Handle division click from chart
  const handleDivisionClick = (divisionName: string) => {
    console.log('🔍 Division clicked:', divisionName);
    setFilters({
      ...filters,
      division: divisionName
    });
  };

  // ------------------ Loading State ------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading dashboard data...</p>
          <p className="text-sm text-gray-400 mt-2">Fetching from Directus</p>
        </div>
      </div>
    );
  }

  // ------------------ Error State ------------------
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={fetchDashboardData}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------ No Data State ------------------
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">No data available</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // ------------------ Main Dashboard UI ------------------
  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Executive Dashboard</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Company-wide sales performance overview</p>
            {dataSource === 'directus' && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                ✓ Live Directus Data
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        divisions={dashboardData?.divisionSales ? Array.from(new Set(dashboardData.divisionSales.map(d => d.division))) : []}
        branches={dashboardData?.topCustomers ? Array.from(new Set(dashboardData.topCustomers.map(c => c.branch))) : []}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard 
          title="Total Net Sales" 
          value={dashboardData.kpi?.totalNetSales ?? 0} 
          formatValue={formatCurrency} 
          icon={DollarSign} 
          trend={dashboardData.kpi?.growthVsPrevious ?? 0} 
          subtitle="vs previous period"
        />
        <KPICard 
          title="Growth Rate" 
          value={`${dashboardData.kpi?.growthVsPrevious ?? 0}%`} 
          icon={TrendingUp} 
          subtitle="period over period"
        />
        <KPICard 
          title="Gross Margin" 
          value={`${dashboardData.kpi?.grossMargin?.toFixed(1) ?? 0}%`} 
          icon={Percent}
        />
        <KPICard 
          title="Collection Rate" 
          value={`${dashboardData.kpi?.collectionRate?.toFixed(1) ?? 0}%`} 
          icon={Receipt}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="salesmen">Salesmen</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Sales Trend</CardTitle></CardHeader>
            <CardContent>
              {dashboardData.salesTrend && dashboardData.salesTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="netSales" stroke="#8884d8" name="Net Sales" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No sales trend data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* ✨ UPDATED: Division Sales Chart - Now Clickable */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Division Sales</CardTitle>
              {filters.division && (
                <p className="text-sm text-gray-500 mt-1">
                  Filtered by: <span className="font-semibold">{filters.division}</span>
                  <button 
                    onClick={() => setFilters({ ...filters, division: undefined })}
                    className="ml-2 text-blue-500 hover:underline"
                  >
                    Clear
                  </button>
                </p>
              )}
            </CardHeader>
            <CardContent>
              {dashboardData.divisionSales && dashboardData.divisionSales.length > 0 ? (
                <>
                  <p className="text-sm text-gray-500 mb-2">💡 Click on a bar to filter by division</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.divisionSales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="division"
                        style={{ cursor: 'pointer' }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar 
                        dataKey="netSales" 
                        fill="#82ca9d" 
                        name="Net Sales"
                        onClick={(data: any) => {
                          console.log('Bar clicked:', data);
                          if (data && data.division) {
                            handleDivisionClick(data.division);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No division sales data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers */}
        <TabsContent value="customers">
          <Card>
            <CardHeader><CardTitle>Top Customers</CardTitle></CardHeader>
            <CardContent>
              {dashboardData.topCustomers && dashboardData.topCustomers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Net Sales</TableHead>
                      <TableHead>% of Total</TableHead>
                      <TableHead>Invoices</TableHead>
                      <TableHead>Last Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.topCustomers.map(c => (
                      <TableRow key={c.rank}>
                        <TableCell>{c.rank}</TableCell>
                        <TableCell>{c.customerName}</TableCell>
                        <TableCell>
                          {/* ✨ NEW: Clickable division in table */}
                          <button
                            onClick={() => handleDivisionClick(c.division)}
                            className="text-blue-500 hover:underline cursor-pointer"
                          >
                            {c.division}
                          </button>
                        </TableCell>
                        <TableCell>{c.branch}</TableCell>
                        <TableCell>{formatCurrency(c.netSales)}</TableCell>
                        <TableCell>{c.percentOfTotal.toFixed(2)}%</TableCell>
                        <TableCell>{c.invoiceCount}</TableCell>
                        <TableCell>{c.lastInvoiceDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  No customer data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salesmen */}
        <TabsContent value="salesmen">
          <Card>
            <CardHeader><CardTitle>Top Salesmen</CardTitle></CardHeader>
            <CardContent>
              {dashboardData.topSalesmen && dashboardData.topSalesmen.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Salesman</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Net Sales</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Attainment %</TableHead>
                      <TableHead>Invoices</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.topSalesmen.map(s => (
                      <TableRow key={s.rank}>
                        <TableCell>{s.rank}</TableCell>
                        <TableCell>{s.salesmanName}</TableCell>
                        <TableCell>
                          {/* ✨ NEW: Clickable division in table */}
                          <button
                            onClick={() => handleDivisionClick(s.division)}
                            className="text-blue-500 hover:underline cursor-pointer"
                          >
                            {s.division}
                          </button>
                        </TableCell>
                        <TableCell>{s.branch}</TableCell>
                        <TableCell>{formatCurrency(s.netSales)}</TableCell>
                        <TableCell>{formatCurrency(s.target)}</TableCell>
                        <TableCell>{s.targetAttainment.toFixed(2)}%</TableCell>
                        <TableCell>{s.invoiceCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  No salesman data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary */}
        <TabsContent value="summary">
          <Card>
            <CardHeader><CardTitle>Sales Summary</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gross Sales</TableHead>
                    <TableHead>Total Discount</TableHead>
                    <TableHead>Net Sales</TableHead>
                    <TableHead>Returns</TableHead>
                    <TableHead>Invoices</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{formatCurrency(dashboardData.summary?.grossSales ?? 0)}</TableCell>
                    <TableCell>{formatCurrency(dashboardData.summary?.totalDiscount ?? 0)}</TableCell>
                    <TableCell>{formatCurrency(dashboardData.summary?.netSales ?? 0)}</TableCell>
                    <TableCell>{formatCurrency(dashboardData.summary?.returns ?? 0)}</TableCell>
                    <TableCell>{dashboardData.summary?.invoiceCount ?? 0}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}