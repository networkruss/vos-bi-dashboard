// src/app/bi/salesman/page.tsx
"use client";

import { useState, useMemo } from "react";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  format,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, Percent, FileText, Users, CalendarClock, TrendingUp } from "lucide-react";
import { KPICard, formatCurrency } from "@/components/dashboard/KPICard";

// ------------------ Types ------------------
type PeriodPreset = "today" | "thisWeek" | "thisMonth" | "custom";

type KPIMetrics = {
  netSales: number;
  target: number;
  attainment: number;
  invoices: number;
};

type DailyChartData = {
  date: string;
  netSales: number;
  cumulativeSales: number;
  idealTarget: number;
};

type CustomerData = {
  customer: string;
  division: string;
  branch: string;
  netSales: number;
  invoices: number;
  lastInvoiceDate: string;
};

type DealData = {
  opportunity: string;
  customer: string;
  stage: string;
  expectedClose: string;
  nextAction: string;
  dueDate: string;
};

// ------------------ Mock Data (Replace with API calls later) ------------------
const getTargetForPeriod = (period: PeriodPreset): number => {
  switch (period) {
    case "today": return 15000;
    case "thisWeek": return 75000;
    case "thisMonth": return 300000;
    default: return 300000;
  }
};

const getMockDailySales = (from: Date, to: Date): DailyChartData[] => {
  const days = [];
  let current = new Date(from);
  let cumulativeSales = 0;
  const totalTarget = 300000;
  const daysInMonth = Math.ceil(
    (endOfMonth(new Date()).getTime() - startOfMonth(new Date()).getTime()) / (1000 * 60 * 60 * 24)
  );

  while (current <= to) {
    // Remove unused `dateStr`
    const sales = 8000 + Math.floor(Math.random() * 4000);
    cumulativeSales += sales;
    const dayIndex = days.length + 1; // avoid closure/index confusion
    const ideal = Math.round((totalTarget / daysInMonth) * dayIndex);

    days.push({
      date: format(current, "MMM d"), // directly format `current`
      netSales: sales,
      cumulativeSales,
      idealTarget: ideal,
    });

    current = addDays(current, 1);
  }
  return days;
};

const getMockTopCustomers = (): CustomerData[] => [
  { customer: "ABC Corp", division: "Electronics", branch: "Manila", netSales: 42500, invoices: 8, lastInvoiceDate: "2025-11-28" },
  { customer: "XYZ Trading", division: "Appliances", branch: "Quezon City", netSales: 31200, invoices: 5, lastInvoiceDate: "2025-11-30" },
  { customer: "123 Supplies", division: "Hardware", branch: "Pasig", netSales: 28900, invoices: 6, lastInvoiceDate: "2025-11-25" },
];

const getMockOpenDeals = (): DealData[] => [
  { opportunity: "Server Upgrade Project", customer: "ABC Corp", stage: "Proposal", expectedClose: "2025-12-15", nextAction: "Send quote revision", dueDate: "2025-12-03" },
  { opportunity: "Office Renovation", customer: "XYZ Trading", stage: "Negotiation", expectedClose: "2025-12-20", nextAction: "Follow-up call", dueDate: "2025-12-02" },
];

// ------------------ PeriodSelector Component (Fixed: outside render) ------------------
const PeriodSelector = ({
  period,
  setPeriod,
  customRange,
  setCustomRange,
  dateRange,
}: {
  period: PeriodPreset;
  setPeriod: (p: PeriodPreset) => void;
  customRange: { from: string; to: string };
  setCustomRange: (r: { from: string; to: string }) => void;
  dateRange: { from: Date; to: Date };
}) => (
  <div className="flex flex-wrap items-center gap-4 mb-6">
    <label className="font-medium">Period:</label>
    <select
      value={period}
      onChange={(e) => setPeriod(e.target.value as PeriodPreset)}
      className="border rounded px-3 py-1 bg-background"
    >
      <option value="today">Today</option>
      <option value="thisWeek">This Week</option>
      <option value="thisMonth">This Month</option>
      <option value="custom">Custom Range</option>
    </select>

    {period === "custom" && (
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={customRange.from}
          onChange={(e) => setCustomRange({ ...customRange, from: e.target.value })}
          className="border rounded px-2 py-1"
        />
        <span>to</span>
        <input
          type="date"
          value={customRange.to}
          onChange={(e) => setCustomRange({ ...customRange, to: e.target.value })}
          className="border rounded px-2 py-1"
        />
      </div>
    )}

    <div className="text-sm text-muted-foreground">
      Showing: {format(dateRange.from, "MMM d")} – {format(dateRange.to, "MMM d, yyyy")}
    </div>
  </div>
);

