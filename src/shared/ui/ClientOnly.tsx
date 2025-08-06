'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function ClientOnlyComponent({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Use dynamic import to ensure no SSR
const ClientOnly = dynamic(() => Promise.resolve(ClientOnlyComponent), {
  ssr: false,
});

export default ClientOnly;