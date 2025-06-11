'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect } from 'react';

export function WebVitals() {
  useReportWebVitals((metric) => {
    //console.log(metric);
    // You can later send this to Plausible or your custom analytics pipeline.
  });

  // Always return valid ReactNode — even if invisible
  return null;
}
