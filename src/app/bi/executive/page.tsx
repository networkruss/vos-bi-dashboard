// src/app/bi/executive/page.tsx
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

import { FilterBar } from "@/components/dashboard/FilterBar";
import { KPICard } from "@/components/dashboard/KPICard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

import { DollarSign, TrendingUp, Percent, Receipt, Loader2 } from "lucide-react";

/* ---------------------------
   Types
----------------------------*/
interface Filters {
  fromDate: string;
  toDate: string;
  division?: string | undefined;
  branch?: string | undefined;
}

interface KPIData {
  totalNetSales: number;
  growthVsPrevious: number;
  grossMargin: number;
  collectionRate: number;
}

interface TrendPoint {
  date: string;
  netSales: number;
}

interface DivisionPoint {
  division: string;
  netSales: number;
}

interface TopCustomer {
  rank: number;
  customerName: string;
  division: string;
  branch: string;
  netSales: number;
  percentOfTotal: number;
  invoiceCount: number;
  lastInvoiceDate: string;
}

interface TopSalesman {
  rank: number;
  salesmanName: string;
  division: string;
  branch: string;
  netSales: number;
  target: number;
  targetAttainment: number;
  invoiceCount: number;
}

interface SummaryData {
  grossSales: number;
  totalDiscount: number;
  netSales: number;
  returns: number;
  invoiceCount: number;
}

interface APIResponse {
  kpi: KPIData;
  salesTrend: TrendPoint[];
  divisionSales: DivisionPoint[];
  topCustomers: TopCustomer[];
  topSalesmen: TopSalesman[];
  summary: SummaryData;
}

/* ---------------------------
   Helpers
----------------------------*/
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);

const formatShortK = (value: number) => `₱${(value / 1000).toFixed(0)}K`;

