import styles from './world-flow-map.module.css';

type Position = [number, number];
type Ring = Position[];
type Polygon = Ring[];
type MultiPolygon = Polygon[];

type CountryFeature = {
  properties?: {
    CONTINENT?: string;
    ISO_A2?: string;
    NAME_EN?: string;
  };
  geometry?: {
    type?: 'Polygon' | 'MultiPolygon';
    coordinates?: Polygon | MultiPolygon;
  };
};

type FeatureCollection = {
  features?: CountryFeature[];
};

const WIDTH = 1200;
const HEIGHT = 560;
const LAT_MAX = 82;
const LAT_MIN = -58;

const project = ([lon, lat]: Position) => {
  const x = ((lon + 180) / 360) * WIDTH;
  const y = 28 + ((LAT_MAX - Math.max(LAT_MIN, Math.min(LAT_MAX, lat))) / (LAT_MAX - LAT_MIN)) * 500;
  return [x, y] as const;
};

const ringPath = (ring: Ring) => {
  if (!ring.length) return '';

  let d = '';
  let previousLon: number | null = null;

  ring.forEach((point, index) => {
    const [lon] = point;
    const [x, y] = project(point);
    const jump = previousLon !== null && Math.abs(lon - previousLon) > 180;

    if (index === 0 || jump) d += `M${x.toFixed(2)} ${y.toFixed(2)}`;
    else d += `L${x.toFixed(2)} ${y.toFixed(2)}`;

    previousLon = lon;
  });

  return `${d}Z`;
};

const geometryPath = (feature: CountryFeature) => {
  const geometry = feature.geometry;
  if (!geometry?.coordinates) return '';

  if (geometry.type === 'Polygon') {
    return (geometry.coordinates as Polygon).map(ringPath).join(' ');
  }

  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates as MultiPolygon)
      .flatMap((polygon) => polygon.map(ringPath))
      .join(' ');
  }

  return '';
};

const nodeDefs = [
  { lon: -0.13, lat: 51.51, code: 'GB', label: 'UK' },
  { lon: 2.35, lat: 48.86, code: 'FR', label: 'FR' },
  { lon: -9.14, lat: 38.72, code: 'PT', label: 'PT' },
  { lon: -74.0, lat: 40.71, code: 'US', label: 'USA' },
  { lon: -46.63, lat: -23.55, code: 'BR', label: 'BR' }
] as const;

const nodes = nodeDefs.map((node) => {
  const [x, y] = project([node.lon, node.lat]);
  return { ...node, x, y };
});

const node = (code: string) => nodes.find((item) => item.code === code)!;

