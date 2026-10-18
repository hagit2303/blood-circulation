// Schematic front view of the heart (viewer's left = the person's right side).
// heartSVG(opts): opts.labels (bool), opts.hl (part id to highlight), opts.spots (array of {n,x,y}),
// opts.coronary (bool), opts.pacer (bool), opts.flow (bool)
function heartSVG(o){
  o=o||{};
  const P='#2457C5',R='#D7263D',M='#E9C3BE',MS='#B8857E',INK='#13233A';
  const hl=id=>o.hl===id?' class="hl"':'';
  const lab=(x,y,t,a)=>o.labels?`<text x="${x}" y="${y}" text-anchor="${a||'middle'}" class="lb">${t}</text>`:'';
  const spots=(o.spots||[]).map(s=>`<g class="spot" data-n="${s.n}" tabindex="0" role="button" aria-label="מבנה ${s.n}"><circle cx="${s.x}" cy="${s.y}" r="13"/><text x="${s.x}" y="${s.y+5}" text-anchor="middle">${s.n}</text></g>`).join('');
  const cor=o.coronary?`<g class="cor" fill="none" stroke="#8E0E22" stroke-width="5" stroke-linecap="round">
    <path d="M218,246 C190,250 150,252 110,256 C90,262 80,290 86,330"/>
    <path d="M252,246 C280,250 300,262 318,280 C330,320 320,370 280,410"/>
    <path d="M252,246 C246,290 236,340 232,400"/>
    <circle cx="218" cy="246" r="4" fill="#8E0E22"/><circle cx="252" cy="246" r="4" fill="#8E0E22"/></g>`:'';
  const pacer=o.pacer?`<g class="pacer"><circle cx="112" cy="152" r="11" fill="#F2B705" stroke="${INK}" stroke-width="2"/>
    <path d="M112,163 C120,200 150,226 196,246" fill="none" stroke="#F2B705" stroke-width="3" stroke-dasharray="5 5"/>
    ${o.labels?`<text x="60" y="128" class="lb" text-anchor="middle">קוצב הלב</text>`:''}</g>`:'';
  const flow=o.flow?`<g class="flow" fill="none" stroke-width="3" marker-end="url(#ah)">
    <path d="M110,40 L110,120" stroke="#fff"/><path d="M120,210 L130,290" stroke="#fff"/><path d="M180,320 L181,210" stroke="#fff"/>
    <path d="M386,164 L340,165" stroke="#fff"/><path d="M386,208 L340,207" stroke="#fff"/><path d="M43,430 L43,250" stroke="#fff"/><path d="M290,62 L290,118" stroke="#fff"/><path d="M318,85 L372,85" stroke="#fff"/><path d="M150,93 L40,93" stroke="#fff"/><path d="M290,210 L280,290" stroke="#fff"/><path d="M262,340 L236,200" stroke="#fff"/></g>`:'';
  return `<svg viewBox="0 0 420 450" class="heart" role="img" aria-label="איור סכמטי של חתך הלב">
  <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#fff"/></marker></defs>
  <!-- heart muscle -->
  <path d="M84,134 Q60,138 60,170 L60,250 Q62,312 112,362 Q170,424 236,430 Q304,420 336,346 Q352,296 348,232 L348,170 Q348,134 316,132 Z" fill="${M}" stroke="${MS}" stroke-width="3"/>
  <!-- pulmonary arteries (behind the aorta) -->
  <g${hl('pa')}>
    <path d="M165,262 L165,96 Q165,72 186,72 L380,72 L380,98 L197,98 L197,262z" fill="${P}" stroke="${INK}" stroke-width="2"/>
    <path d="M165,98 Q150,80 130,82 L22,82 L22,104 L130,104 Q150,104 165,120z" fill="${P}" stroke="${INK}" stroke-width="2"/></g>
  <!-- superior / inferior vena cava -->
  <g${hl('svc')}><path d="M94,18 L128,18 L128,150 L94,150z" fill="${P}" stroke="${INK}" stroke-width="2"/></g>
  <g${hl('ivc')}><path d="M30,440 L30,226 Q30,206 50,206 L80,206 L80,232 L56,232 L56,440z" fill="${P}" stroke="${INK}" stroke-width="2"/></g>
  <!-- chambers -->
  <g${hl('ra')}><path d="M76,150 Q76,142 86,142 L150,142 Q160,142 160,152 L160,230 Q160,240 150,240 L86,240 Q76,240 76,230z" fill="${P}"/></g>
  <g${hl('rv')}><path d="M70,258 L196,258 L196,372 Q176,398 146,382 Q96,338 74,292z" fill="${P}"/></g>
  <g${hl('la')}><path d="M262,142 L322,142 Q332,142 332,152 L332,228 Q332,238 322,238 L272,238 Q262,238 262,228z" fill="${R}"/></g>
  <g${hl('lv')}><path d="M222,262 L298,262 Q314,262 314,280 L312,330 Q298,386 252,396 Q226,394 224,370z" fill="${R}"/></g>
  <g${hl('sep')}><path d="M196,258 L222,262 L224,370 Q214,382 196,372z" fill="${M}" stroke="${MS}" stroke-width="1.5"/></g>
  <!-- pulmonary veins -->
  <g${hl('pv')}><path d="M330,156 L390,152 L390,172 L330,176z M330,196 L390,198 L390,218 L330,216z" fill="${R}" stroke="${INK}" stroke-width="2"/></g>
  <!-- aorta -->
  <g${hl('ao')}><path d="M220,262 L220,70 Q220,30 262,30 Q304,30 304,70 L304,130 L280,130 L280,72 Q280,56 262,56 Q246,56 246,72 L246,262z" fill="${R}" stroke="${INK}" stroke-width="2"/>
    <path d="M236,34 L232,6 L246,6 L250,32z M262,30 L262,4 L276,4 L276,31z M286,36 L294,8 L307,12 L298,42z" fill="${R}" stroke="${INK}" stroke-width="1.5"/></g>
  <!-- valves -->
  <g${hl('av')} fill="#fff" stroke="${INK}" stroke-width="2"><path d="M96,241 L118,241 L110,268z M126,241 L150,241 L140,268z"/><path d="M268,239 L288,239 L280,266z M296,239 L320,239 L308,266z"/></g>
  <g${hl('sl')} fill="#fff" stroke="${INK}" stroke-width="2"><path d="M166,250 Q174,236 180,250z M181,250 Q188,236 196,250z"/><path d="M221,250 Q228,236 233,250z M234,250 Q240,236 245,250z"/></g>
  ${cor}${pacer}${flow}
  ${lab(111,10,'וריד נבוב עליון')}${lab(118,196,'עלייה ימנית')}${lab(134,322,'חדר ימני')}${lab(297,196,'עלייה שמאלית')}${lab(268,330,'חדר שמאלי')}
  ${lab(352,30,'אבי העורקים')}${lab(362,118,'עורק הריאה')}${lab(58,62,'עורק הריאה')}${lab(372,244,'ורידי הריאה')}${lab(112,444,'וריד נבוב תחתון')}
  ${spots}
  </svg>`;
}
const HEART_CSS=`.heart{width:100%;height:auto;max-height:72vh;font-family:Assistant,Arial,sans-serif}
.heart .lb{font-size:17px;font-weight:800;fill:#13233A;paint-order:stroke;stroke:#fff;stroke-width:4px}
.heart .hl{filter:drop-shadow(0 0 0 #F2B705) drop-shadow(0 0 6px #F2B705)}
.heart .hl path{stroke:#F2B705!important;stroke-width:4!important}
.heart .spot circle{fill:#fff;stroke:#13233A;stroke-width:2.5}.heart .spot text{font-size:14px;font-weight:800;fill:#13233A;pointer-events:none}
.heart .spot{cursor:pointer}.heart .spot.cur circle{fill:#F2B705}.heart .spot.good circle{fill:#1E7B4D;stroke:#1E7B4D}.heart .spot.good text{fill:#fff}
.heart .spot.bad circle{fill:#B3261E;stroke:#B3261E}.heart .spot.bad text{fill:#fff}`;