/* ---------------------------
   Component
----------------------------*/
export default function ExecutiveDashboard() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    fromDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
    toDate: format(new Date(), "yyyy-MM-dd"),
    division: undefined,
    branch: undefined,
  });

  const [kpiData, setKpiData] = useState<KPIData>({
    totalNetSales: 0,
    growthVsPrevious: 0,
    grossMargin: 0,
    collectionRate: 0,
  });

  const [salesTrend, setSalesTrend] = useState<TrendPoint[]>([]);
  const [divisionSales, setDivisionSales] = useState<DivisionPoint[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [topSalesmen, setTopSalesmen] = useState<TopSalesman[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    grossSales: 0,
    totalDiscount: 0,
    netSales: 0,
    returns: 0,
    invoiceCount: 0,
  });

  /* Fetch function typed to APIResponse */
  const fetchDashboardData = async (currentFilters: Filters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        fromDate: currentFilters.fromDate,
        toDate: currentFilters.toDate,
      });

      if (currentFilters.division) params.set("division", currentFilters.division);
      if (currentFilters.branch) params.set("branch", currentFilters.branch);

      const res = await fetch(`/api/sales/executive?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `API returned ${res.status}`);
      }

      const data = (await res.json()) as APIResponse;

      // Defensive defaults
      setKpiData(data.kpi ?? {
        totalNetSales: 0,
        growthVsPrevious: 0,
        grossMargin: 0,
        collectionRate: 0,
      });

      setSalesTrend(Array.isArray(data.salesTrend) ? data.salesTrend : []);
      setDivisionSales(Array.isArray(data.divisionSales) ? data.divisionSales : []);
      setTopCustomers(Array.isArray(data.topCustomers) ? data.topCustomers : []);
      setTopSalesmen(Array.isArray(data.topSalesmen) ? data.topSalesmen : []);
      setSummary(data.summary ?? { grossSales: 0, totalDiscount: 0, netSales: 0, returns: 0, invoiceCount: 0 });
    } catch (err) {
      console.error("Fetch dashboard error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  /* Use an IIFE inside effect to avoid synchronous setState in effect body */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await fetchDashboardData(filters);
    })();
    return () => {
      mounted = false;
    };
    
  }, [filters]);

  const handleFilterChange = (newFilters: Filters) => setFilters(newFilters);

  /* Render loading / error states */
  if (loading && salesTrend.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && salesTrend.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️ Error</div>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => fetchDashboardData(filters)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------
     Render main UI (Tabs)
  ----------------------------*/
  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Executive Dashboard</h1>
        <p className="text-muted-foreground">Company-wide sales performance overview</p>
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        divisions={["Electronics", "Appliances", "Furniture", "Hardware"]}
        branches={["Manila", "Quezon City", "Makati", "Pasig", "Cebu"]}
      />

      {loading && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Refreshing data...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Net Sales"
          value={kpiData.totalNetSales}
          formatValue={formatCurrency}
          icon={DollarSign}
          trend={kpiData.growthVsPrevious}
          subtitle="vs previous period"
        />
        <KPICard title="Growth Rate" value={`${kpiData.growthVsPrevious}%`} icon={TrendingUp} subtitle="period over period" />
        <KPICard title="Gross Margin" value={`${kpiData.grossMargin}%`} icon={Percent} />
        <KPICard title="Collection Rate" value={`${kpiData.collectionRate}%`} icon={Receipt} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="salesmen">Salesmen</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* -------------------------------
            Overview (Charts)
           ------------------------------- */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {salesTrend.length > 0 ? (
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <LineChart data={salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(v) => formatShortK(Number(v))} />
                      <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="netSales" stroke="#2563eb" strokeWidth={2} name="Net Sales" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className=" flex items-center justify-center text-muted-foreground">
                  No sales trend data available.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales by Division</CardTitle>
            </CardHeader>
            <CardContent>
              {divisionSales.length > 0 ? (
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={divisionSales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="division" />
                      <YAxis tickFormatter={(v) => formatShortK(Number(v))} />
                      <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="netSales" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center text-muted-foreground">
                  No division sales data available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------
            Customers Table
           ------------------------------- */}
        <TabsContent value="customers" className="p-0">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {topCustomers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Division / Branch</TableHead>
                      <TableHead className="text-right">Net Sales</TableHead>
                      <TableHead className="text-right">% of Total</TableHead>
                      <TableHead className="text-right"># Invoices</TableHead>
                      <TableHead>Last Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.map((c) => (
                      <TableRow key={c.rank}>
                        <TableCell className="font-medium">{c.rank}</TableCell>
                        <TableCell>{c.customerName}</TableCell>
                        <TableCell>{c.division} / {c.branch}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.netSales)}</TableCell>
                        <TableCell className="text-right">{c.percentOfTotal.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">{c.invoiceCount}</TableCell>
                        <TableCell>{c.lastInvoiceDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No customer data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------
            Salesmen Table
           ------------------------------- */}
        <TabsContent value="salesmen" className="p-0">
          <Card>
            <CardHeader>
              <CardTitle>Top Salesmen</CardTitle>
            </CardHeader>
            <CardContent>
              {topSalesmen.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Salesman</TableHead>
                      <TableHead>Division / Branch</TableHead>
                      <TableHead className="text-right">Net Sales</TableHead>
                      <TableHead className="text-right">Target</TableHead>
                      <TableHead className="text-right">% Target</TableHead>
                      <TableHead className="text-right"># Invoices</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSalesmen.map((s) => (
                      <TableRow key={s.rank}>
                        <TableCell className="font-medium">{s.rank}</TableCell>
                        <TableCell>{s.salesmanName}</TableCell>
                        <TableCell>{s.division} / {s.branch}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.netSales)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.target)}</TableCell>
                        <TableCell className="text-right">
                          <span className={s.targetAttainment >= 100 ? "text-green-600 font-medium" : "text-red-600"}>
                            {s.targetAttainment.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{s.invoiceCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No salesman data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------
            Summary Band
           ------------------------------- */}
        <TabsContent value="summary" className="p-0">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Gross Sales</p>
                  <p className="text-lg font-semibold">{formatCurrency(summary.grossSales)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Discount</p>
                  <p className="text-lg font-semibold text-red-600">{formatCurrency(summary.totalDiscount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Sales</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(summary.netSales)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Returns (Net)</p>
                  <p className="text-lg font-semibold text-orange-600">{formatCurrency(summary.returns)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground"># Invoices</p>
                  <p className="text-lg font-semibold">{summary.invoiceCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
