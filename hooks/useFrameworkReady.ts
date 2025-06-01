import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    try {
      window.frameworkReady?.();
    } catch (error) {
      console.error('Framework ready hook failed:', error);
    }
  }, []); // Added dependency array
}