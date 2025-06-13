'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';

export function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Don't show navbar on the landing page (root path)
  if (pathname === '/') {
    return null;
  }
  
  return <Navbar />;
} 