const curve = (fromCode: string, toCode: string, lift = 70) => {
  const from = node(fromCode);
  const to = node(toCode);
  const mx = (from.x + to.x) / 2;
  const my = Math.min(from.y, to.y) - lift;
  return `M${from.x.toFixed(1)} ${from.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
};

const routes = [
  curve('US', 'GB', 92),
  curve('US', 'FR', 72),
  curve('US', 'PT', 48),
  curve('GB', 'BR', 74),
  curve('FR', 'BR', 56),
  curve('PT', 'BR', 38)
];

const fallbackCountries = [
  'M56 168 L115 115 197 97 266 116 302 155 284 197 225 212 196 250 133 239 98 207 54 207 32 187 Z',
  'M214 287 L266 302 297 350 285 403 255 482 216 505 194 463 207 414 181 358 174 316 Z',
  'M486 135 L540 99 629 94 701 117 750 148 819 154 862 190 831 219 764 215 722 238 675 227 638 253 590 245 543 212 487 201 Z',
  'M613 253 L679 263 714 305 707 356 678 424 632 446 596 407 589 349 566 309 Z',
  'M821 161 L906 141 1000 161 1070 198 1088 237 1042 265 982 258 943 236 892 250 849 226 Z',
  'M962 381 L1034 367 1091 393 1098 435 1051 459 992 449 955 419 Z'
];

async function loadCountries() {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) return [];
    const data = (await response.json()) as FeatureCollection;

    return (data.features || [])
      .filter((feature) => feature.properties?.CONTINENT !== 'Antarctica')
      .map((feature) => ({
        d: geometryPath(feature),
        code: feature.properties?.ISO_A2 || feature.properties?.NAME_EN || 'country'
      }))
      .filter((feature) => feature.d);
  } catch {
    return [];
  }
}

export async function WorldFlowMap() {
  const countries = await loadCountries();
  const detailed = countries.length > 100;

  return (
    <div className={`worldflow ${styles.hq}`} aria-label="Rede internacional XPay Expert">
      <div className="worldflow-head">
        <span className="live-dot" />
        <span>Global Operations Network</span>
        <small>Entity · Banking · Acquiring · Infrastructure</small>
      </div>

      <div className={styles.stage}>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Mapa geográfico operacional com fluxos internacionais" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="mapLand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#16362f" />
              <stop offset="55%" stopColor="#10251f" />
              <stop offset="100%" stopColor="#0b1719" />
            </linearGradient>
            <linearGradient id="flowHQ" x1="0" x2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity=".18" />
              <stop offset="48%" stopColor="#7df5df" stopOpacity="1" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity=".22" />
            </linearGradient>
            <radialGradient id="oceanGlow" cx="52%" cy="44%" r="65%">
              <stop offset="0%" stopColor="#0f2a29" stopOpacity=".42" />
              <stop offset="100%" stopColor="#071016" stopOpacity="0" />
            </radialGradient>
            <filter id="flowGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#oceanGlow)" />

          <g className={styles.geoGrid} aria-hidden="true">
            {[180, 360, 540, 720, 900, 1080].map((x) => <line key={`gx-${x}`} x1={x} y1="24" x2={x} y2="536" />)}
            {[120, 220, 320, 420].map((y) => <line key={`gy-${y}`} x1="22" y1={y} x2="1178" y2={y} />)}
          </g>

          <g className={styles.countryLayer}>
            {detailed
              ? countries.map((country, index) => (
                  <path key={`${country.code}-${index}`} d={country.d} className={styles.countryShape} vectorEffect="non-scaling-stroke" />
                ))
              : fallbackCountries.map((d, index) => (
                  <path key={`fallback-${index}`} d={d} className={`${styles.countryShape} ${styles.fallbackCountry}`} vectorEffect="non-scaling-stroke" />
                ))}
          </g>

          <g className={styles.flowsHq} fill="none" stroke="url(#flowHQ)" strokeWidth="2.4" vectorEffect="non-scaling-stroke">
            {routes.map((route, index) => <path key={`route-${index}`} d={route} pathLength="100" />)}
          </g>

          {routes.map((route, index) => (
            <circle key={`pulse-${index}`} r="4.5" fill="#8ffbe9" filter="url(#flowGlow)" className="route-particle">
              <animateMotion dur={`${4.1 + index * 0.48}s`} repeatCount="indefinite" path={route} begin={`${index * 0.55}s`} />
            </circle>
          ))}

          <g className="mapnodes">
            {nodes.map((item, index) => (
              <g key={item.code} transform={`translate(${item.x.toFixed(2)} ${item.y.toFixed(2)})`}>
                <circle r="18" className={styles.nodeHalo} style={{ animationDelay: `${index * 0.18}s` }} />
                <circle r="10" className="node-ring" />
                <circle r="4" className="node-core" />
                <text x="16" y="4" className="node-label">{item.label}</text>
              </g>
            ))}
          </g>
        </svg>

        <div className={styles.qualityPill}>Natural Earth · Vector Network</div>
      </div>

      <div className="worldflow-foot">
        <span><b>EUR</b> SEPA / Banking</span>
        <span><b>BRL</b> PIX</span>
        <span><b>USDT</b> Multi-network</span>
        <span><b>XPAY</b> Store provisioning</span>
      </div>
    </div>
  );
}
