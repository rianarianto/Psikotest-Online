import React, { JSX, PropsWithChildren, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon2 from '@/components/app-logo-icon2'; // Pastikan path ini benar
import type { SharedData } from '@/types'; // Memperbaiki typo di sini

// Interface untuk item navigasi sidebar
interface NavItem {
    name: string;
    route?: string; // Route opsional, untuk item header tidak ada route
    icon: JSX.Element;
    disabled?: boolean; // Properti untuk menonaktifkan link
    isHeader?: boolean; // Properti untuk menandai item sebagai header grup
    children?: NavItem[]; // New property for dropdown items
}

// Interface untuk props layout
interface AdminLayoutProps extends PropsWithChildren {
    auth: SharedData['auth'];
    pageTitle: string; // Prop untuk judul halaman
}

export default function AdminLayout({ children, auth, pageTitle }: AdminLayoutProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null); // State for dropdown
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile sidebar

    const toggleDropdown = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Navigasi item untuk sidebar
    const navItems: NavItem[] = [
        {
            name: 'Dashboard', route: 'dashboard', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
            )
        },
        {
            name: 'Token', route: 'admin.tokens.index', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 8h14"></path>
                    <path d="M5 12h14"></path>
                    <path d="M5 16h14"></path>
                    <circle cx="7" cy="8" r="2"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                    <circle cx="17" cy="16" r="2"></circle>
                </svg>
            )
        },
        {
            name: 'Data Peserta', route: 'admin.participants.index', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            )
        },

        // --- Bagian Manajemen Tes (Dropdown) ---
        {
            name: 'Manajemen Tes',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            ),
            children: [
                {
                    name: 'Pengaturan PapiKostick', route: 'admin.papikostick.settings', icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.82.33z"></path>
                        </svg>
                    )
                },
                // { name: 'Hasil PapiKostick', route: 'admin.papikostick.index', icon: (
                //     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                //         <polyline points="22 12 16 12 14 16 10 16 8 12 2 12"></polyline>
                //         <line x1="12" y1="2" x2="12" y2="22"></line>
                //     </svg>
                // )},
            ]
        },
    ];

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
            {/* Overlay untuk mobile sidebar */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={toggleMobileMenu} // Menutup sidebar saat overlay diklik
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-white dark:bg-[#1e1e1e] p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-screen // Changed h-full to h-screen
                fixed inset-y-0 left-0 z-50
                transform transition-all duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none'}
                lg:translate-x-0 lg:fixed lg:top-0 lg:left-0 lg:shadow-none lg:opacity-100 lg:pointer-events-auto // Added lg:fixed lg:top-0 lg:left-0
            `}>
                <div className="flex mb-10 justify-between items-center mb-10 relative">
                    {/* Mengganti "Admin Panel" dengan Logo dan Nama Perusahaan */}
                    <div className="flex items-center gap-2">
                        {/* Menggunakan AppLogoIcon2 yang diimpor */}
                        <AppLogoIcon2 className="w-10 fill-current text-black dark:text-white" />
                        <span className="text-sm font-bold text-black dark:text-white">Yogura Tekindo</span>
                    </div>
                    {/* Tombol Tutup untuk sidebar mobile */}
                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md p-1"
                        aria-label="Tutup menu"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>

                </div>
                <nav className="space-y-1 flex-grow overflow-y-auto">
                    {navItems.map((item) => {
                        if (item.children) {
                            const isOpen = openDropdown === item.name;
                            return (
                                <div key={item.name}>
                                    <button
                                        onClick={() => toggleDropdown(item.name)}
                                        className={`flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group
                                            ${isOpen
                                                ? 'bg-[#DBA552] text-white shadow-sm'
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2a2a2a]'
                                            }
                                        `}
                                    >
                                        <span className="flex items-center gap-3">
                                            {item.icon}
                                            <span>{item.name}</span>
                                        </span>
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}
                                                ${isOpen ? 'text-white' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'}
                                            `}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                        </svg>
                                    </button>
                                    {isOpen && (
                                        <div className="ml-6 mt-1 space-y-1 border-l border-gray-300 dark:border-gray-600 pl-3 transition-all duration-200 ease-in-out overflow-hidden">
                                            {item.children.map(child => {
                                                const isRouteFunctionAvailable = typeof route === 'function' && child.route;
                                                const linkHref: string = isRouteFunctionAvailable ? route(child.route!) : '#';
                                                let isActive: boolean = false;

                                                if (isRouteFunctionAvailable) {
                                                    try {
                                                        const routeInstance = route();
                                                        if (typeof routeInstance === 'object' && routeInstance !== null && typeof routeInstance.current === 'function') {
                                                            isActive = routeInstance.current(child.route!);
                                                        } else {
                                                            isActive = window.location.pathname === new URL(linkHref, window.location.origin).pathname;
                                                        }
                                                    } catch (e) {
                                                        console.error("Error checking active route with Ziggy:", e);
                                                        isActive = window.location.pathname === new URL(linkHref, window.location.origin).pathname;
                                                    }
                                                }

                                                return (
                                                    <Link
                                                        key={child.name}
                                                        href={linkHref}
                                                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 group
                                                            ${isActive
                                                                ? 'bg-[#DBA552] text-white shadow-sm'
                                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2a2a2a]'
                                                            }
                                                            ${child.disabled || !isRouteFunctionAvailable ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                                                        `}
                                                        disabled={child.disabled || !isRouteFunctionAvailable}
                                                    >
                                                        {child.icon}
                                                        <span>{child.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        } else if (item.isHeader) {
                            return (
                                <div key={item.name} className="flex items-center gap-3 px-4 py-2 mt-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    {item.icon}
                                    <span>{item.name}</span>
                                </div>
                            );
                        } else { // Regular link
                            const isRouteFunctionAvailable = typeof route === 'function' && item.route;
                            const linkHref: string = isRouteFunctionAvailable ? route(item.route!) : '#';
                            let isActive: boolean = false;

                            if (isRouteFunctionAvailable) {
                                try {
                                    const routeInstance = route();
                                    if (typeof routeInstance === 'object' && routeInstance !== null && typeof routeInstance.current === 'function') {
                                        isActive = routeInstance.current(item.route!);
                                    } else {
                                        isActive = window.location.pathname === new URL(linkHref, window.location.origin).pathname;
                                    }
                                } catch (e) {
                                    console.error("Error checking active route with Ziggy:", e);
                                    isActive = window.location.pathname === new URL(linkHref, window.location.origin).pathname;
                                }
                            }

                            return (
                                <Link
                                    key={item.name}
                                    href={linkHref}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 group
                                        ${isActive
                                            ? 'bg-[#DBA552] text-white shadow-sm'
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2a2a2a]'
                                        }
                                        ${item.disabled || !isRouteFunctionAvailable ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                                    `}
                                    disabled={item.disabled || !isRouteFunctionAvailable}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            );
                        }
                    })}
                </nav>

                {/* This div containing the logout link is already set to push to the bottom */}
                <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
                    {/* Link Logout */}
                    <Link
                        href={typeof route === 'function' ? route('logout') : '#'}
                        method="post"
                        as="button"
                        className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900 transition-colors duration-200 w-full"
                        disabled={typeof route !== 'function'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Keluar</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            {/* Wrapper div to handle desktop margin and mobile full width */}
            <div className="flex-1 relative z-0 overflow-x-hidden lg:ml-64"> {/* Menambahkan lg:ml-64 di sini */}
                <main className="p-6 lg:p-8 overflow-y-auto min-h-screen">
                    {/* Header Main Content */}
                    <div className="flex items-center place-content-between justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                        {/* Hamburger menu for mobile */}
                        <button
                            onClick={toggleMobileMenu}
                            className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-[#DBA552] focus:outline-none focus:ring-2 focus:ring-[#DBA552] rounded-md transition-colors duration-200"
                            aria-label="Toggle menu"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <h1 className="text-lg lg:text-2xl font-extrabold text-[#1b1b18] dark:text-white tracking-tight lg:ml-0">{pageTitle}</h1>
                    </div>

                    {/* Konten spesifik halaman akan dirender di sini */}
                    <div>
                        {children}
                    </div>

                </main>
            </div>
        </div>
    );
}
