"use client";

import { useState, useMemo } from "react";
import { KPICard, formatCurrency, formatNumber } from "@/components/dashboard/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, CheckCircle, XCircle, Clock, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";

// ------------------ Types ------------------
type EncoderKPI = {
  pendingInvoices: number;
  encodedToday: number;
  validationErrors: number;
  avgProcessingTime: number; // in minutes
};

type Entry = {
  id: number;
  invoiceNo: string;
  date: string;
  encoder?: string;
  customer: string;
  amount: number;
  status: "Pending" | "Encoded" | "With Errors";
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  errorType?: string;
  assignedTo?: string;
};

// ------------------ Component ------------------
export default function EncoderDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Encoded" | "With Errors">("All");
  const [sortBy, setSortBy] = useState<"dueDate" | "amount">("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Mock KPI Data
  const mockKPI: EncoderKPI = useMemo(() => ({
    pendingInvoices: 45,
    encodedToday: 28,
    validationErrors: 7,
    avgProcessingTime: 12.5,
  }), []);

  // Mock Entries - “Invoices to Encode”
  const mockEntries: Entry[] = useMemo(() => [
    { id: 1, invoiceNo: "INV-2024-001", date: "2024-06-28", encoder: "Juan Dela Cruz", customer: "ABC Retail Corp", amount: 125000, status: "Encoded", dueDate: "2024-07-05", priority: "High" },
    { id: 2, invoiceNo: "INV-2024-002", date: "2024-06-29", encoder: undefined, customer: "XYZ Supermarket", amount: 98000, status: "Pending", dueDate: "2024-07-01", priority: "High" },
    { id: 3, invoiceNo: "INV-2024-003", date: "2024-06-27", encoder: "Pedro Reyes", customer: "Best Buy Store", amount: 87000, status: "With Errors", dueDate: "2024-06-30", priority: "High", errorType: "Missing Salesman", assignedTo: "Maria Santos" },
    { id: 4, invoiceNo: "INV-2024-004", date: "2024-06-25", encoder: "Ana Garcia", customer: "Metro Mart", amount: 75000, status: "Encoded", dueDate: "2024-07-10", priority: "Medium" },
    { id: 5, invoiceNo: "INV-2024-005", date: "2024-06-26", encoder: undefined, customer: "Home Center", amount: 68000, status: "Pending", dueDate: "2024-07-03", priority: "Medium" },
    { id: 6, invoiceNo: "INV-2024-006", date: "2024-06-24", encoder: "Carlos Mendoza", customer: "Tech Hub", amount: 55000, status: "With Errors", dueDate: "2024-06-28", priority: "High", errorType: "Negative Total", assignedTo: "Pedro Reyes" },
  ], []);

  // Mock Validation Issues (separate panel)
  const mockValidationIssues = useMemo(() => [
    { invoiceNo: "INV-2024-003", errorType: "Missing Salesman/Division/Supplier", customer: "Best Buy Store", assignedTo: "Maria Santos", status: "Pending Fix" },
    { invoiceNo: "INV-2024-006", errorType: "Negative Totals", customer: "Tech Hub", assignedTo: "Pedro Reyes", status: "Pending Fix" },
  ], []);

  // Filter entries by search and status
  const filteredEntries = useMemo(() => {
    let result = mockEntries;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        e =>
          e.invoiceNo.toLowerCase().includes(query) ||
          e.customer.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(e => e.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "dueDate") {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });

    return result;
  }, [searchQuery, statusFilter, sortBy, sortOrder]);

  // Toggle sort direction
  const handleSortToggle = (field: "dueDate" | "amount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Encoder Dashboard</h1>
        <p className="text-muted-foreground">Manage workload and fix data-quality issues in sales invoices.</p>
      </div>

      {/* Search & Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by Invoice No or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "All" | "Pending" | "Encoded" | "With Errors")}
            className="border rounded px-2 py-1 min-w-[150px]"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Encoding</option>
            <option value="Encoded">Encoded</option>
            <option value="With Errors">With Errors</option>
          </select>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Search
          </button>
        </CardContent>
      </Card>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Pending Invoices" value={mockKPI.pendingInvoices} formatValue={formatNumber} icon={Pencil} />
        <KPICard title="Encoded Today" value={mockKPI.encodedToday} formatValue={formatNumber} icon={CheckCircle} />
        <KPICard title="Validation Errors" value={mockKPI.validationErrors} formatValue={formatNumber} icon={AlertTriangle} />
        <KPICard title="Avg Processing Time (min)" value={mockKPI.avgProcessingTime} formatValue={(v) => `${v.toFixed(1)} min`} icon={Clock} />
      </div>

      {/* Invoices to Encode Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices to Encode</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSortToggle("invoiceNo")} className="cursor-pointer">
                  Invoice No
                </TableHead>
                <TableHead onClick={() => handleSortToggle("dueDate")} className="cursor-pointer">
                  Due Date {sortBy === "dueDate" && (sortOrder === "asc" ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />)}
                </TableHead>
                <TableHead>Encoder</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead onClick={() => handleSortToggle("amount")} className="cursor-pointer">
                  Amount {sortBy === "amount" && (sortOrder === "asc" ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />)}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.invoiceNo}</TableCell>
                  <TableCell>{entry.dueDate}</TableCell>
                  <TableCell>{entry.encoder || "— "}</TableCell>
                  <TableCell>{entry.customer}</TableCell>
                  <TableCell>{formatCurrency(entry.amount)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-white text-sm ${
                        entry.status === "Encoded" ? "bg-green-500" :
                        entry.status === "With Errors" ? "bg-red-500" :
                        "bg-yellow-500"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        entry.priority === "High" ? "bg-red-100 text-red-800" :
                        entry.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {entry.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button className="text-blue-600 hover:underline">Open</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Validation Issues Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Error Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockValidationIssues.map((issue, idx) => (
                <TableRow key={idx}>
                  <TableCell>{issue.invoiceNo}</TableCell>
                  <TableCell>{issue.errorType}</TableCell>
                  <TableCell>{issue.customer}</TableCell>
                  <TableCell>{issue.assignedTo}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-yellow-500 text-white rounded-full text-xs">
                      {issue.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button className="text-blue-600 hover:underline">Fix Now</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Considerations */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredEntries.length} of {mockEntries.length} invoices.
        </div>
        <div className="flex gap-2">
          <button className="text-blue-600 hover:underline text-sm">Previous</button>
          <span className="text-sm">Page 1 of 3</span>
          <button className="text-blue-600 hover:underline text-sm">Next</button>
          <button
            onClick={() => window.location.reload()}
            className="ml-4 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}