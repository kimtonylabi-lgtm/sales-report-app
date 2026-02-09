'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, List, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: '작성', href: '/', icon: Home },
        { label: '히스토리', href: '/history', icon: History },
        { label: '내 보고', href: '/reports', icon: List },
        { label: '팀장', href: '/leader', icon: Shield },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 glass safe-bottom z-50">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive ? "text-primary" : "text-gray-500"
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
