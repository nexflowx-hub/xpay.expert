import type { MetadataRoute } from 'next';
import { services } from '@/lib/services';

export default function sitemap(): MetadataRoute.Sitemap {
  const base='https://xpay.expert';
  return [{url:base,priority:1},{url:`${base}/portal`,priority:.7},...services.map(s=>({url:`${base}/services/${s.slug}`,priority:.8}))];
}
