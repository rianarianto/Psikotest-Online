import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}


// resources/js/types/index.d.ts

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
}

export interface SharedData {
    auth: {
        user: User;
    };
    flash: { // Menambahkan definisi untuk flash messages
        success?: string;
        error?: string;
        info?: string; // Opsional, jika Anda juga menggunakan info messages
    };
    ziggy: {
        location: string;
        query: Record<string, string>;
        port: number | null;
        url: string;
        routes: Record<string, any>;
    };
}

// Deklarasi global untuk fungsi route() dari Ziggy
// Ini penting agar TypeScript mengenali window.route() dan route()
declare global {
    interface Window {
        route: (name: string, params?: any, absolute?: boolean) => string;
    }
    function route(name: string, params?: any, absolute?: boolean): string;
}

