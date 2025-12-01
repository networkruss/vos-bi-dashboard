"use client";

import { useState, useEffect, useMemo } from "react";
import { KPICard, formatNumber } from "@/components/dashboard/KPICard"; // ✅ removed unused formatCurrency
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

// ✅ Moved OUTSIDE component: no ESLint error
const ChartSkeleton = () => (
  <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-lg">
    <span className="text-gray-400 text-sm">Loading chart...</span>
  </div>
);

// ✅ Format PHP function (standalone, reusable)
const formatPHP = (value: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

type Tab = "overview" | "customers" | "salesman" | "summary";

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // === Mock Data (in PHP) ===
  const mockKPI = useMemo(() => ({
    totalSales: 1_850_000,
    newClients: 120,
    retentionRate: 92,
    teamPerformance: 87,
  }), []);

  const mockSalesTrend = useMemo(() => ({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    values: [120_000, 150_000, 170_000, 160_000, 180_000, 200_000],
  }), []);

  const mockDepartmentSales = useMemo(() => ({
    labels: ["North", "South", "East", "West"],
    values: [400_000, 300_000, 250_000, 500_000],
  }), []);

  const mockTopEmployees = useMemo(() => [
    { name: "John Doe", sales: 250_000, rank: 1 },
    { name: "Jane Smith", sales: 220_000, rank: 2 },
    { name: "Mark Lee", sales: 200_000, rank: 3 },
    { name: "Ralph Cruz", sales: 180_000, rank: 4 },
  ], []);

  const mockCustomers = useMemo(() => ({
    growth: [80, 95, 105, 120],
    labels: ["Q1", "Q2", "Q3", "Q4"],
    topCustomers: [
      { name: "ABC Corp", revenue: 320_000 },
      { name: "XYZ Ltd", revenue: 280_000 },
      { name: "Global Tech", revenue: 250_000 },
    ],
    retention: 92,
    churn: 8,
  }), []);

  const summaryInsights = useMemo(() => [
    { label: "Sales ↑ 12% MoM", status: "good" },
    { label: "New Client Growth ↑ 15%", status: "good" },
    { label: "South Region ↓ 5% vs Target", status: "warning" },
    { label: "Top Rep: John Doe (+18%)", status: "good" },
  ], []);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">Manager Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {(["overview", "customers", "salesman", "summary"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm md:text-base transition-colors ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab === "salesman" ? "Salespeople" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* ===== Overview Tab ===== */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard title="Total Sales" value={mockKPI.totalSales} formatValue={formatPHP} />
              <KPICard title="New Clients" value={mockKPI.newClients} formatValue={formatNumber} />
              <KPICard
                title="Retention Rate"
                value={mockKPI.retentionRate}
                subtitle="Customer Retention"
                formatValue={(v) => `${v}%`}
              />
              <KPICard
                title="Team Performance"
                value={mockKPI.teamPerformance}
                subtitle="Target Achievement"
                formatValue={(v) => `${v}%`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Sales Trend</h2>
                <div className="h-48">
                  {loading ? (
                    <ChartSkeleton />
                  ) : (
                    <Line
                      data={{
                        labels: mockSalesTrend.labels,
                        datasets: [
                          {
                            label: "Sales",
                            data: mockSalesTrend.values,
                            borderColor: "#3b82f6",
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            borderWidth: 2,
                            fill: true,
                            tension: 0.3,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false } },
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (v) => `₱${(v as number / 1000).toFixed(0)}K`,
                            },
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Sales by Region</h2>
                <div className="h-48">
                  {loading ? (
                    <ChartSkeleton />
                  ) : (
                    <Bar
                      data={{
                        labels: mockDepartmentSales.labels,
                        datasets: [
                          {
                            label: "Region Sales",
                            data: mockDepartmentSales.values,
                            backgroundColor: "#8b5cf6",
                            borderColor: "#7c3aed",
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false } },
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (v) => `₱${(v as number / 1000).toFixed(0)}K`,
                            },
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Top Performing Employees</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="py-2 px-3 font-medium">Rank</th>
                      <th className="py-2 px-3 font-medium">Name</th>
                      <th className="py-2 px-3 font-medium">Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockTopEmployees.map((emp) => (
                      <tr key={emp.rank} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-700">{emp.rank}</td>
                        <td className="py-2 px-3 font-medium text-gray-800">{emp.name}</td>
                        <td className="py-2 px-3 text-gray-700">{formatPHP(emp.sales)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ===== Customers Tab ===== */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KPICard title="Active Customers" value={360} formatValue={formatNumber} />
              <KPICard
                title="Retention Rate"
                value={mockCustomers.retention}
                formatValue={(v) => `${v}%`}
                subtitle="vs last quarter"
              />
              <KPICard
                title="Churn Rate"
                value={mockCustomers.churn}
                formatValue={(v) => `${v}%`}
                subtitle="At risk"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Customer Growth</h2>
                <div className="h-48">
                  {loading ? (
                    <ChartSkeleton />
                  ) : (
                    <Line
                      data={{
                        labels: mockCustomers.labels,
                        datasets: [
                          {
                            label: "New Customers",
                            data: mockCustomers.growth,
                            borderColor: "#10b981",
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            borderWidth: 2,
                            fill: true,
                            tension: 0.3,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false } },
                          y: { beginAtZero: true },
                        },
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Top Customers</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="py-2 px-3 font-medium">Customer</th>
                        <th className="py-2 px-3 font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockCustomers.topCustomers.map((c, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium text-gray-800">{c.name}</td>
                          <td className="py-2 px-3 text-gray-700">{formatPHP(c.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Salespeople Tab ===== */}
        {activeTab === "salesman" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <KPICard
                title="Total Salespeople"
                value={mockTopEmployees.length}
                formatValue={formatNumber}
              />
              <KPICard
                title="Avg. Performance"
                value={86}
                formatValue={(v) => `${v}%`}
                subtitle="vs quota"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Performance by Rep</h2>
                <div className="h-56">
                  {loading ? (
                    <ChartSkeleton />
                  ) : (
                    <Bar
                      data={{
                        labels: mockTopEmployees.map((e) => e.name),
                        datasets: [
                          {
                            label: "Sales",
                            data: mockTopEmployees.map((e) => e.sales),
                            backgroundColor: "#3b82f6",
                            borderColor: "#2563eb",
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: "y",
                        plugins: { legend: { display: false } },
                        scales: {
                          x: {
                            beginAtZero: true,
                            ticks: {
                              callback: (v) => `₱${(v as number / 1000).toFixed(0)}K`,
                            },
                          },
                          y: { grid: { display: false } },
                        },
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Sales Leaderboard</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="py-2 px-3 font-medium">Rank</th>
                        <th className="py-2 px-3 font-medium">Salesperson</th>
                        <th className="py-2 px-3 font-medium">Sales</th>
                        <th className="py-2 px-3 font-medium">Target %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockTopEmployees.map((emp) => (
                        <tr key={emp.rank} className="hover:bg-gray-50">
                          <td className="py-2 px-3 font-bold text-blue-600">#{emp.rank}</td>
                          <td className="py-2 px-3 font-medium text-gray-800">{emp.name}</td>
                          <td className="py-2 px-3 text-gray-700">{formatPHP(emp.sales)}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                                emp.sales >= 230_000
                                  ? "bg-green-100 text-green-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {Math.round((emp.sales / 250_000) * 100)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Summary Tab ===== */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard title="Total Sales" value={mockKPI.totalSales} formatValue={formatPHP} />
              <KPICard title="New Clients" value={mockKPI.newClients} formatValue={formatNumber} />
              <KPICard
                title="Team Avg"
                value={mockKPI.teamPerformance}
                // ✅ FIX: was (v) => v (number), now (v) => `${v}%` or String
                formatValue={(v) => `${v}%`}
              />
              <KPICard
                title="Top Rep"
                value={mockTopEmployees[0].name}
                // ✅ FIX: (v) => v is OK if value is string — but name is string, so this is fine
                // ✅ Optional: use `formatValue={identity}` or just omit if `value` is string and KPICard handles it
                formatValue={(v) => v}
                subtitle={`+18% vs target`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Key Insights</h2>
                <div className="space-y-2">
                  {summaryInsights.map((insight, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg flex items-start text-sm ${
                        insight.status === "good"
                          ? "bg-green-50 border-l-3 border-green-500"
                          : "bg-amber-50 border-l-3 border-amber-500"
                      }`}
                    >
                      <span className="mr-2 mt-0.5">
                        {insight.status === "good" ? "✅" : "⚠️"}
                      </span>
                      <span className="text-gray-700">{insight.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Recent Trends</h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>June: +₱200K sales (↑12.5%)</li>
                    <li>New clients: +20 this month</li>
                    <li>South region lags by 8%</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Recommended Actions</h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Schedule coaching for South team</li>
                    <li>Reward top 3 performers</li>
                    <li>Follow up with 15 at-risk clients</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}