// ------------------ Main Component ------------------
export default function SalesmanDashboard() {
  const [period, setPeriod] = useState<PeriodPreset>("thisMonth");
  const [customRange, setCustomRange] = useState<{ from: string; to: string }>({
    from: format(new Date(), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });

  const dateRange = useMemo(() => {
    const today = new Date();
    switch (period) {
      case "today":
        return { from: startOfDay(today), to: endOfDay(today) };
      case "thisWeek":
        return { from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) };
      case "thisMonth":
        return { from: startOfMonth(today), to: endOfMonth(today) };
      case "custom":
        return {
          from: parseISO(customRange.from),
          to: parseISO(customRange.to),
        };
      default:
        return { from: startOfMonth(today), to: endOfMonth(today) };
    }
  }, [period, customRange]);

  const kpiData = useMemo((): KPIMetrics => {
    const target = getTargetForPeriod(period);
    const netSales =
      period === "today"
        ? 13200
        : period === "thisWeek"
        ? 68500
        : period === "thisMonth"
        ? 185000
        : 185000;
    const invoices = period === "today" ? 4 : period === "thisWeek" ? 18 : 45;

    return {
      netSales,
      target,
      attainment: target > 0 ? Math.round((netSales / target) * 1000) / 10 : 0,
      invoices,
    };
  }, [period]);

  const chartData = useMemo(() => {
    if (period !== "thisMonth") return [];
    return getMockDailySales(dateRange.from, dateRange.to);
  }, [period, dateRange]);

  const topCustomers = useMemo(() => getMockTopCustomers(), []);
  const openDeals = useMemo(() => getMockOpenDeals(), []);

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Sales Dashboard</h1>
        <p className="text-muted-foreground">Your performance and priorities</p>
      </div>

      <PeriodSelector
        period={period}
        setPeriod={setPeriod}
        customRange={customRange}
        setCustomRange={setCustomRange}
        dateRange={dateRange}
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="My Sales (Net)"
          value={kpiData.netSales}
          formatValue={formatCurrency}
          icon={DollarSign}
          subtitle="This period"
        />
        <KPICard
          title="My Target"
          value={kpiData.target}
          formatValue={formatCurrency}
          icon={DollarSign}
          subtitle="Assigned goal"
        />
        <div>
          <KPICard
            title="Target Attainment"
            value={`${kpiData.attainment}%`}
            icon={Percent}
            subtitle=""
          />
          <p
            className={`text-center text-sm mt-1 ${
              kpiData.attainment >= 100 ? "text-green-600 font-medium" : "text-orange-500"
            }`}
          >
            {kpiData.attainment >= 100 ? "✅ Exceeded" : "⚠️ Behind"}
          </p>
        </div>
        <KPICard
          title="# Invoices"
          value={kpiData.invoices}
          icon={FileText}
          subtitle="This period"
        />
      </div>

      {/* Chart: My Sales vs Target (This Month) */}
      {period === "thisMonth" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              My Sales vs Target (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(value as number),
                    name === "cumulativeSales"
                      ? "Cumulative Actual"
                      : name === "idealTarget"
                      ? "Ideal Target"
                      : "Daily Sales",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeSales"
                  name="Cumulative Actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="idealTarget"
                  name="Ideal Target"
                  stroke="#10b981"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Customers */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Top Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Division / Branch</TableHead>
                <TableHead className="text-right">Net Sales</TableHead>
                <TableHead className="text-center"># Invoices</TableHead>
                <TableHead>Last Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCustomers.map((cust, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{cust.customer}</TableCell>
                  <TableCell>
                    {cust.division} / {cust.branch}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(cust.netSales)}
                  </TableCell>
                  <TableCell className="text-center">{cust.invoices}</TableCell>
                  <TableCell>{format(parseISO(cust.lastInvoiceDate), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Today’s Focus / Open Deals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Today’s Focus / Open Deals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {openDeals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Expected Close</TableHead>
                  <TableHead>Next Action</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openDeals.map((deal, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{deal.opportunity}</TableCell>
                    <TableCell>{deal.customer}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                        {deal.stage}
                      </span>
                    </TableCell>
                    <TableCell>{format(parseISO(deal.expectedClose), "MMM d")}</TableCell>
                    <TableCell>{deal.nextAction}</TableCell>
                    <TableCell>
                      <span
                        className={
                          isWithinInterval(parseISO(deal.dueDate), {
                            start: new Date(),
                            end: new Date(),
                          })
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {format(parseISO(deal.dueDate), "MMM d")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground italic">No open deals or tasks at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}