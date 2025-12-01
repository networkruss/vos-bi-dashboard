// src/components/shared/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  role?: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Executive Dashboard',
    href: '/bi/executive',
    icon: LayoutDashboard,
    role: ['executive'],
  },
  {
    title: 'Manager Dashboard',
    href: '/bi/manager',
    icon: TrendingUp,
    role: ['manager', 'executive'],
  },
  {
    title: 'Salesman Dashboard',
    href: '/bi/salesman',
    icon: Users,
    role: ['salesman'],
  },
  {
    title: 'Encoder Dashboard',
    href: '/bi/encoder',
    icon: Package,
    role: ['encoder'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold">
              V
            </div>
            <div>
              <h1 className="text-lg font-bold">VOS BI</h1>
              <p className="text-xs text-muted-foreground">Sales Dashboard</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold mx-auto">
            V
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100',
                isActive && 'bg-blue-50 text-blue-600 font-medium',
                !isActive && 'text-gray-700',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="border-t p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-all hover:bg-gray-100',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
              NR
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Neil Russel</p>
              <p className="text-xs text-muted-foreground">Manager</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}