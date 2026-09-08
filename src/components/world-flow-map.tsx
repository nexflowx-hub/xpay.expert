const nodes = [
  { x: 455, y: 148, code: 'GB', label: 'UK' },
  { x: 475, y: 168, code: 'FR', label: 'FR' },
  { x: 447, y: 191, code: 'PT', label: 'PT' },
  { x: 218, y: 173, code: 'US', label: 'USA' },
  { x: 356, y: 322, code: 'BR', label: 'BR' }
];

const routes = [
  'M218 173 C320 70 390 95 455 148',
  'M218 173 C330 105 410 122 475 168',
  'M218 173 C330 145 390 170 447 191',
  'M455 148 C420 220 395 275 356 322',
  'M475 168 C425 230 400 280 356 322',
  'M447 191 C405 240 385 285 356 322'
];

export function WorldFlowMap() {
  return (
    <div className="worldflow" aria-label="Rede internacional XPay Expert">
      <div className="worldflow-head">
        <span className="live-dot" />
        <span>Global Operations Network</span>
        <small>Entity · Banking · Acquiring · Infrastructure</small>
      </div>
      <svg viewBox="0 0 760 390" role="img" aria-label="Mapa operacional com fluxos internacionais">
        <defs>
          <linearGradient id="land" x1="0" x2="1">
            <stop offset="0%" stopColor="#16302d" />
            <stop offset="100%" stopColor="#0f1b20" />
          </linearGradient>
          <linearGradient id="flow" x1="0" x2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity=".25" />
            <stop offset="50%" stopColor="#5eead4" stopOpacity=".95" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity=".2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g className="gridlines" opacity=".18">
          {[80,140,200,260,320].map(y => <line key={`h${y}`} x1="30" y1={y} x2="730" y2={y} />)}
          {[90,190,290,390,490,590,690].map(x => <line key={`v${x}`} x1={x} y1="40" x2={x} y2="350" />)}
        </g>

        <g className="landmass" fill="url(#land)" stroke="#24433f" strokeWidth="1.1">
          <path d="M64 119 L103 83 159 69 204 83 238 110 229 135 190 148 168 176 130 169 110 148 75 150 53 135 Z" />
          <path d="M178 210 L214 220 239 255 229 293 211 335 188 347 174 316 183 286 164 253 158 226 Z" />
          <path d="M321 100 L360 75 413 71 455 88 487 109 524 112 548 137 528 159 489 156 462 172 432 164 410 181 378 174 349 150 322 142 Z" />
          <path d="M396 183 L436 190 460 219 455 254 435 294 406 309 385 282 380 242 365 214 Z" />
          <path d="M521 119 L577 105 633 119 677 145 689 174 660 195 622 190 596 174 563 183 536 166 Z" />
          <path d="M605 259 L650 250 686 269 690 299 661 316 624 309 601 287 Z" />
        </g>

        <g className="flows" fill="none" stroke="url(#flow)" strokeWidth="2.2">
          {routes.map((route, index) => (
            <path key={route} id={`route-${index}`} d={route} pathLength="100" />
          ))}
        </g>

        {routes.map((route, index) => (
          <circle key={`pulse-${index}`} r="4" fill="#72f5df" filter="url(#glow)" className="route-particle">
            <animateMotion dur={`${3.5 + index * .55}s`} repeatCount="indefinite" path={route} begin={`${index * .45}s`} />
          </circle>
        ))}

        <g className="mapnodes">
          {nodes.map(node => (
            <g key={node.code} transform={`translate(${node.x} ${node.y})`}>
              <circle r="13" className="node-ring" />
              <circle r="4" className="node-core" />
              <text x="18" y="4" className="node-label">{node.label}</text>
            </g>
          ))}
        </g>
      </svg>
      <div className="worldflow-foot">
        <span><b>EUR</b> SEPA / Banking</span>
        <span><b>BRL</b> PIX</span>
        <span><b>USDT</b> Multi-network</span>
        <span><b>XPAY</b> Store provisioning</span>
      </div>
    </div>
  );
}
