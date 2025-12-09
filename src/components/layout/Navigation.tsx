'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/members', label: 'Members', icon: '👥' },
  { href: '/families', label: 'Families', icon: '👨‍👩‍👧‍👦' },
  { href: '/seasons', label: 'Seasons', icon: '📅' },
  { href: '/workshops', label: 'Workshops', icon: '🎨' },
  { href: '/registrations', label: 'Registrations', icon: '📝' },
  { href: '/payments', label: 'Payments', icon: '💰' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-blue-900 text-white">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            AFDA
          </Link>
          <div className="flex gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-md transition ${
                    isActive
                      ? 'bg-blue-700 font-semibold'
                      : 'hover:bg-blue-800'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}