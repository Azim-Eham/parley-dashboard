'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Briefcase,
  Building,
  BarChart,
  Calendar,
  Settings,
  UserCircle,
  Search
} from 'lucide-react';

function NavItem({ href, icon: Icon, label, active = false }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 mt-1 rounded-md text-sm font-medium transition-colors ${
        active 
          ? 'bg-orange-50 text-orange-600' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${active ? 'text-orange-600' : 'text-gray-400'}`} />
      {label}
    </Link>
  );
}

function SidebarSection({ title }: { title: string }) {
  return (
    <h3 className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
      {title}
    </h3>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col hidden md:flex h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center text-orange-600 font-bold text-xl gap-2">
          <div className="w-6 h-6 bg-orange-600 rounded-md text-white flex items-center justify-center text-sm">P</div>
          Parley
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>

        <SidebarSection title="Lead Management" />
        <NavItem href="/" icon={Home} label="Dashboard" active={pathname === '/'} />
        <NavItem href="/leads" icon={Users} label="All Leads" active={pathname.startsWith('/leads')} />
        <NavItem href="/contacts" icon={UserCircle} label="Contacts" active={pathname.startsWith('/contacts')} />
        <NavItem href="/companies" icon={Building} label="Companies" active={pathname.startsWith('/companies')} />

        <SidebarSection title="Pipeline" />
        <NavItem href="/deals" icon={Briefcase} label="Deals" active={pathname.startsWith('/deals')} />
        <NavItem href="/activities" icon={Calendar} label="Activities" active={pathname.startsWith('/activities')} />

        <SidebarSection title="Analytics" />
        <NavItem href="/reports" icon={BarChart} label="Reports" active={pathname.startsWith('/reports')} />

        <SidebarSection title="System Options" />
        <NavItem href="/settings" icon={Settings} label="Settings" active={pathname.startsWith('/settings')} />
      </div>
    </div>
  );
}
