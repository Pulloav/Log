/* CL14 · Logística — lógica de la aplicación (sin dependencias, funciona offline). */
(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s),
    $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const E = (x) =>
    String(x ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const N = (x) =>
    String(x ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  const num = (x) => {
    if (typeof x === "number") return Number.isFinite(x) ? x : 0;
    let v = String(x ?? "")
      .trim()
      .replace(/[\s$]/g, "");
    if (!v) return 0;
    if (v.includes(",") && v.includes("."))
      v = v.lastIndexOf(",") > v.lastIndexOf(".") ? v.replace(/\./g, "").replace(",", ".") : v.replace(/,/g, "");
    else if (v.includes(",")) v = v.replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(v)) v = v.replace(/\./g, "");
    return Number(v) || 0;
  };
  const fmt = (x) => num(x).toLocaleString("es-CL", { maximumFractionDigits: 1 });
  const pad = (x) => String(x).padStart(2, "0");
  const now = () => {
    let d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const today = () => now().slice(0, 10);
  const day = (x) => {
    if (!x) return "—";
    let s = String(x),
      m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : s;
  };
  const datetime = (x) => {
    if (!x) return "—";
    let d = new Date(x);
    return isNaN(d)
      ? x
      : d.toLocaleString("es-CL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };
  function parseDate(raw) {
    let s = String(raw ?? "").trim();
    if (!s) return "";
    let m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
    if (m) {
      let x = `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
      let d = new Date(x + "T12:00:00");
      return !isNaN(d) && d.getDate() === Number(m[1]) ? x : "";
    }
    m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) {
      let x = `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
      let d = new Date(x + "T12:00:00");
      return !isNaN(d) && d.getDate() === Number(m[3]) ? x : "";
    }
    if (/^\d{5}(?:\.\d+)?$/.test(s)) {
      let d = new Date(Date.UTC(1899, 11, 30) + Math.round(Number(s)) * 86400000);
      return d.toISOString().slice(0, 10);
    }
    return "";
  }
  const safeId = () => `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
  const REGIONS = [
    ["XV", "Región de Arica y Parinacota"],
    ["I", "Región de Tarapacá"],
    ["II", "Región de Antofagasta"],
    ["III", "Región de Atacama"],
    ["IV", "Región de Coquimbo"],
    ["V", "Región de Valparaíso"],
    ["RM", "Región Metropolitana"],
    ["VI", "Región del Libertador General Bernardo O'Higgins"],
    ["VII", "Región del Maule"],
    ["XVI", "Región de Ñuble"],
    ["VIII", "Región del Biobío"],
    ["IX", "Región de La Araucanía"],
    ["XIV", "Región de Los Ríos"],
    ["X", "Región de Los Lagos"],
    ["XI", "Región de Aysén"],
    ["XII", "Región de Magallanes"],
  ];
  const REGION_MAP = new Map();
  REGIONS.forEach(([code, label]) => {
    REGION_MAP.set(N(code), code);
    REGION_MAP.set(N(label), code);
    REGION_MAP.set(N(label.replace("Región de ", "").replace("Región del ", "")), code);
  });
  [
    ["METROPOLITANA", "RM"],
    ["SANTIAGO", "RM"],
    ["BIO BIO", "VIII"],
    ["BIOBIO", "VIII"],
    ["O HIGGINS", "VI"],
    ["OHIGGINS", "VI"],
    ["LIBERTADOR BERNARDO OHIGGINS", "VI"],
    ["ARAU CANIA", "IX"],
    ["NUBLE", "XVI"],
  ].forEach((x) => REGION_MAP.set(x[0], x[1]));
  function reg(x) {
    let v = N(x);
    if (!v) return "";
    if (REGION_MAP.has(v)) return REGION_MAP.get(v);
    let found = REGIONS.find(([code, label]) => v === N(code + " - " + label) || v.includes(N(label)));
    return found ? found[0] : "";
  }
  const regionLabel = (code) => {
    let r = REGIONS.find((x) => x[0] === reg(code));
    return r ? `${r[0]} - ${r[1]}` : "Sin región";
  };
  const regionOptions = (value = "", all = false) =>
    `${all ? '<option value="">Todas las regiones</option>' : '<option value="">Selecciona región</option>'}${REGIONS.map(([c, l]) => `<option value="${c}" ${reg(value) === c ? "selected" : ""}>${E(c)} - ${E(l)}</option>`).join("")}`;
  const CITIES = {
    ARICA: [-18.48, -70.31],
    IQUIQUE: [-20.23, -70.14],
    ANTOFAGASTA: [-23.65, -70.4],
    CALAMA: [-22.46, -68.93],
    COPIAPO: [-27.37, -70.33],
    "LA SERENA": [-29.9, -71.25],
    COQUIMBO: [-29.95, -71.34],
    OVALLE: [-30.6, -71.2],
    ILLAPEL: [-31.63, -71.16],
    "LOS VILOS": [-31.91, -71.51],
    VALPARAISO: [-33.05, -71.61],
    "VINA DEL MAR": [-33.015, -71.55],
    QUILLOTA: [-32.88, -71.25],
    "SAN ANTONIO": [-33.59, -71.61],
    QUINTERO: [-32.78, -71.53],
    "LOS ANDES": [-32.83, -70.6],
    SANTIAGO: [-33.45, -70.67],
    QUILICURA: [-33.36, -70.73],
    LAMPA: [-33.29, -70.88],
    "LO ESPEJO": [-33.52, -70.68],
    LONQUEN: [-33.69, -70.76],
    OCHAGAVIA: [-33.54, -70.7],
    PUDAHUEL: [-33.45, -70.76],
    MAIPU: [-33.52, -70.76],
    COLINA: [-33.2, -70.68],
    "SAN BERNARDO": [-33.59, -70.71],
    BUIN: [-33.73, -70.74],
    MELIPILLA: [-33.69, -71.22],
    RANCAGUA: [-34.17, -70.74],
    "SAN FERNANDO": [-34.58, -70.99],
    CURICO: [-34.98, -71.24],
    TALCA: [-35.43, -71.65],
    CONSTITUCION: [-35.33, -72.41],
    CONSTITUCIÓN: [-35.33, -72.41],
    CHILLAN: [-36.61, -72.1],
    QUIRIHUE: [-36.28, -72.54],
    CONCEPCION: [-36.83, -73.05],
    HUALPEN: [-36.78, -73.1],
    CORONEL: [-37.03, -73.14],
    TALCAHUANO: [-36.72, -73.12],
    "LOS ANGELES": [-37.47, -72.35],
    TEMUCO: [-38.74, -72.6],
    ANGOL: [-37.8, -72.71],
    VALDIVIA: [-39.82, -73.24],
    OSORNO: [-40.58, -73.13],
    "PUERTO MONTT": [-41.47, -72.94],
    "PUERTO VARAS": [-41.32, -72.99],
    COYHAIQUE: [-45.57, -72.07],
    "PUNTA ARENAS": [-53.16, -70.91],
  };
  const BASE = [-33.446, -70.758],
    rad = (x) => (x * Math.PI) / 180;
  function straight(a, b) {
    let dlat = rad(b[0] - a[0]),
      dlon = rad(b[1] - a[1]),
      v = Math.sin(dlat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dlon / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(v)));
  }
  const road = (a, b) => Math.round(straight(a, b) * 1.3);
  function cityFrom(input) {
    let s = ` ${N(input)} `,
      c = Object.keys(CITIES).filter((x) => s.includes(` ${x} `) || s.includes(`-${x} `) || s.includes(` ${x}-`));
    c.sort((a, b) => b.length - a.length);
    return c[0] || "";
  }
  function destination(r) {
    return cityFrom(r.city) || cityFrom(r.client) || "";
  }
  function stopsFor(lines) {
    let map = new Map();
    lines.forEach((l) => {
      let c = destination(l);
      if (c && !map.has(c)) map.set(c, { name: c, coords: CITIES[c] });
    });
    let stops = [...map.values()],
      pos = BASE,
      out = [];
    while (stops.length) {
      stops.sort((a, b) => road(pos, a.coords) - road(pos, b.coords));
      let n = stops.shift();
      out.push(n);
      pos = n.coords;
    }
    return out.map((v) => ({ name: v.name }));
  }
  function theoretical(t) {
    if (t.state !== "OUT" || !t.departure) return null;
    let stops = (t.stops || []).filter((s) => CITIES[N(s.name)]),
      last = BASE,
      km = 0;
    for (let s of stops) {
      let coords = CITIES[N(s.name)];
      km += road(last, coords);
      last = coords;
    }
    if (!stops.length) return null;
    km += road(last, BASE);
    let rural = Math.min(80, Math.max(20, num(t.rural || 80))),
      urban = Math.min(50, Math.max(10, num(t.urban || 35)));
    let travelHours = (km * 0.88) / rural + (km * 0.12) / urban,
      services = (stops.length * Math.max(0, num(t.serviceMin ?? 35))) / 60,
      breaks = Math.max(0, num(t.breakMin ?? 30)) / 60;
    let hours = travelHours + services + breaks;
    return { km, hours, at: new Date(new Date(t.departure).getTime() + hours * 3600000).toISOString() };
  }
  const STORAGE = "CL14_SIKA_V7_2026";
  function initial() {
    return {
      seq: 0,
      tripSeq: 0,
      lines: [],
      trips: [],
      drivers: DRIVERS_SEED.map((x) => ({ ...x })),
      notes: [],
      history: [],
      materials: MATERIAL_SEED.map((m) => ({ ...m })),
    };
  }
  let state;
  try {
    let raw = localStorage.getItem(STORAGE) || localStorage.getItem("CL14_SIKA_V6_2026");
    state = raw ? JSON.parse(raw) : initial();
  } catch {
    state = initial();
  }
  if (!state || !Array.isArray(state.lines) || !Array.isArray(state.trips)) state = initial();
  if (!Array.isArray(state.drivers)) state.drivers = DRIVERS_SEED.map((x) => ({ ...x }));
  if (!Array.isArray(state.history)) state.history = [];
  if (!Array.isArray(state.materials)) state.materials = MATERIAL_SEED.map((m) => ({ ...m }));
  const line = (id) => state.lines.find((l) => l.uid === id),
    trip = (id) => state.trips.find((t) => t.id === id),
    tripLines = (t) => (t?.lineIds || []).map(line).filter(Boolean),
    linesOf = (id) => state.lines.filter((l) => l.dispatchId === id),
    dispatchIds = () => [...new Set(state.lines.map((l) => l.dispatchId))];
  function save() {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(state));
    } catch (e) {
      console.warn("Storage unavailable", e);
      toast("No se pudo guardar en este navegador (almacenamiento bloqueado o lleno). Descarga un respaldo.", true);
    }
    render();
  }
  function audit(verb, detail) {
    state.history.unshift({ at: now(), verb, detail });
    state.history = state.history.slice(0, 300);
  }
  let toastTimer;
  function toast(s, bad = false) {
    let p = $("#toast");
    p.textContent = s;
    p.classList.toggle("bad", bad);
    p.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      p.hidden = true;
    }, 3500);
  }
  let view = "dashboard",
    expanded = "",
    page = 0,
    importRows = [],
    importTab = "paste",
    draft = [],
    appendDispatch = "",
    activeAdmin = null,
    adminStep = 0,
    modalHandler = null,
    modalOnClose = null,
    selectedRouteLines = new Set();
  const empty = (title = "Sin registros", sub = "") =>
    `<div class="empty"><div class="emptyicon">▤</div><strong>${E(title)}</strong>${sub ? `<p>${E(sub)}</p>` : ""}</div>`;
  function badge(text, kind = "") {
    return `<span class="chip ${kind}">${E(text)}</span>`;
  }
  const button = (label, act, id = "", type = "outline mini", extra = "") =>
    `<button type="button" class="btn ${type}" data-act="${E(act)}" ${id ? `data-id="${E(id)}"` : ""} ${extra}>${label}</button>`;
  function setView(page) {
    view = page;
    $$("[data-page]").forEach((s) => s.classList.toggle("active", s.dataset.page === view));
    $$("[data-view]").forEach((s) => {
      const on = s.dataset.view === view;
      s.classList.toggle("on", on);
      if (on) s.setAttribute("aria-current", "page");
      else s.removeAttribute("aria-current");
    });
    render();
    window.scrollTo(0, 0);
  }
  function modal(title, subtitle, html, onSave = null, opts = {}) {
    modalHandler = onSave;
    modalOnClose = opts.onClose || null;
    $("#modalTitle").textContent = title;
    $("#modalSub").textContent = subtitle || "";
    $("#modalBody").innerHTML = html;
    $("#modal").classList.toggle("sm", !!opts.small);
    $("#modalFoot").innerHTML =
      opts.foot ||
      (onSave
        ? `<span class="small muted">Los cambios se guardarán al confirmar.</span><button class="btn primary" id="modalSave">${opts.label || "Guardar"}</button>`
        : "<span></span>");
    $("#overlay").hidden = false;
    document.body.classList.add("noscroll");
    enhanceRegionControls($("#modalBody"));
    $("#modalX").focus();
  }
  function closeModal() {
    if (modalOnClose) modalOnClose();
    modalOnClose = null;
    modalHandler = null;
    activeAdmin = null;
    $("#overlay").hidden = true;
    document.body.classList.remove("noscroll");
  }
  const getVals = (root = $("#modalBody")) =>
    Object.fromEntries($$("[name]", root).map((e) => [e.name, e.type === "checkbox" ? e.checked : e.value]));
  function field(name, title, value = "", type = "text", extra = "") {
    if (type === "region")
      return `<div class="field"><label>${E(title)}</label><select name="${name}" ${extra}>${regionOptions(value)}</select></div>`;
    return `<div class="field"><label>${E(title)}</label><input name="${name}" type="${type}" value="${E(value)}" ${extra}></div>`;
  }
  function stat(title, value, info, icon, color = "#e1ad22", bg = "#fff4d6") {
    return `<div class="kpi" style="--kpi:${color};--kpiBg:${bg}"><div class="kpi-icon">${icon}</div><b>${fmt(value)}</b><strong>${E(title)}</strong><small>${E(info)}</small></div>`;
  }
  function isLate(l) {
    let dt = l.requestedDate || l.date || l.loadDate;
    if (!dt) return false;
    let d = new Date(dt + "T23:59:59");
    return !isNaN(d) && d < new Date() && !["OUT", "RETURNING", "FINISHED"].includes(trip(l.tripId)?.state);
  }

  function adminCheck(t) {
    if (!t) return { complete: false, missing: [], percent: 0, checks: [] };
    let ll = tripLines(t),
      has = ll.length > 0;
    let checks = [
      [
        "Documento y material SAP",
        has &&
          ll.every(
            (l) =>
              String(l.commercial || "").trim() &&
              materialByCode(l.materialCode) &&
              materialByCode(l.materialCode).category !== "POR DEFINIR" &&
              materialByCode(l.materialCode).unit === "PC" &&
              weightFor(l) > 0,
          ),
      ],
      ["N° entrega", has && ll.every((l) => String(l.delivery || "").trim())],
      ["N° transporte", has && ll.every((l) => String(l.transport || "").trim())],
      ["Orden de salida", has && ll.every((l) => String(l.os || "").trim())],
      ["Guía de despacho", has && ll.every((l) => String(l.guide || "").trim())],
      [
        "Gasto de transporte",
        has &&
          [...new Set(ll.map((l) => l.transport))].every(
            (code) => code && t.costs && Object.hasOwn(t.costs, code) && String(t.costs[code]).trim() !== "",
          ),
      ],
      [
        "Chofer y PPU",
        !!String(t.driver || "").trim() && !!String(t.ppu || "").trim() && !!String(t.transportType || "").trim(),
      ],
    ];
    return {
      complete: checks.every((x) => x[1]),
      missing: checks.filter((x) => !x[1]).map((x) => x[0]),
      percent: Math.round((checks.filter((x) => x[1]).length / checks.length) * 100),
      checks,
    };
  }

  function dispState(g) {
    let statuses = g.map((l) => trip(l.tripId)?.state || "UNASSIGNED");
    if (statuses.every((s) => s === "FINISHED")) return ["Finalizado", "green", "green"];
    if (statuses.some((s) => s === "OUT")) return ["Camión fuera", "blue", "blue"];
    if (statuses.some((s) => s === "RETURNING")) return ["Retorno avisado", "amber", "amber"];
    if (statuses.some((s) => s === "PLANNED")) {
      let ts = [...new Set(g.map((l) => l.tripId).filter(Boolean))].map(trip);
      return ts.every((t) => adminCheck(t).complete)
        ? ["Listo para salida", "green", "green"]
        : ["Falta administrativo", "amber", "amber"];
    }
    return ["Sin planificar", "amber", "red"];
  }
  function getDriver(name) {
    let d = state.drivers.find((x) => N(x.name) === N(name));
    if (d) return { ...d, asReplacement: false };
    d = state.drivers.find((x) => x.replacement && N(x.replacement) === N(name));
    return d ? { ...d, name: d.replacement, ppu: d.replacementPpu || "", asReplacement: true } : null;
  }
  function syncDriver(name, root) {
    let d = getDriver(name);
    if (!d) return;
    let p = $("[name=ppu]", root),
      type = $("[name=transportType]", root),
      code = $("[name=transportCode]", root),
      company = $("[name=transportCompany]", root);
    if (p) p.value = d.ppu || "";
    if (type) type.value = N(d.type) === "FIJO" ? "FIJO" : N(d.type) === "TERCERO" ? "TERCERO" : d.type || "";
    if (code) code.value = d.code || "";
    if (company) company.value = d.company || "";
  }
  function enhanceRegionControls(root = document) {
    let selects = $$('select[name="region"],#filterRegion,#manualReg', root);
    for (const select of selects) {
      if (select.dataset.enhanced) return;
      select.dataset.enhanced = "yes";
      const wrap = document.createElement("div");
      wrap.className = "regionwidget" + (select.classList.contains("compact") ? " compact" : "");
      select.parentNode.insertBefore(wrap, select);
      wrap.appendChild(select);
      select.classList.add("regionnative");
      let face = document.createElement("button");
      face.type = "button";
      face.className = "regionface";
      let text = document.createElement("span"),
        arrow = document.createElement("span");
      arrow.textContent = "⌄";
      face.append(text, arrow);
      face.title = select.selectedOptions[0]?.textContent || "";
      let pop = document.createElement("div");
      pop.className = "regionpop";
      pop.hidden = true;
      let query = document.createElement("input");
      query.placeholder = "Buscar región";
      query.type = "search";
      query.setAttribute("aria-label", "Buscar región");
      let options = document.createElement("div");
      options.className = "regionoptions";
      pop.append(query, options);
      wrap.append(face, pop);
      function update() {
        text.textContent = select.selectedOptions[0]?.textContent || "Selecciona región";
        face.title = text.textContent;
      }
      function draw(q = "") {
        options.innerHTML = "";
        for (const opt of select.options) {
          if (q && !N(opt.textContent).includes(N(q))) continue;
          let b = document.createElement("button");
          b.type = "button";
          b.className = select.value === opt.value ? "selected" : "";
          b.textContent = opt.textContent;
          b.addEventListener("click", () => {
            select.value = opt.value;
            pop.hidden = true;
            update();
            select.dispatchEvent(new Event("change", { bubbles: true }));
          });
          options.appendChild(b);
        }
      }
      face.addEventListener("click", () => {
        for (const other of $$(".regionpop")) if (other !== pop) other.hidden = true;
        pop.hidden = !pop.hidden;
        if (!pop.hidden) {
          query.value = "";
          draw();
          query.focus();
        }
      });
      query.addEventListener("input", () => draw(query.value));
      select.addEventListener("change", update);
      update();
    }
  }
  document.addEventListener("click", (ev) => {
    for (const wrap of $$(".regionwidget"))
      if (!wrap.contains(ev.target)) {
        let p = $(".regionpop", wrap);
        if (p) p.hidden = true;
      }
  });
  function cleanLine(r) {
    let date = r.date || r.requestedDate || "";
    let q = Math.max(0, num(r.qty)),
      pending = Math.min(q, Math.max(0, num(r.pendingQty)));
    return {
      uid: safeId(),
      dispatchId: "",
      date,
      requestedDate: date,
      region: reg(r.region),
      client: r.client || "",
      city: r.city || cityFrom(r.client),
      product: r.product || "",
      originalProduct: r.originalProduct || r.product || "",
      materialCode: r.materialCode || "",
      materialVerified: !!r.materialCode,
      loadDate: r.loadDate || date || "",
      pv: String(r.pv ?? ""),
      plant: r.plant || "",
      sourceStatus: r.sourceStatus || "",
      kg: 0,
      qty: q,
      pendingQty: pending,
      commercial: r.commercial || "",
      notes: r.notes || "",
      tripId: "",
      status: "PENDIENTE",
      delivery: "",
      transport: "",
      os: "",
      guide: "",
      returnQty: "",
      balance: "",
      guideDate: "",
    };
  }

  function regionOfLines(lines) {
    let codes = [...new Set(lines.map((l) => reg(l.region)).filter(Boolean))];
    return codes.length === 1 ? codes[0] : codes.length ? "MULTI" : "";
  }
  function stockBlocked(l) {
    return /SIN\s+STOCK|AGOTADO/.test(N([l.sourceStatus || "", l.notes || ""].join(" ")));
  }
  function isPlanReady(l) {
    return !!materialByCode(l.materialCode) && weightFor(l) > 0 && shipUnits(l) > 0 && !stockBlocked(l);
  }
  function suggestGroups(rows) {
    let byRegion = new Map();
    for (let r of rows.filter(isPlanReady)) {
      let key = reg(r.region) || "SIN REGIÓN";
      if (!byRegion.has(key)) byRegion.set(key, []);
      byRegion.get(key).push(r);
    }
    let out = [];
    for (let [region, items] of byRegion) {
      let buckets = [];
      let sorted = [...items].sort((a, b) => weightFor(b) - weightFor(a));
      for (let l of sorted) {
        let kg = routeWeight([l]),
          point = destination(l),
          p = point ? CITIES[point] : null;
        let best = null,
          score = Infinity;
        for (let b of buckets) {
          let next = routeWeight([...b.rows, l]);
          if (next > 15000) continue;
          let location = b.rows.map(destination).find(Boolean);
          let q = location ? CITIES[location] : null;
          let proximity = p && q ? road(p, q) : location && point && location === point ? 0 : 320;
          let remaining = 15000 - next;
          let rank = proximity * 0.9 + remaining / 80;
          if (rank < score) {
            score = rank;
            best = b;
          }
        }
        if (!best) {
          best = { region, kg: 0, rows: [], over: false };
          buckets.push(best);
        }
        best.rows.push(l);
        best.kg = routeWeight(best.rows);
        best.over = best.kg > 15000;
      }
      out.push(...buckets);
    }
    return out;
  }

  function storeNewGroups(groups) {
    let count = 0;
    for (let g of groups) {
      let dispatchId = `D-${String(++state.seq).padStart(5, "0")}`;
      for (let row of g.rows) {
        let l = cleanLine(row);
        l.dispatchId = dispatchId;
        state.lines.push(l);
        count++;
      }
    }
    audit("Ingreso", `${groups.length} despachos y ${count} líneas`);
    save();
    return { count, dispatches: groups.length };
  }
  function render() {
    renderDashboard();
    renderIngress();
    renderPlanning();
    renderDispatch();
    renderFleet();
    renderPending();
    renderDrivers();
    renderMaterials();
    $("#navCount").textContent = dispatchIds().length;
    $("#navOutside").textContent = state.trips.filter((t) => ["OUT", "RETURNING"].includes(t.state)).length;
  }
  function renderDashboard() {
    let out = state.trips.filter((t) => t.state === "OUT"),
      ret = state.trips.filter((t) => t.state === "RETURNING"),
      unplanned = state.lines.filter((l) => !l.tripId),
      late = state.lines.filter(isLate),
      noSalida = state.lines.filter((l) => !l.tripId || trip(l.tripId)?.state === "PLANNED" || num(l.pendingQty) > 0),
      finished = state.trips.filter((t) => t.state === "FINISHED"),
      missing = state.trips.filter((t) => t.state === "PLANNED" && !adminCheck(t).complete);
    let ibcSaldo = state.trips
      .filter((t) => t.state === "FINISHED")
      .reduce((sum, t) => sum + num(t.ibcBalance || 0), 0);
    $("#kpis").innerHTML =
      stat("Camiones fuera", out.length, "En ruta", "▰", "#1f76b4", "#e8f4ff") +
      stat("Retorno anunciado", ret.length, "Esperan llegada", "↶", "#bc7913", "#fff3de") +
      stat("Pendientes de salida", noSalida.length, "Sin despacho o con saldo pendiente", "◷", "#c62f24", "#ffefeb") +
      stat(
        "Listos para salir",
        state.trips.filter((t) => t.state === "PLANNED" && adminCheck(t).complete).length,
        "Administrativo completo",
        "✓",
        "#16815d",
        "#e6f7ed",
      ) +
      stat("En planificación", missing.length, "Rutas con datos faltantes", "▤", "#ae7317", "#fff7e5") +
      stat("Finalizados", finished.length, "Camiones recibidos", "▰", "#16815d", "#e8f6ee") +
      stat("Atrasados", late.length, "Fecha de carga vencida", "!", "#d03427", "#fff0ed") +
      stat("IBC pendientes", ibcSaldo, "Sin recuperar tras llegada", "◈", "#b32d2a", "#ffebe8");
    $("#dashFleet").innerHTML = out.length
      ? out
          .slice(0, 5)
          .map((t) => {
            let estimate = theoretical(t);
            return `<div class="rowline"><div><b>${E(t.ppu || "PPU pendiente")} · ${E(t.driver || "Chofer pendiente")}</b><small>${E(t.id)} · ${E((t.stops || []).map((s) => s.name).join(" → ") || regionLabel(t.region))}</small></div><div class="right">${badge("Fuera", "blue")}<div class="small muted mt8">${estimate ? `Retorno teórico ${datetime(estimate.at)}` : "Retorno sin cálculo"}</div></div></div>`;
          })
          .join("")
      : empty("No hay camiones fuera");
    $("#dashPending").innerHTML = noSalida.length
      ? noSalida
          .sort((a, b) => (a.loadDate || "").localeCompare(b.loadDate || ""))
          .slice(0, 6)
          .map(
            (l) =>
              `<div class="rowline"><div><b>${E(l.client)}</b><small>${E(l.product)} · ${day(l.loadDate)} · ${regionLabel(l.region)}</small></div>${badge(isLate(l) ? "Atrasado" : num(l.pendingQty) > 0 ? "Saldo pendiente" : l.tripId ? "Planificado" : "Sin planificar", isLate(l) ? "red" : "amber")}</div>`,
          )
          .join("")
      : empty("Sin pedidos pendientes de salida");
    let active = state.trips.filter((t) => ["OUT", "RETURNING"].includes(t.state));
    $("#driverStats").textContent = `${new Set(active.map((t) => t.ppu).filter(Boolean)).size} PPU activas`;
    let grouped = new Map();
    for (const t of state.trips) {
      if (!t.driver && !t.ppu) continue;
      let key = N(t.driver) + "|" + N(t.ppu),
        v = grouped.get(key) || { driver: t.driver, ppu: t.ppu, trips: 0, finished: 0, active: 0, returning: 0 };
      v.trips++;
      if (t.state === "FINISHED") v.finished++;
      if (t.state === "OUT") v.active++;
      if (t.state === "RETURNING") v.returning++;
      grouped.set(key, v);
    }
    let metrics = [...grouped.values()].sort(
      (a, b) => b.active + b.returning - (a.active + a.returning) || b.trips - a.trips,
    );
    $("#dashDrivers").innerHTML = metrics.length
      ? metrics
          .slice(0, 8)
          .map(
            (m) =>
              `<div class="rowline"><div><b>${E(m.driver || "Sin chofer")}</b><small>PPU ${E(m.ppu || "Sin patente")} · ${fmt(m.trips)} viajes / ${fmt(m.finished)} finalizados</small></div>${m.active ? badge("En ruta", "blue") : m.returning ? badge("Retornando", "amber") : badge("Sin viaje activo", "")}</div>`,
          )
          .join("")
      : empty("Sin viajes asociados a choferes");
    let missingMaterial = state.lines.filter((l) => !materialByCode(l.materialCode));
    let ibcQty = state.lines.filter((l) => matType(l) === "IBC").reduce((n, l) => n + num(l.qty), 0);
    let tbQty = state.lines.filter((l) => matType(l) === "TB").reduce((n, l) => n + num(l.qty), 0);
    $("#dashMaterial").innerHTML =
      `<div class="rowline"><b>Materiales sin vincular</b>${badge(String(missingMaterial.length), missingMaterial.length ? "amber" : "green")}</div><div class="rowline"><b>IBC programados</b>${badge(String(ibcQty), "blue")}</div><div class="rowline"><b>Tambores programados</b>${badge(String(tbQty), "amber")}</div>`;
    let planned = state.trips.filter((t) => t.state === "PLANNED").length,
      total = state.trips.length,
      segments = [
        [out.length, "#2f83c1"],
        [ret.length, "#e2a131"],
        [planned, "#8f9aab"],
        [finished.length, "#20a27e"],
      ];
    $("#dashStates").innerHTML =
      `<div class="between"><span class="small muted">Viajes registrados</span><b>${fmt(total)}</b></div><div class="bars">${segments.map(([v, color]) => `<span style="width:${total ? (v / total) * 100 : 0}%;background:${color}"></span>`).join("")}</div><div class="mt12">${[
        ["En ruta", out.length, "blue"],
        ["Retorno avisado", ret.length, "amber"],
        ["Planificados", planned, ""],
        ["Finalizados", finished.length, "green"],
      ]
        .map(([s, n, c]) => `<div class="rowline"><span class="small">${E(s)}</span>${badge(String(n), c)}</div>`)
        .join("")}</div>`;
  }
  function renderIngress() {
    if (importRows.length) showImportPreview();
  }
  function csvCells(raw, delimiter) {
    let output = [],
      cell = "",
      row = [],
      quoted = false;
    for (let i = 0; i < raw.length; i++) {
      let c = raw[i];
      if (c === '"') {
        if (quoted && raw[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = !quoted;
      } else if (c === delimiter && !quoted) {
        row.push(cell.trim());
        cell = "";
      } else if ((c === "\n" || c === "\r") && !quoted) {
        if (c === "\r" && raw[i + 1] === "\n") i++;
        row.push(cell.trim());
        cell = "";
        if (row.some((x) => x !== "")) output.push(row);
        row = [];
      } else cell += c;
    }
    row.push(cell.trim());
    if (row.some((x) => x !== "")) output.push(row);
    return output;
  }
  function parseRaw(text) {
    let raw = String(text || "")
      .replace(/^\uFEFF/, "")
      .trim();
    if (!raw) return [];
    let first = raw.split(/\r?\n/)[0];
    let delim = first.includes("\t") ? "\t" : first.includes(";") ? ";" : ",";
    let rows = csvCells(raw, delim);
    if (rows.length && N(rows[0][0]).includes("REGION") && N(rows[0][1]).includes("CLIENTE")) rows.shift();
    return rows
      .map((cols, i) => ({ raw: cols, rowNumber: i + 1 }))
      .filter((x) => x.raw.some((x) => String(x ?? "").trim()));
  }

  function createRows(rawList) {
    let errors = [],
      rows = [];
    for (const item of rawList) {
      let c = item.raw.map((x) => String(x ?? "").trim());
      if (!c.some(Boolean)) continue;
      if (N(c[0]).includes("REGION") && N(c[1] || "").includes("CLIENTE")) continue;
      if (c.length < 6) {
        errors.push(`Fila ${item.rowNumber}: se esperan región, cliente, PV, producto, fecha y cantidad.`);
        continue;
      }
      let [region, client, pv, product, requested, qty, plant = "", status = "", pending = "", notes = ""] = c;
      let d = parseDate(requested);
      let pendingQty = pending === "" ? 0 : num(pending),
        amount = num(qty);
      let err = [];
      if (!reg(region)) err.push("región");
      if (!client) err.push("cliente");
      if (!product) err.push("producto");
      if (!Number.isInteger(amount) || amount <= 0) err.push("cantidad");
      if (!Number.isInteger(pendingQty) || pendingQty < 0 || pendingQty > amount) err.push("cantidad pendiente");
      if (err.length) {
        errors.push(`Fila ${item.rowNumber}: revisar ${err.join(", ")}`);
        continue;
      }
      let l = {
        region: reg(region),
        client,
        pv,
        product,
        originalProduct: product,
        date: d,
        requestedDate: d,
        loadDate: d,
        qty: amount,
        pendingQty,
        plant,
        sourceStatus: status,
        notes,
        kg: 0,
      };
      let m = recommendMaterial(product);
      if (m && m.unit === "PC") bindMaterial(l, m);
      if (requested && !d)
        errors.push(`Fila ${item.rowNumber}: fecha "${requested}" no válida, quedó sin fecha para revisar.`);
      rows.push(l);
    }
    return { rows, errors };
  }

  function previewImport() {
    let raw = $("#rawImport").value;
    if (!raw.trim()) {
      toast("Pega el contenido de Excel antes de revisar.", true);
      return;
    }
    let v = createRows(parseRaw(raw));
    importRows = v.rows;
    showImportPreview(v.errors);
  }
  function showImportPreview(errors = []) {
    let box = $("#importPreview");
    box.hidden = false;
    let missing = importRows.filter((l) => weightFor(l) <= 0).length;
    let regionGroups = new Map();
    for (let l of importRows) {
      let r = reg(l.region);
      if (!regionGroups.has(r)) regionGroups.set(r, []);
      regionGroups.get(r).push(l);
    }
    let warnings = errors.length
      ? `<div class="notice amber mt12"><b>${errors.length} aviso(s)</b><div class="small mt8">${errors.slice(0, 8).map(E).join("<br>")}</div></div>`
      : "";
    box.innerHTML = `<div class="between wrap"><div><b>${importRows.length} pedidos detectados</b><div class="small muted">${regionGroups.size} regiones · ${missing} materiales pendientes de vincular</div></div>${button("Guardar " + importRows.length + " pedidos", "confirm-import", "", "primary", importRows.length ? "" : "disabled")}</div>${warnings}<div class="tablewrap scrolllimit mt12"><table><thead><tr><th>#</th><th>Región</th><th>Cliente / PV</th><th>Producto solicitado</th><th>Fecha requerida</th><th>Cant.</th><th>Pendiente</th><th>Material SAP / kg</th></tr></thead><tbody>${importRows.map((l, i) => `<tr><td>${i + 1}</td><td>${E(l.region)}</td><td><b>${E(l.client)}</b><div class="small muted">PV ${E(l.pv || "—")}</div></td><td>${E(l.originalProduct || l.product)}</td><td>${l.date ? day(l.date) : badge("Revisar fecha", "amber")}</td><td>${fmt(l.qty)}</td><td>${fmt(l.pendingQty)}</td><td>${l.materialCode ? `<b class="material-code">${E(l.materialCode)}</b> · ${fmt(weightFor(l))} kg` : "Sin vincular"}${stockBlocked(l) ? `<span class="chip red">Sin stock</span>` : ""} ${button("Elegir SAP", "link-import", "", "outline mini", `data-index="${i}"`)}</td></tr>`).join("")}</tbody></table></div><div class="small muted mt12">La importación no exige materiales vinculados. Para planificar el peso se requiere elegir un código SAP con peso bruto por unidad.</div>`;
  }

  function importConfirm() {
    if (!importRows.length) return toast("No hay pedidos válidos.", true);
    let by = new Map();
    for (let row of importRows) {
      let r = reg(row.region);
      if (!by.has(r)) by.set(r, []);
      by.get(r).push(row);
    }
    let { count, dispatches } = storeNewGroups([...by.entries()].map(([region, rows]) => ({ region, rows })));
    importRows = [];
    $("#rawImport").value = "";
    $("#importPreview").hidden = true;
    toast(`${count} pedidos importados en ${dispatches} despachos por región.`);
    setView("despachos");
  }

  function manualNew(existing = "") {
    appendDispatch = existing;
    draft = [];
    let base = existing ? linesOf(existing)[0] : null;
    modal(
      existing ? "Agregar pedidos al despacho" : "Ingreso manual",
      existing ? `Se añadirán pedidos a ${existing}` : "Se generará un ID al guardar los pedidos.",
      `<div class="formgrid cols3" id="manualFields">
${field("region", "Región", base?.region || "", "region", "required")}
${field("client", "Cliente / ciudad", "", "text", 'list="clientOptions" required')}
${field("pv", "PV (opcional)", "", "text")}
${field("product", "Producto solicitado", "", "text", 'list="productOptions" required')}
${field("date", "Fecha requerida", base?.date || "", "date")}
${field("qty", "Cantidad solicitada", "", "number", 'min="1" step="1" required')}
${field("plant", "Planta de carga", "", "text")}
${field("sourceStatus", "Status / abastecimiento", "", "text")}
${field("pendingQty", "Cantidad pendiente", "0", "number", 'min="0" step="1"')}
<div class="wide field"><label>Observación</label><textarea name="notes" rows="2" placeholder="Ej.: revisar stock"></textarea></div>
<div class="wide"><input type="hidden" name="materialCode"><div class="between"><span id="manualMaterialResult" class="small muted">Selecciona material SAP para calcular kilos</span>${button("Buscar material SAP", "manual-material", "", "outline mini")}</div><div id="manualWeight" class="mt8 small strong"></div></div>
</div><div class="between mt16"><b class="small">Pedidos agregados</b>${button("＋ Agregar pedido", "stage-line", "", "dark")}</div><div id="draftList" class="mt8"></div>`,
      () => finishDraft(),
      {
        foot: `<span class="small muted" id="draftCount">0 pedidos agregados</span><button class="btn primary" id="modalSave">${existing ? "Guardar pedidos" : "Crear despacho"}</button>`,
      },
    );
  }

  function stagedFromForm() {
    let v = getVals(),
      amount = num(v.qty),
      pending = num(v.pendingQty),
      requested = parseDate(v.date);
    let l = {
      date: requested,
      requestedDate: requested,
      region: reg(v.region),
      client: String(v.client || "").trim(),
      pv: String(v.pv || "").trim(),
      product: String(v.product || "").trim(),
      originalProduct: String(v.product || "").trim(),
      loadDate: requested,
      qty: amount,
      pendingQty: pending,
      plant: String(v.plant || "").trim(),
      sourceStatus: String(v.sourceStatus || "").trim(),
      notes: String(v.notes || "").trim(),
      kg: 0,
      materialCode: v.materialCode || "",
    };
    if (
      !l.region ||
      !l.client ||
      !l.product ||
      !Number.isInteger(amount) ||
      amount <= 0 ||
      !Number.isInteger(pending) ||
      pending < 0 ||
      pending > amount
    ) {
      toast("Completa región, cliente, producto y una cantidad válida.", true);
      return null;
    }
    return l;
  }

  function stageLine() {
    let l = stagedFromForm();
    if (!l) return;
    draft.push(l);
    renderDraft();
    let f = $("#modalBody");
    for (let k of ["client", "pv", "product", "qty", "materialCode", "plant", "sourceStatus", "notes"]) {
      let e = $(`[name=${k}]`, f);
      if (e) e.value = "";
    }
    let pend = $("[name=pendingQty]", f);
    if (pend) pend.value = "0";
    $("#manualMaterialResult").textContent = "Selecciona material SAP para calcular kilos";
    let w = $("#manualWeight");
    if (w) w.textContent = "";
    $("[name=client]", f)?.focus();
  }

  function renderDraft() {
    let c = $("#draftCount");
    if (c) c.textContent = `${draft.length} pedido(s) agregados`;
    $("#draftList").innerHTML = draft.length
      ? draft
          .map(
            (l, i) =>
              `<div class="draftline"><div><b>${E(l.client)}</b><div class="small muted">${E(l.originalProduct || l.product)} · ${regionLabel(l.region)} · ${fmt(l.qty)} solicitados / ${fmt(shipUnits(l))} disponibles · ${l.materialCode ? `${fmt(weightFor(l))} kg SAP` : "SAP por vincular"}</div></div><button class="btn mini danger" data-act="draft-remove" data-index="${i}">Quitar</button></div>`,
          )
          .join("")
      : empty("Agrega los pedidos antes de guardar");
  }

  function finishDraft() {
    if (!draft.length) {
      let maybe = stagedFromForm();
      if (maybe) draft.push(maybe);
    }
    if (!draft.length) return toast("Agrega al menos una línea.", true);
    if (appendDispatch) {
      for (const l of draft) {
        let entry = cleanLine(l);
        entry.dispatchId = appendDispatch;
        state.lines.push(entry);
      }
      audit("Ingreso", `Se agregaron ${draft.length} líneas a ${appendDispatch}`);
      let n = draft.length;
      closeModal();
      save();
      toast(`${n} líneas agregadas a ${appendDispatch}`);
      setView("despachos");
      expanded = appendDispatch;
      renderDispatch();
      return;
    }
    let g = { rows: draft };
    let ids = [],
      prev = state.seq;
    storeNewGroups([g]);
    let id = `D-${String(state.seq).padStart(5, "0")}`;
    audit("Creación", id);
    closeModal();
    toast(`Despacho ${id} creado con ${draft.length} línea(s).`);
    expanded = id;
    setView("despachos");
  }
  function makeTrip(ids) {
    let ll = ids.map(line).filter((l) => l && !l.tripId);
    if (!ll.length) return (toast("Selecciona pedidos sin ruta.", true), null);
    if (ll.some((l) => !isPlanReady(l))) {
      toast("Vincula el material SAP y revisa pendientes antes de planificar.", true);
      return null;
    }
    let kg = routeWeight(ll);
    if (kg > 15000) return (toast(`Carga ${fmt(kg)} kg supera 15.000 kg. Divide la ruta.`, true), null);
    let t = {
      id: `R-${String(++state.tripSeq).padStart(5, "0")}`,
      lineIds: ll.map((l) => l.uid),
      region: regionOfLines(ll),
      state: "PLANNED",
      driver: "",
      ppu: "",
      replacement: "",
      replacementPpu: "",
      transportType: "",
      transportCode: "",
      transportCompany: "",
      costs: {},
      name: "",
      stops: stopsFor(ll),
      notes: "",
      capacity: 15000,
      departure: "",
      returnNotice: "",
      arrival: "",
      returned: { pal: "", ibc: "", tb: "" },
      rural: 80,
      urban: 35,
      serviceMin: 35,
      breakMin: 30,
    };
    t.name = `${t.region || "Ruta"} · ${
      t.stops
        .map((s) => s.name)
        .slice(0, 2)
        .join(" / ") || "Por definir"
    }`;
    state.trips.push(t);
    ll.forEach((l) => {
      l.tripId = t.id;
      l.status = "PICKING";
    });
    audit("Planificación", `${t.id}, ${ll.length} líneas`);
    save();
    return t;
  }

  function renderPlanning() {
    let pending = state.lines.filter((l) => !l.tripId),
      groups = suggestGroups(pending);
    $("#suggestCount").textContent =
      `${groups.length} sugerencias · ${pending.filter((l) => !isPlanReady(l)).length} requieren SAP o stock`;
    $("#routeSuggestions").innerHTML = groups.length
      ? `<div class="grid cols3">${groups
          .map((g, i) => {
            let stops = stopsFor(g.rows);
            return `<div class="routecard"><div class="between"><span class="regionmark">${E(regionLabel(g.region))}</span>${g.over ? badge("Exceso de carga", "red") : badge("Sugerida", "green")}</div><h3 class="mt12">${E(stops.map((s) => s.name).join(" → ") || "Destino por confirmar")}</h3><p>${g.rows.length} líneas · ${fmt(g.kg)} / 15.000 kg</p><div class="loadbar"><span style="width:${Math.min(100, (g.kg / 15000) * 100)}%" class="${g.over ? "over" : ""}"></span></div><div class="actions">${button("Planificar esta ruta", "plan-suggested", "", "primary", g.over ? "disabled" : `data-index="${i}"`)}</div></div>`;
          })
          .join("")}</div>`
      : empty("Sin líneas pendientes de planificación");
    $("#tripCount").textContent = `${state.trips.filter((t) => t.state === "PLANNED").length} planificadas`;
    let planned = state.trips.filter((t) => t.state === "PLANNED").sort((a, b) => b.id.localeCompare(a.id));
    $("#plannedRoutes").innerHTML = planned.length
      ? `<div class="grid cols2">${planned
          .map((t) => {
            let ll = tripLines(t),
              kg = routeWeight(ll),
              chk = adminCheck(t);
            return `<div class="routecard"><div class="between"><b>${E(t.id)} · ${E(t.name)}</b>${badge(chk.complete ? "Listo para salir" : "Falta administrativo", chk.complete ? "green" : "amber")}</div><p>${E(regionLabel(t.region))} · ${ll.length} líneas · ${fmt(kg)} kg</p><p><b>${E(t.driver || "Chofer sin asignar")}</b> · ${E(t.ppu || "PPU pendiente")}</p><div class="progress"><span style="width:${chk.percent}%"></span></div><div class="actions">${button("Editar carga", "edit-trip-lines", t.id, "outline mini")}${button("Asignar camión", "route-vehicle", t.id, "outline mini")}${button("Administrativo", "admin", t.id, "outline mini")}${button("Confirmar salida", "depart", t.id, "primary mini", chk.complete ? "" : "disabled")}<button class="btnlink" data-act="remove-plan" data-id="${E(t.id)}">Quitar plan</button></div></div>`;
          })
          .join("")}</div>`
      : empty("No hay rutas planificadas");
  }
  function manualRoute() {
    selectedRouteLines = new Set();
    let pending = state.lines.filter((l) => !l.tripId);
    modal(
      "Crear ruta",
      "Selecciona las líneas que viajarán juntas. Capacidad máxima 15 toneladas.",
      `<div class="between gap8"><select id="manualReg" class="compact">${regionOptions("", true)}</select><div id="manualSelected" class="chip">0 líneas · 0 kg</div></div><div id="manualLines" class="mt12 scrolllimit"></div>`,
      () => {
        let t = makeTrip([...selectedRouteLines]);
        if (t) {
          closeModal();
          routeVehicle(t.id);
        }
      },
      { label: "Crear ruta" },
    );
    showManualLines();
  }
  function showManualLines() {
    let r = $("#manualReg")?.value || "",
      pending = state.lines.filter((l) => !l.tripId && (!r || reg(l.region) === r));
    $("#manualLines").innerHTML = pending.length
      ? pending
          .map(
            (l) =>
              `<label style="border-bottom:1px solid #edf1f4;padding:10px;display:flex;gap:12px;align-items:center;font-weight:500"><input type="checkbox" class="routeCheck" data-uid="${E(l.uid)}" ${selectedRouteLines.has(l.uid) ? "checked" : ""} ${isPlanReady(l) ? "" : "disabled"}><span class="grow"><b>${E(l.client)}</b><small style="display:block">${E(l.originalProduct || l.product)} · ${E(l.dispatchId)} · ${E(regionLabel(l.region))}${isPlanReady(l) ? "" : " · SAP/stock pendiente"}</small></span><span>${isPlanReady(l) ? fmt(weightFor(l)) + " kg" : "—"}</span></label>`,
          )
          .join("")
      : empty("No hay pedidos sin ruta");
    refreshManualTotal();
  }

  function refreshManualTotal() {
    let a = [...selectedRouteLines].map(line).filter(Boolean),
      kg = routeWeight(a),
      v = $("#manualSelected") || $("#editSelected");
    if (v) {
      v.textContent = `${a.length} líneas · ${fmt(kg)} kg`;
      v.className = `chip ${kg > 15000 ? "red" : "green"}`;
    }
  }
  function editTripLines(id) {
    let t = trip(id);
    if (!t || t.state !== "PLANNED") return toast("Solo puedes editar la carga antes de la salida.", true);
    selectedRouteLines = new Set(t.lineIds);
    let options = state.lines.filter((l) => !l.tripId || l.tripId === t.id);
    modal(
      "Modificar carga",
      `${t.id} · ${t.name}`,
      `<div class="between"><b class="small">Líneas seleccionadas</b><span id="editSelected" class="chip">${selectedRouteLines.size} líneas</span></div><div class="scrolllimit mt12" id="editTripList">${options.map((l) => `<label style="display:flex;align-items:center;gap:10px;border-bottom:1px solid #edf0f3;padding:10px 8px;font-weight:500"><input type="checkbox" class="routeCheck" data-uid="${E(l.uid)}" ${selectedRouteLines.has(l.uid) ? "checked" : ""}><span class="grow"><b>${E(l.client)}</b><small style="display:block">${E(l.dispatchId)} · ${E(l.product)} ${l.materialCode ? '<span class="material-code">· SAP ' + E(l.materialCode) + "</span>" : '<span class="chip amber">SAP pendiente</span>'} · ${E(regionLabel(l.region))}</small></span><span>${fmt(l.kg)} kg</span></label>`).join("")}</div>`,
      () => {
        let lines = state.lines.filter((l) => selectedRouteLines.has(l.uid)),
          total = lines.reduce((a, b) => a + b.kg, 0);
        if (!lines.length) return toast("Selecciona al menos una línea.", true);
        if (total > 15000) return toast("El viaje supera la capacidad de 15.000 kg.", true);
        let old = tripLines(t);
        for (const l of old) {
          if (!selectedRouteLines.has(l.uid)) {
            l.savedCost = t.costs?.[l.transport] ?? l.savedCost ?? "";
            l.tripId = "";
            l.status = "PENDIENTE";
          }
        }
        for (const l of lines) {
          l.tripId = t.id;
          l.status = "PICKING";
          if (l.transport && l.savedCost !== undefined && l.savedCost !== "" && !Object.hasOwn(t.costs, l.transport))
            t.costs[l.transport] = l.savedCost;
        }
        t.lineIds = lines.map((l) => l.uid);
        t.region = regionOfLines(lines);
        t.stops = stopsFor(lines);
        audit("Edición carga", `${t.id} · ${lines.length} líneas`);
        closeModal();
        save();
        toast("Carga actualizada. Se verificará nuevamente el administrativo.");
      },
      { label: "Guardar carga" },
    );
    refreshManualTotal();
  }
  function removePlan(id) {
    let t = trip(id);
    if (!t || t.state !== "PLANNED") return;
    modal(
      "Quitar planificación",
      t.id,
      `<div class="notice red">Las líneas volverán a estar disponibles para planificación. Se conservarán los números administrativos ingresados y los gastos asociados.</div>`,
      () => {
        tripLines(t).forEach((l) => {
          l.savedCost = t.costs?.[l.transport] ?? l.savedCost ?? "";
          l.tripId = "";
          l.status = "PENDIENTE";
        });
        state.trips = state.trips.filter((x) => x.id !== id);
        audit("Desplanificación", id);
        closeModal();
        save();
        toast("Ruta retirada de planificación.");
      },
      { label: "Quitar planificación", small: true },
    );
  }
  function routeVehicle(id) {
    let t = trip(id);
    if (!t) return;
    modal(
      "Camión y conductor",
      `${t.id} · ${regionLabel(t.region)}`,
      `<div class="formgrid"><div class="wide">${field("name", "Nombre de la ruta", t.name)}</div>${field("driver", "Chofer", t.driver, "text", 'list="driverOptions" autocomplete="off"')}${field("ppu", "Patente (PPU)", t.ppu, "text", 'autocomplete="off"')}${field("replacement", "Chofer de reemplazo", t.replacement, "text", 'list="driverOptions"')}${field("replacementPpu", "PPU de reemplazo", t.replacementPpu)}<div class="field"><label>Tipo de transporte</label><select name="transportType"><option value="">Seleccionar</option><option value="FIJO" ${N(t.transportType) === "FIJO" ? "selected" : ""}>Fijo</option><option value="TERCERO" ${N(t.transportType) === "TERCERO" ? "selected" : ""}>Tercero</option></select></div>${field("transportCode", "Código de transporte", t.transportCode)}${field("transportCompany", "Transportista", t.transportCompany)}<div class="wide field"><label>Observación de ruta</label><textarea name="notes">${E(t.notes || "")}</textarea></div></div>`,
      () => {
        let v = getVals();
        t.name = v.name.trim() || t.name;
        t.driver = v.driver.trim();
        t.ppu = v.ppu.trim().toUpperCase();
        t.replacement = v.replacement.trim();
        t.replacementPpu = v.replacementPpu.trim().toUpperCase();
        t.transportType = v.transportType;
        t.transportCode = v.transportCode.trim();
        t.transportCompany = v.transportCompany.trim();
        t.notes = v.notes.trim();
        audit("Vehículo", `${t.id} · ${t.ppu}`);
        closeModal();
        save();
        toast("Camión y conductor guardados.");
      },
      { label: "Guardar asignación" },
    );
  }
  function depart(id) {
    let t = trip(id);
    if (!t || t.state !== "PLANNED") return toast("La ruta no está disponible para despacho.", true);
    let a = adminCheck(t);
    if (!a.complete) {
      toast("Faltan datos administrativos: " + a.missing.join(", "), true);
      return openAdmin(id);
    }
    if (routeWeight(tripLines(t)) > 15000) return toast("El viaje supera 15.000 kg.", true);
    modal(
      "Confirmar salida",
      `${t.id} · ${t.ppu} · ${t.driver}`,
      `<div class="notice green">El detalle administrativo está completo. Confirma la hora de salida real.</div><div class="formgrid mt16">${field("departure", "Fecha y hora de salida", now(), "datetime-local", "required")}</div>`,
      () => {
        let v = getVals(),
          d = new Date(v.departure);
        if (isNaN(d)) return toast("Indica una hora de salida válida.", true);
        t.state = "OUT";
        t.departure = v.departure;
        tripLines(t).forEach((l) => (l.status = "DESPACHADO"));
        audit("Salida", `${t.id} · ${t.ppu}`);
        closeModal();
        save();
        setView("flota");
        toast("Camión despachado.");
      },
      { label: "Confirmar salida", small: true },
    );
  }
  function renderDispatch() {
    let q = N($("#searchDispatch").value),
      fr = $("#filterRegion").value,
      fs = $("#filterStatus").value;
    let groups = dispatchIds()
      .map((id) => ({ id, rows: linesOf(id) }))
      .filter((g) =>
        g.rows.some((l) => {
          let t = trip(l.tripId),
            hay = [
              g.id,
              l.materialCode,
              materialByCode(l.materialCode)?.name,
              l.client,
              l.city,
              l.pv,
              l.product,
              l.originalProduct,
              l.commercial,
              l.delivery,
              l.transport,
              l.os,
              l.guide,
              t?.driver,
              t?.ppu,
              l.notes,
              regionLabel(l.region),
            ].some((x) => N(x).includes(q));
          let status = t?.state || "UNASSIGNED";
          let match =
            fs === "" ||
            (fs === "no-route" && !l.tripId) ||
            (fs === "missing" && status === "PLANNED" && !adminCheck(t).complete) ||
            (fs === "planned" && status === "PLANNED" && adminCheck(t).complete) ||
            (fs === "outside" && status === "OUT") ||
            (fs === "returning" && status === "RETURNING") ||
            (fs === "finished" && status === "FINISHED");
          return hay && (!fr || reg(l.region) === fr) && match;
        }),
      )
      .sort((a, b) => (b.rows[0]?.date || "").localeCompare(a.rows[0]?.date || ""));
    $("#dispatchCount").textContent = `${groups.length} despachos`;
    let per = 20,
      pages = Math.max(1, Math.ceil(groups.length / per));
    page = Math.max(0, Math.min(page, pages - 1));
    $("#dispatchList").innerHTML =
      groups
        .slice(page * per, (page + 1) * per)
        .map((g) => {
          let open = expanded === g.id,
            kg = routeWeight(g.rows),
            [label, kind, bar] = dispState(g.rows),
            clients = [...new Set(g.rows.map((l) => l.client))],
            ts = [...new Set(g.rows.map((l) => l.tripId).filter(Boolean))];
          let shortages = ts.map(trip).filter((t) => t?.state === "FINISHED" && num(t.ibcBalance) > 0);
          let missingIbc = shortages.reduce((sum, t) => sum + num(t.ibcBalance), 0);
          return `<div class="group" data-state="${bar}"><div class="grouphead"><button class="iconbtn" data-act="expand" data-id="${E(g.id)}" aria-label="${open ? "Cerrar" : "Mostrar"} líneas">${open ? "⌄" : "›"}</button><div class="groupheading" data-act="expand" data-id="${E(g.id)}" role="button" tabindex="0"><strong>${E(g.id)} · ${E(clients.slice(0, 2).join(" / "))}${clients.length > 2 ? "…" : ""}</strong><small>${g.rows.length} pedidos · ${fmt(kg)} kg carga teórica · ${E(regionLabel(g.rows[0].region))}</small></div>${badge(label, kind)}${missingIbc ? badge(`${fmt(missingIbc)} IBC pendientes de retorno`, "red") : ""}<div class="groupactions">${button("＋ Pedido", "add-line", g.id)}${ts.length === 1 ? button("Administrativo", "admin", ts[0]) : ""}${button(open ? "Cerrar" : "Ver pedidos", "expand", g.id)}</div></div>${open ? dispatchRows(g.rows) : ""}</div>`;
        })
        .join("") || empty("No hay despachos.");
    $("#pager").innerHTML =
      groups.length > per
        ? `${button("‹ Anterior", "page-prev", "", "outline mini", page === 0 ? "disabled" : "")}<span class="small muted">Página ${page + 1} / ${pages}</span>${button("Siguiente ›", "page-next", "", "outline mini", page === pages - 1 ? "disabled" : "")}`
        : "";
  }

  function dispatchRows(rows) {
    return `<div class="groupbody"><div class="tablewrap"><table><thead><tr><th>Cliente / material</th><th>Fecha requerida</th><th>Unidades</th><th>Pendiente</th><th>Peso SAP</th><th>Doc. comercial</th><th>Ruta / IBC</th><th>Acciones</th></tr></thead><tbody>${rows
      .map((l) => {
        let t = trip(l.tripId),
          m = materialByCode(l.materialCode);
        let shortage =
          t?.state === "FINISHED" && matType(l) === "IBC"
            ? Math.max(0, num(t.ibcBalance ?? num(t.expected?.ibc) - num(t.returned?.ibc)))
            : 0;
        return `<tr><td style="min-width:210px"><b>${E(l.client)}</b><div class="small muted">${E(l.originalProduct || l.product)} · PV ${E(l.pv || "—")} · ${E(regionLabel(l.region))}</div><div class="small muted">${m ? `SAP <b class="material-code">${E(m.code)}</b> · ${E(m.name)} · ${E(matType(l))}` : "Material SAP pendiente"}</div>${l.sourceStatus ? `<span class="chip ${stockBlocked(l) ? "red" : "amber"}">${E(l.sourceStatus)}</span>` : ""} ${l.plant ? `<span class="chip">Carga: ${E(l.plant)}</span>` : ""} ${l.notes ? `<span class="chip amber">Obs.: ${E(l.notes)}</span>` : ""}</td>
<td>${l.requestedDate || l.date ? day(l.requestedDate || l.date) : badge("Sin fecha", "amber")}</td>
<td><input class="mini-input" style="max-width:74px" type="number" min="1" step="1" data-inline="qty" data-id="${E(l.uid)}" value="${l.qty}" aria-label="Cantidad solicitada"></td>
<td><input class="mini-input" style="max-width:70px" type="number" min="0" step="1" data-inline="pendingQty" data-id="${E(l.uid)}" value="${num(l.pendingQty)}" aria-label="Cantidad pendiente"></td>
<td><b>${m && m.unit === "PC" ? fmt(orderWeight(l)) + " kg pedido" : "—"}</b><div class="small muted">${m ? `${fmt(m.gross)} kg/un. · ${fmt(weightFor(l))} kg a cargar` : "Sin material"}${matType(l) === "TB" ? " + PAL en ruta" : ""}</div></td>
<td><input class="mini-input" data-inline="commercial" data-id="${E(l.uid)}" value="${E(l.commercial || "")}" aria-label="Documento comercial" placeholder="Documento"></td>
<td>${t ? `<b>${E(t.id)}</b><div class="small muted">${E(t.ppu || "PPU pendiente")}</div>${shortage ? `<span class="chip red">${fmt(shortage)} IBC pendientes en ruta</span>` : t.state === "FINISHED" && matType(l) === "IBC" ? badge("IBC conciliados", "green") : ""}` : badge("Sin ruta", "amber")}</td>
<td><div class="flex wrap gap4">${button("Material SAP", "link-line", l.uid)}${button("Editar", "edit-line", l.uid)}${t ? button("Administrativo", "admin", t.id) : ""}${t && t.state === "FINISHED" && matType(l) === "IBC" ? button("IBC", "container-line", l.uid) : ""}</div></td></tr>`;
      })
      .join("")}</tbody></table></div></div>`;
  }

  function inlineChange(el) {
    let l = line(el.dataset.id);
    if (!l) return;
    let key = el.dataset.inline,
      val = el.value;
    if (["qty", "pendingQty"].includes(key)) {
      val = num(val);
      if (
        !Number.isInteger(val) ||
        val < 0 ||
        (key === "qty" && val <= 0) ||
        (key === "pendingQty" && val > num(l.qty))
      ) {
        toast("Cantidad inválida.", true);
        renderDispatch();
        return;
      }
      let proposed = { ...l, [key]: val };
      if (key === "qty" && num(proposed.pendingQty) > val) {
        toast("Cantidad menor al pendiente actual.", true);
        renderDispatch();
        return;
      }
      if (l.tripId && trip(l.tripId)?.state === "PLANNED") {
        let weight = routeWeight(tripLines(trip(l.tripId)).map((x) => (x.uid === l.uid ? proposed : x)));
        if (weight > 15000) return toast("La ruta supera 15.000 kg.", true);
      }
    }
    l[key] = val;
    audit("Edición pedido", `${l.dispatchId} · ${key}`);
    save();
  }

  function editLine(id) {
    let l = line(id);
    if (!l) return;
    modal(
      "Editar pedido",
      `${l.dispatchId} · ${l.client}`,
      `<div class="formgrid cols3">
${field("region", "Región", l.region, "region")}${field("client", "Cliente / ciudad", l.client, "text", 'list="clientOptions"')}${field("pv", "PV", l.pv || "")}
${field("product", "Producto solicitado", l.originalProduct || l.product, "text", 'list="productOptions"')}
${field("date", "Fecha requerida", l.requestedDate || l.date || "", "date")}${field("qty", "Cantidad solicitada", l.qty, "number", 'min="1" step="1"')}
${field("plant", "Planta de carga", l.plant || "")}${field("sourceStatus", "Status", l.sourceStatus || "")}
${field("pendingQty", "Cantidad pendiente", l.pendingQty || 0, "number", 'min="0" step="1"')}
${field("commercial", "Documento comercial", l.commercial || "")}
<div class="wide field"><label>Número de material SAP</label><input name="materialCode" value="${E(l.materialCode || "")}" placeholder="Código SAP o usa el botón Material SAP"></div>
<div class="wide field"><label>Observación</label><textarea name="notes">${E(l.notes || "")}</textarea></div></div>`,
      () => {
        let v = getVals(),
          q = num(v.qty),
          pending = num(v.pendingQty),
          m = materialByCode(v.materialCode),
          date = parseDate(v.date);
        if (
          !reg(v.region) ||
          !v.client.trim() ||
          !v.product.trim() ||
          !Number.isInteger(q) ||
          q <= 0 ||
          !Number.isInteger(pending) ||
          pending < 0 ||
          pending > q
        )
          return toast("Revisa los datos y la cantidad pendiente.", true);
        if (v.materialCode.trim() && !m) return toast("Material SAP no encontrado. Revisa el código.", true);
        let test = {
          ...l,
          region: reg(v.region),
          client: v.client.trim(),
          product: v.product.trim(),
          materialCode: v.materialCode.trim(),
          qty: q,
          pendingQty: pending,
        };
        if (l.tripId && trip(l.tripId)?.state === "PLANNED") {
          let kg = routeWeight(tripLines(trip(l.tripId)).map((x) => (x.uid === l.uid ? test : x)));
          if (kg > 15000) return toast("La ruta superaría las 15 toneladas.", true);
        }
        Object.assign(l, {
          region: reg(v.region),
          client: v.client.trim(),
          city: cityFrom(v.client),
          pv: v.pv.trim(),
          product: v.product.trim(),
          originalProduct: v.product.trim(),
          date,
          requestedDate: date,
          loadDate: date,
          qty: q,
          pendingQty: pending,
          plant: v.plant.trim(),
          sourceStatus: v.sourceStatus.trim(),
          commercial: v.commercial.trim(),
          notes: v.notes.trim(),
          materialCode: v.materialCode.trim(),
          kg: 0,
        });
        let t = trip(l.tripId);
        if (t && t.state === "PLANNED") t.stops = stopsFor(tripLines(t));
        audit("Edición pedido", `${l.dispatchId} · ${l.client}`);
        closeModal();
        save();
        toast("Pedido actualizado.");
      },
      { label: "Guardar cambios" },
    );
  }

  function searchHints() {
    let v = N($("#searchDispatch").value),
      pane = $("#searchHints");
    if (v.length < 2) {
      pane.hidden = true;
      return;
    }
    let opts = new Map();
    for (let l of state.lines) {
      let t = trip(l.tripId);
      for (let [type, val] of [
        ["Cliente", l.client],
        ["Documento comercial", l.commercial],
        ["Entrega", l.delivery],
        ["Transporte", l.transport],
        ["Orden de salida", l.os],
        ["Guía", l.guide],
        ["PPU", t?.ppu],
        ["Despacho", l.dispatchId],
      ]) {
        if (val && N(val).includes(v)) opts.set(type + val, { type, val });
        if (opts.size >= 40) break;
      }
      if (opts.size >= 40) break;
    }
    let rows = [...opts.values()].slice(0, 7);
    pane.hidden = !rows.length;
    pane.innerHTML = rows
      .map(
        (x) =>
          `<button data-act="search-hint" data-value="${E(x.val)}" type="button">${E(x.val)} <span class="muted">· ${E(x.type)}</span></button>`,
      )
      .join("");
  }
  const ADMIN_STEPS = [
    "Documento y material",
    "N° entrega",
    "N° transporte",
    "Orden de salida",
    "Guías",
    "Gasto transporte",
    "Chofer y PPU",
    "Revisar",
  ];
  function adminStageOK(t, step) {
    let ll = tripLines(t);
    if (!ll.length) return false;
    switch (step) {
      case 0:
        return ll.every(
          (l) =>
            String(l.commercial || "").trim() &&
            materialByCode(l.materialCode) &&
            materialByCode(l.materialCode).category !== "POR DEFINIR" &&
            materialByCode(l.materialCode).unit === "PC" &&
            weightFor(l) > 0,
        );
      case 1:
        return ll.every((l) => String(l.delivery || "").trim());
      case 2:
        return ll.every((l) => String(l.transport || "").trim());
      case 3:
        return ll.every((l) => String(l.os || "").trim());
      case 4:
        return ll.every((l) => String(l.guide || "").trim());
      case 5:
        return ll.every(
          (l) => l.transport && Object.hasOwn(t.costs || {}, l.transport) && String(t.costs[l.transport]).trim() !== "",
        );
      case 6:
        return (
          !!String(t.driver || "").trim() && !!String(t.ppu || "").trim() && !!String(t.transportType || "").trim()
        );
      default:
        return true;
    }
  }

  function openAdmin(id, step = 0) {
    let t = trip(id);
    if (!t) return toast("No se encontró la ruta.", true);
    activeAdmin = t.id;
    adminStep = step;
    modal("Detalle administrativo", `${E(t.id)} · ${E(t.name || "Ruta")}`, adminHtml(t), null, {
      foot: adminFoot(t),
      onClose: () => {
        activeAdmin = null;
      },
    });
  }
  function adminFooter(t) {
    let count = tripLines(t).length,
      check = adminCheck(t);
    return `${badge(count + " líneas", "")}${badge(check.percent + "% completo", check.complete ? "green" : "amber")}<div class="flex" style="margin-left:auto">${adminStep > 0 ? button("‹ Anterior", "admin-prev", "", "outline") : ""}${adminStep < 7 ? button("Continuar ›", "admin-next", "", "primary") : button("Cerrar con X", "admin-done", "", "outline")}${adminStep === 7 && t.state === "PLANNED" ? button("Confirmar salida", "depart", t.id, "primary", check.complete ? "" : "disabled") : ""}</div>`;
  }
  function adminFoot(t) {
    return adminFooter(t);
  }
  function renderAdmin() {
    let t = trip(activeAdmin);
    if (!t) return;
    $("#modalBody").innerHTML = adminHtml(t);
    enhanceRegionControls($("#modalBody"));
    $("#modalFoot").innerHTML = adminFoot(t);
    $("#modalSub").textContent = `${t.id} · ${t.name || "Ruta"}`;
  }
  const adminHeading = (text, help) =>
    `<div class="stepintro"><strong>${text}</strong><div class="mt8">${help}</div></div>`;
  function adminTable(t, key, label) {
    let ll = tripLines(t);
    return `<div class="admin-table"><div class="tablewrap"><table><thead><tr><th style="width:45px">#</th><th>Pedido</th><th>${E(label)}</th></tr></thead><tbody>${ll.map((l, i) => `<tr><td>${i + 1}</td><td><b>${E(l.client)}</b><div class="small muted">${E(l.product)} · ${E(l.commercial || "Sin documento comercial")}</div></td><td style="width:180px"><input data-admin-line="${key}" data-uid="${E(l.uid)}" value="${E(l[key] || "")}" aria-label="${E(label)} de ${E(l.client)}" placeholder="N° ${E(label)}" autocomplete="off"></td></tr>`).join("")}</tbody></table></div></div>`;
  }
  function adminPasteUI(key, title, placeholder) {
    return `<div class="pastebox"><label>${E(title)}</label><textarea id="adminBatch" placeholder="${E(placeholder)}" spellcheck="false"></textarea><div class="between mt8"><span class="small muted">Una celda por línea, en el mismo orden de la tabla.</span>${button("Pegar en líneas", "admin-paste", "", "dark mini", `data-field="${key}"`)}</div></div>`;
  }
  function adminHtml(t) {
    let ll = tripLines(t),
      check = adminCheck(t),
      stepper = `<div class="stepper">${ADMIN_STEPS.map((name, i) => `<button data-act="admin-step" data-index="${i}" class="${i === adminStep ? "current" : i < adminStep && adminStageOK(t, i) ? "done" : ""}">${i < 7 && adminStageOK(t, i) ? "✓ " : ""}${i + 1}. ${E(name)}</button>`).join("")}</div>`;
    let content = "";
    switch (adminStep) {
      case 0:
        content =
          adminHeading(
            "Documento comercial y material SAP",
            "Completa el documento comercial y confirma el código SAP real de cada presentación antes de continuar.",
          ) +
          `<div class="admin-grid">${adminPasteUI("commercial", "Opcional: pegar documentos comerciales", "Un número por línea")}
<div class="tablewrap"><table><thead><tr><th>Pedido</th><th>Material SAP</th><th>Documento comercial</th></tr></thead><tbody>${ll.map((l) => `<tr><td><b>${E(l.client)}</b><div class="small muted">${E(l.product)}</div></td><td>${l.materialCode ? `<span class="material-code">${E(l.materialCode)}</span>` : badge("Por vincular", "amber")}<div class="mt8">${button("Seleccionar", "link-line", l.uid)}</div></td><td><input data-admin-line="commercial" data-uid="${E(l.uid)}" value="${E(l.commercial || "")}" placeholder="Documento SAP"></td></tr>`).join("")}</tbody></table></div></div>`;
        break;
      case 1:
        content =
          adminHeading(
            "Entregas por pedido",
            "Copia la columna de números de entrega desde Excel y pégala de una sola vez. Cada número quedará asociado a una línea.",
          ) +
          `<div class="admin-grid">${adminPasteUI("delivery", "Pegar números de entrega", "Pega un número por línea")}${adminTable(t, "delivery", "N° entrega")}</div>`;
        break;
      case 2:
        content =
          adminHeading(
            "Números de transporte",
            "Habitualmente todas las líneas usan el mismo transporte. Aplica uno general o cambia únicamente las excepciones.",
          ) +
          `<div class="quickbox"><div class="flex"><div class="grow field"><label>N° transporte común</label><input id="sharedAdmin" placeholder="N° transporte"></div>${button("Aplicar a todas", "admin-shared", "", "dark", `data-field="transport"`)}</div></div><div class="admin-grid mt12">${adminPasteUI("transport", "Opcional: pegar números por línea", "Pega números por línea cuando son diferentes")}${adminTable(t, "transport", "N° transporte")}</div>`;
        break;
      case 3:
        content =
          adminHeading(
            "Órdenes de salida",
            "Normalmente todas las líneas llevan la misma orden de salida. Puedes editar una línea si tiene una orden distinta.",
          ) +
          `<div class="quickbox"><div class="flex"><div class="grow field"><label>Orden de salida común</label><input id="sharedAdmin" placeholder="N° orden de salida"></div>${button("Aplicar a todas", "admin-shared", "", "dark", `data-field="os"`)}</div></div><div class="admin-grid mt12">${adminPasteUI("os", "Opcional: órdenes por línea", "Pega una orden por línea")}${adminTable(t, "os", "Orden de salida")}</div>`;
        break;
      case 4:
        content =
          adminHeading(
            "Guías de despacho por entrega",
            "Cada número de entrega debe tener su propia guía de despacho. También puedes corregir una línea individualmente.",
          ) +
          `<div class="admin-grid">${adminPasteUI("guide", "Pegar guías de despacho", "Pega una guía por línea")}${adminTable(t, "guide", "Guía de despacho")}</div>`;
        break;
      case 5: {
        let codes = [...new Set(ll.map((l) => String(l.transport || "").trim()).filter(Boolean))];
        content = adminHeading(
          "Gasto asociado al transporte",
          "El importe se guarda una sola vez por número de transporte, aunque ese transporte aparezca en varias líneas.",
        );
        content += codes.length
          ? `<div class="admin-table"><table><thead><tr><th>N° transporte</th><th>Líneas asociadas</th><th>Gasto de transporte ($)</th></tr></thead><tbody>${codes.map((code) => `<tr><td><b>${E(code)}</b></td><td>${ll.filter((l) => l.transport === code).length} líneas</td><td style="width:210px"><input type="number" min="0" step="any" data-admin-cost="${E(code)}" value="${E(t.costs?.[code] ?? "")}" placeholder="Monto único"></td></tr>`).join("")}</tbody></table></div><div class="notice green mt12">Los gastos se suman por transporte, no por cantidad de líneas.</div>`
          : `<div class="notice red">Completa primero los números de transporte.</div>`;
        break;
      }
      case 6:
        content =
          adminHeading(
            "Chofer, patente y transportista",
            "Al seleccionar un chofer de Directrices se sugiere su PPU, código y transportista. Puedes ajustar los datos de un reemplazo.",
          ) +
          `<div class="formgrid" id="adminDriver">${field("driver", "Chofer", t.driver, "text", 'list="driverOptions" data-admin-trip="driver"')}${field("ppu", "Patente (PPU)", t.ppu, "text", 'data-admin-trip="ppu"')}${field("replacement", "Chofer de reemplazo (opcional)", t.replacement, "text", 'list="driverOptions" data-admin-trip="replacement"')}${field("replacementPpu", "PPU reemplazo (opcional)", t.replacementPpu, "text", 'data-admin-trip="replacementPpu"')}<div class="field"><label>Tipo de transporte</label><select name="transportType" data-admin-trip="transportType"><option value="">Seleccionar</option><option value="FIJO" ${N(t.transportType) === "FIJO" ? "selected" : ""}>Fijo</option><option value="TERCERO" ${N(t.transportType) === "TERCERO" ? "selected" : ""}>Tercero</option></select></div>${field("transportCode", "Código transporte", t.transportCode, "text", 'data-admin-trip="transportCode"')}${field("transportCompany", "Empresa de transporte", t.transportCompany, "text", 'data-admin-trip="transportCompany"')}</div>`;
        break;
      case 7:
        content =
          adminHeading(
            "Validación administrativa",
            check.complete
              ? "Toda la información requerida está completa. Puedes confirmar la salida."
              : "Hay datos pendientes. Regresa a la etapa correspondiente para completarlos.",
          ) +
          `<div class="grid cols2">${check.checks.map(([label, ok], i) => `<div class="quickbox"><div class="between"><b>${E(label)}</b>${badge(ok ? "Completo" : "Pendiente", ok ? "green" : "amber")}</div><button class="btnlink mt8" data-act="admin-step" data-index="${i}">Revisar</button></div>`).join("")}</div>${check.complete ? '<div class="notice green mt16">Ruta lista para despacho.</div>' : `<div class="notice red mt16">Falta: ${E(check.missing.join(", "))}</div>`}`;
        break;
    }
    return `${stepper}<div class="between mt8" style="margin-bottom:13px"><span class="small muted">${ll.length} pedidos asociados a esta ruta</span><div class="metricline">${badge(check.percent + "% administrativo", check.complete ? "green" : "amber")}</div></div>${content}`;
  }
  function persistAdminInput(el) {
    let t = trip(activeAdmin);
    if (!t) return;
    if (el.dataset.adminLine) {
      let l = line(el.dataset.uid);
      if (!l) return;
      l[el.dataset.adminLine] = el.value.trim();
      audit("Administrativo", `${t.id} ${el.dataset.adminLine}`);
    } else if (el.dataset.adminCost !== undefined) {
      t.costs ??= {};
      t.costs[el.dataset.adminCost] = el.value.trim();
      audit("Gasto transporte", `${t.id} · ${el.dataset.adminCost}`);
    } else if (el.dataset.adminTrip) {
      t[el.dataset.adminTrip] = el.value.trim();
      if (el.dataset.adminTrip === "ppu" || el.dataset.adminTrip === "replacementPpu")
        t[el.dataset.adminTrip] = t[el.dataset.adminTrip].toUpperCase();
      if (el.dataset.adminTrip === "driver") {
        syncDriver(el.value, $("#adminDriver"));
        let d = getDriver(el.value);
        if (d) {
          t.ppu = d.ppu;
          t.transportCode = d.code;
          t.transportCompany = d.company;
          t.transportType = N(d.type) === "FIJO" ? "FIJO" : d.type || "";
        }
      } else if (el.dataset.adminTrip === "replacement") {
        let d = getDriver(el.value);
        if (d) {
          t.replacementPpu = d.ppu;
          let p = $("[name=replacementPpu]", $("#adminDriver"));
          if (p) p.value = d.ppu;
        }
      }
      audit("Conductor", `${t.id} · ${t.driver}`);
    }
    save();
  }
  function adminApplyPaste(field) {
    let t = trip(activeAdmin),
      ll = tripLines(t),
      raw = $("#adminBatch")?.value || "";
    if (!raw.trim()) return toast("Pega los valores desde Excel.", true);
    let rows = raw.replace(/\r/g, "").split("\n");
    while (rows.length && rows.at(-1).trim() === "") rows.pop();
    let values = rows.map((s) => s.split("\t")[0].trim());
    if (values.length !== ll.length)
      return toast(
        `Pegaste ${values.length} valores, pero esta ruta tiene ${ll.length} líneas. Verifica el orden.`,
        true,
      );
    ll.forEach((l, i) => (l[field] = values[i]));
    audit("Pegado administrativo", `${t.id}: ${field}, ${ll.length} líneas`);
    save();
    renderAdmin();
    toast(`${values.length} números aplicados correctamente.`);
  }
  function adminShared(field) {
    let t = trip(activeAdmin),
      value = $("#sharedAdmin")?.value.trim();
    if (!t || !value) return toast("Ingresa primero el número compartido.", true);
    tripLines(t).forEach((l) => (l[field] = value));
    audit("Aplicar común", `${t.id}: ${field} = ${value}`);
    save();
    renderAdmin();
    toast("Número aplicado a todas las líneas. Puedes editar excepciones.");
  }
  function navigateAdmin(next) {
    let t = trip(activeAdmin);
    if (!t) return;
    let n = Number(next);
    if (n > adminStep) {
      for (let i = 0; i < n; i++)
        if (!adminStageOK(t, i)) {
          toast(`Completa primero: ${ADMIN_STEPS[i]}.`, true);
          adminStep = i;
          renderAdmin();
          return;
        }
    }
    adminStep = Math.max(0, Math.min(7, n));
    renderAdmin();
  }
  function returnNotice(id) {
    let t = trip(id);
    if (!t || t.state !== "OUT") return toast("Solo se puede anunciar el retorno de un camión despachado.", true);
    modal(
      "Aviso de retorno",
      `${t.id} · ${t.ppu || "PPU pendiente"}`,
      `<div class="notice">El chofer informó que comienza el regreso. El viaje seguirá pendiente hasta registrar la llegada al CD.</div><div class="formgrid mt16">${field("when", "Hora del aviso", now(), "datetime-local")}<div class="wide field"><label>Observaciones (opcional)</label><textarea name="returnNote"></textarea></div></div>`,
      () => {
        let v = getVals();
        if (isNaN(new Date(v.when))) return toast("Hora inválida.", true);
        t.state = "RETURNING";
        t.returnNotice = v.when;
        t.returnNote = v.returnNote.trim();
        tripLines(t).forEach((l) => (l.status = "PENDIENTE_RETORNO"));
        audit("Retorno anunciado", `${t.id} · ${v.when}`);
        closeModal();
        save();
        toast("Retorno anunciado. La llegada sigue pendiente.");
      },
      { small: true, label: "Registrar aviso" },
    );
  }
  function arrival(id) {
    let t = trip(id);
    if (!t || t.state !== "RETURNING") return toast("Primero registra el aviso de retorno.", true);
    let ll = tripLines(t),
      expected = expectedPack(ll);
    let body = `<div class="notice green"><b>Registro de llegada</b><div class="small mt8">IBC obligatorio · PAL y tambores solo informativos. Las diferencias se calculan automáticamente.</div></div>
<div class="formgrid cols3 mt16">${field("when", "Fecha y hora de llegada", now(), "datetime-local")}<div class="quickbox">IBC enviados <b>${fmt(expected.ibc)}</b></div><div class="quickbox">TB enviados <b>${fmt(expected.tb)}</b><p>PAL estimados: ${fmt(expected.pal)}</p></div>
${field("ibc", "IBC que regresaron al CD", t.returned?.ibc ?? "", "number", `min="0" max="${expected.ibc}" step="1" required`)}
${field("pal", "PAL retornados (opcional)", t.returned?.pal ?? "", "number", 'min="0" step="1"')}
${field("tb", "Tambores retornados (opcional)", t.returned?.tb ?? "", "number", `min="0" max="${expected.tb}" step="1"`)}
<div class="wide field"><label>Observaciones de llegada</label><textarea name="arrivalNote" placeholder="Daños, faltantes o novedades">${E(t.arrivalNote || "")}</textarea></div></div>
<div class="notice amber mt12">Si el camión contiene IBC de distintos clientes, el saldo se informará inicialmente a nivel de viaje. Podrás atribuirlo a pedidos desde «IBC» en la base de despachos.</div>`;
    modal(
      "Confirmar llegada al CD",
      `${t.id} · ${t.ppu}`,
      body,
      () => {
        let v = getVals();
        let sent = expected.ibc,
          returned = num(v.ibc);
        if (!v.when || isNaN(new Date(v.when))) return toast("Registra una hora de llegada válida.", true);
        if (v.ibc === "" || !Number.isInteger(returned) || returned < 0 || returned > sent)
          return toast(`Indica cuántos IBC volvieron, entre 0 y ${sent}.`, true);
        let pal = v.pal === "" ? "" : num(v.pal),
          tb = v.tb === "" ? "" : num(v.tb);
        if (
          (pal !== "" && (!Number.isInteger(pal) || pal < 0)) ||
          (tb !== "" && (!Number.isInteger(tb) || tb < 0 || tb > expected.tb))
        )
          return toast("Revisa PAL y tambores retornados.", true);
        t.returned = { ibc: returned, pal, tb };
        t.expected = expected;
        t.ibcBalance = Math.max(0, sent - returned);
        t.palBalance = pal === "" ? "" : Math.max(0, expected.pal - pal);
        t.arrival = v.when;
        t.arrivalNote = v.arrivalNote.trim();
        t.state = "FINISHED";
        for (let l of ll) {
          l.status = "FINALIZADO";
          if (matType(l) === "IBC") {
            l.returnQty = "";
            l.balance = "";
          } else {
            l.returnQty = "";
            l.balance = 0;
          }
        }
        let ibcLines = ll.filter((l) => matType(l) === "IBC");
        if (ibcLines.length === 1) {
          ibcLines[0].returnQty = returned;
          ibcLines[0].balance = t.ibcBalance;
        }
        audit("Llegada", `${t.id}: IBC ${returned}/${sent}, pendiente ${t.ibcBalance}`);
        closeModal();
        save();
        toast(
          t.ibcBalance ? `Llegada registrada. Faltan ${t.ibcBalance} IBC.` : "Llegada registrada. IBC conciliados.",
        );
      },
      { label: "Finalizar llegada" },
    );
  }
  function containerLine(uid) {
    let l = line(uid),
      t = trip(l?.tripId);
    if (!l || t?.state !== "FINISHED") return toast("La rendición es posterior a la llegada.", true);
    if (matType(l) !== "IBC") return toast("El control obligatorio de retorno es solo para IBC.", true);
    let all = tripLines(t).filter((x) => matType(x) === "IBC"),
      recovered = num(t.returned?.ibc),
      used = all.filter((x) => x.uid !== l.uid && x.returnQty !== "").reduce((s, x) => s + num(x.returnQty), 0),
      max = Math.min(shipUnits(l), recovered - used);
    modal(
      "Conciliar IBC por pedido",
      `${l.dispatchId} · ${l.client}`,
      `<div class="quickbox"><b>${E(l.product)}</b><p>${fmt(shipUnits(l))} IBC enviados · ${fmt(recovered)} retornaron en el viaje ${E(t.id)} · ${fmt(num(t.ibcBalance))} pendientes totales</p></div><div class="formgrid cols2 mt12">${field("guideDate", "Fecha de rendición GD", l.guideDate || "", "date")}${field("returnQty", "IBC de este pedido que regresaron", l.returnQty === "" ? "" : l.returnQty, "number", `min="0" max="${max}" step="1" placeholder="Por atribuir"`)}</div><div class="small muted mt12">No se repartirán automáticamente faltantes entre clientes. La cantidad ingresada se compara con el total recibido de la ruta.</div>`,
      () => {
        let v = getVals(),
          n = num(v.returnQty);
        if (v.returnQty !== "" && (!Number.isInteger(n) || n < 0 || n > max))
          return toast(`Ingresa entre 0 y ${max} IBC para este pedido.`, true);
        l.returnQty = v.returnQty === "" ? "" : n;
        l.balance = v.returnQty === "" ? "" : Math.max(0, shipUnits(l) - n);
        l.guideDate = v.guideDate || "";
        audit("Conciliación IBC", `${l.dispatchId}: ${l.returnQty} recibidos`);
        closeModal();
        save();
        toast("Conciliación guardada.");
      },
      { small: true, label: "Guardar conciliación" },
    );
  }
  function renderFleet() {
    let f = $("#fleetFilter").value,
      trips = state.trips
        .filter(
          (t) =>
            f === "all" ||
            (f === "finished" && t.state === "FINISHED") ||
            (f === "active" && ["OUT", "RETURNING"].includes(t.state)),
        )
        .sort((a, b) => (b.departure || "").localeCompare(a.departure || ""));
    $("#fleetCount").textContent = `${trips.length} viajes`;
    $("#fleetList").innerHTML = trips.length
      ? trips
          .map((t) => {
            let check = adminCheck(t),
              ll = tripLines(t),
              kg = routeWeight(ll),
              eta = theoretical(t),
              kind =
                t.state === "OUT" ? "blue" : t.state === "RETURNING" ? "amber" : t.state === "FINISHED" ? "green" : "",
              label =
                t.state === "OUT"
                  ? "Camión fuera"
                  : t.state === "RETURNING"
                    ? "Retorno anunciado"
                    : t.state === "FINISHED"
                      ? "Finalizado"
                      : "Planificado";
            return `<div class="fleetrow"><div><div class="between wrap"><h3>${E(t.ppu || "PPU pendiente")} · ${E(t.driver || "Chofer sin asignar")}</h3>${badge(label, kind)}</div><p>${E(t.id)} · ${E(t.name || "Ruta")} · ${E(regionLabel(t.region))}</p><p>${ll.length} líneas · ${fmt(kg)} kg bruto aprox. · ${E((t.stops || []).map((s) => s.name).join(" → ") || "Destino por confirmar")}</p>${t.state === "OUT" ? `<p><b>Salida:</b> ${datetime(t.departure)} ${eta ? `· <b>Retorno teórico:</b> ${datetime(eta.at)} · ${fmt(eta.km)} km aproximados` : ""}</p>` : ""}${t.state === "RETURNING" ? `<p><b>Aviso de retorno:</b> ${datetime(t.returnNotice)} · <b>Pendiente de llegada al CD</b></p>` : ""}${t.state === "FINISHED" ? `<p><b>Llegada:</b> ${datetime(t.arrival)} · <b>Envases:</b> PAL ${fmt(t.returned?.pal)} · IBC ${fmt(t.returned?.ibc)} · TB ${fmt(t.returned?.tb)} · IBC pendiente ${fmt(t.ibcBalance || 0)}</p>` : ""}</div><div class="fleeta">${t.state === "OUT" ? button("Aviso de retorno", "return-notice", t.id, "primary") : ""}${t.state === "RETURNING" ? button("Registrar llegada", "arrival", t.id, "primary") : ""}${t.state === "PLANNED" ? button("Administrativo", "admin", t.id, "outline") : ""}${t.state === "FINISHED" ? button("Rendiciones", "show-renditions", t.id, "outline") : ""}${button("Ver viaje", "view-trip", t.id, "outline")}</div></div>`;
          })
          .join("")
      : empty(f === "active" ? "No hay camiones fuera ni pendientes de llegada" : "No hay viajes para mostrar");
  }
  function viewTrip(id) {
    let t = trip(id);
    if (!t) return;
    let ll = tripLines(t),
      status =
        t.state === "OUT"
          ? "Camión fuera"
          : t.state === "RETURNING"
            ? "Retorno anunciado"
            : t.state === "FINISHED"
              ? "Finalizado"
              : "Planificado";
    modal(
      `Viaje ${t.id}`,
      `${t.ppu || "Sin PPU"} · ${t.driver || "Sin chofer"}`,
      `<div class="between">${badge(status, t.state === "OUT" ? "blue" : t.state === "FINISHED" ? "green" : "amber")}<span class="small muted">${fmt(routeWeight(ll))} kg · ${ll.length} líneas</span></div><div class="grid cols2 mt16"><div class="quickbox"><b>Salida</b><p>${datetime(t.departure)}</p></div><div class="quickbox"><b>Regreso / llegada</b><p>${datetime(t.returnNotice)} / ${datetime(t.arrival)}</p></div></div><div class="subheading">Pedidos transportados</div><div class="tablewrap"><table><thead><tr><th>Despacho</th><th>Cliente</th><th>Entrega</th><th>Guía</th><th>N° transporte</th></tr></thead><tbody>${ll.map((l) => `<tr><td>${E(l.dispatchId)}</td><td>${E(l.client)}</td><td>${E(l.delivery || "—")}</td><td>${E(l.guide || "—")}</td><td>${E(l.transport || "—")}</td></tr>`).join("")}</tbody></table></div><div class="small muted mt12">${E(t.notes || "")}</div>`,
      null,
      {
        foot: `<span class="muted small">${E(t.name || "")}</span><span>${button("Administrativo", "admin", t.id, "outline mini")}${t.state === "OUT" ? button("Aviso de retorno", "return-notice", t.id, "primary") : t.state === "RETURNING" ? button("Registrar llegada", "arrival", t.id, "primary") : ""}</span>`,
      },
    );
  }

  function showRenditions(id) {
    let t = trip(id);
    if (t?.state !== "FINISHED") return;
    let rows = tripLines(t).filter((l) => matType(l) === "IBC");
    let allocated = rows.filter((l) => l.returnQty !== "").reduce((sum, l) => sum + num(l.returnQty), 0);
    modal(
      "Control de retornos IBC",
      t.id,
      `<div class="notice ${num(t.ibcBalance) > 0 ? "red" : "green"}">IBC enviados: <b>${fmt(num(t.expected?.ibc))}</b> · Retornaron: <b>${fmt(num(t.returned?.ibc))}</b> · Pendientes: <b>${fmt(num(t.ibcBalance))}</b></div>
<div class="small muted mt12">IBC atribuidos a pedidos: ${fmt(allocated)} de ${fmt(num(t.returned?.ibc))}. El resto no está identificado por cliente.</div><div class="tablewrap mt12"><table><thead><tr><th>Cliente</th><th>Material</th><th>IBC enviados</th><th>IBC atribuidos</th><th>Saldo por pedido</th><th></th></tr></thead><tbody>${rows.map((l) => `<tr><td>${E(l.client)}</td><td>${E(l.materialCode || "")}</td><td>${fmt(shipUnits(l))}</td><td>${l.returnQty === "" ? "Por atribuir" : fmt(l.returnQty)}</td><td>${l.balance === "" ? "—" : fmt(l.balance)}</td><td>${button("Conciliar", "container-line", l.uid)}</td></tr>`).join("") || '<tr><td colspan="6">Esta ruta no transportó IBC.</td></tr>'}</tbody></table></div>`,
      null,
      { foot: '<span class="small muted">El saldo oficial se controla por ruta y no se duplica por pedido.</span>' },
    );
  }
  function renderPending() {
    let un = state.lines.filter((l) => !l.tripId),
      late = state.lines.filter(isLate),
      ret = state.trips.filter((t) => t.state === "RETURNING"),
      ibcTrips = state.trips.filter((t) => t.state === "FINISHED" && num(t.ibcBalance) > 0),
      ibcTotal = ibcTrips.reduce((n, t) => n + num(t.ibcBalance), 0);
    $("#pendingKpis").innerHTML =
      stat("Sin planificar", un.length, "Pedidos sin viaje", "□", "#b77718", "#fff4df") +
      stat("Pedidos atrasados", late.length, "Fecha requerida vencida", "!", "#c83c2b", "#fff0ec") +
      stat("Retornos pendientes", ret.length, "Avisó sin llegar", "↶", "#b87915", "#fff7dd") +
      stat("IBC sin recuperar", ibcTotal, `${ibcTrips.length} viaje(s) con diferencia`, "◈", "#b32e2a", "#ffebe7");
    let q = N($("#pendingSearch").value),
      filter = $("#pendingFilter").value;
    let selected = state.lines
      .filter((l) => {
        let t = trip(l.tripId),
          p =
            !l.tripId ||
            t?.state === "PLANNED" ||
            t?.state === "RETURNING" ||
            num(l.pendingQty) > 0 ||
            (t?.state === "FINISHED" && num(t.ibcBalance) > 0 && matType(l) === "IBC") ||
            !!l.notes;
        let ok =
          filter === "all"
            ? p
            : filter === "late"
              ? isLate(l)
              : filter === "unplanned"
                ? !l.tripId
                : filter === "returned"
                  ? t?.state === "RETURNING"
                  : filter === "containers"
                    ? t?.state === "FINISHED" && num(t.ibcBalance) > 0 && matType(l) === "IBC"
                    : p;
        return (
          ok &&
          [l.client, l.product, l.pv, l.commercial, l.notes, l.delivery, l.transport, l.guide, l.dispatchId].some((x) =>
            N(x).includes(q),
          )
        );
      })
      .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
    $("#pendingList").innerHTML = selected.length
      ? selected
          .map((l) => {
            let t = trip(l.tripId);
            let ibcDue = t?.state === "FINISHED" && matType(l) === "IBC" && num(t.ibcBalance) > 0;
            let title = ibcDue
              ? `${fmt(t.ibcBalance)} IBC pendientes (ruta)`
              : num(l.pendingQty) > 0
                ? `${fmt(l.pendingQty)} unidades pendientes`
                : isLate(l)
                  ? "Atrasado"
                  : !t
                    ? "Sin ruta"
                    : t.state === "RETURNING"
                      ? "Retorno pendiente"
                      : "Planificado";
            return `<div class="rowline"><div class="grow"><b>${E(l.client)}</b><small>${E(l.dispatchId)} · ${E(l.originalProduct || l.product)} · ${l.date ? day(l.date) : "Sin fecha"} · ${E(regionLabel(l.region))}</small>${l.notes ? `<small style="color:#ab6625">Obs.: ${E(l.notes)}</small>` : ""}</div>${badge(title, ibcDue || isLate(l) ? "red" : "amber")}${button("Observación", "edit-notes", l.uid)}</div>`;
          })
          .join("")
      : empty("No hay pendientes");
  }

  function editNotes(id) {
    let l = line(id);
    if (!l) return;
    modal(
      "Observaciones de pedido",
      `${l.dispatchId} · ${l.client}`,
      `<div class="field"><label>Observación</label><textarea name="notes" placeholder="Registra faltantes, atrasos, cambios o gestión pendiente">${E(l.notes || "")}</textarea></div>`,
      () => {
        l.notes = $("[name=notes]", $("#modalBody")).value.trim();
        audit("Observación", `${l.dispatchId}`);
        closeModal();
        save();
        toast("Observación actualizada.");
      },
      { small: true, label: "Guardar observación" },
    );
  }
  function renderDrivers() {
    let list = state.drivers;
    $("#driversCount").textContent = `${list.length} conductores`;
    $("#driversTable").innerHTML = list.length
      ? `<table style="min-width:650px"><thead><tr><th>Chofer</th><th>Patente</th><th>Código</th><th>Transportista</th><th>Reemplazo / PPU</th><th></th></tr></thead><tbody>${list.map((d) => `<tr><td><b>${E(d.name || "—")}</b></td><td>${E(d.ppu || "Sin asociar")}</td><td>${E(d.code || "—")}</td><td>${E(d.company || "—")}</td><td>${E(d.replacement || "—")} · ${E(d.replacementPpu || "Sin PPU")}</td><td>${button("Editar", "edit-driver", d.id)}</td></tr>`).join("")}</tbody></table>`
      : empty("Sin conductores");
  }
  function editDriver(id = "") {
    let d = state.drivers.find((v) => v.id === id) || {
      id: "",
      name: "",
      ppu: "",
      code: "",
      company: "",
      type: "Fijo",
      replacement: "",
      replacementPpu: "",
    };
    modal(
      d.id ? "Editar chofer" : "Nuevo chofer",
      "Vincula la patente al conductor.",
      `<div class="formgrid">${field("name", "Chofer", d.name)}${field("ppu", "PPU habitual", d.ppu)}${field("code", "Código transporte", d.code)}${field("company", "Transportista", d.company)}<div class="field"><label>Tipo transporte</label><select name="type"><option value="Fijo" ${N(d.type) === "FIJO" ? "selected" : ""}>Fijo</option><option value="Tercero" ${N(d.type) === "TERCERO" ? "selected" : ""}>Tercero</option></select></div>${field("replacement", "Chofer de reemplazo", d.replacement)}${field("replacementPpu", "PPU reemplazo", d.replacementPpu)}</div>`,
      () => {
        let v = getVals();
        if (!v.name.trim()) return toast("Ingresa nombre del chofer.", true);
        if (!d.id) {
          d.id = safeId();
          state.drivers.push(d);
        }
        for (let k of ["name", "ppu", "code", "company", "type", "replacement", "replacementPpu"]) d[k] = v[k].trim();
        d.ppu = d.ppu.toUpperCase();
        d.replacementPpu = d.replacementPpu.toUpperCase();
        audit("Directrices", d.name);
        setupLists();
        closeModal();
        save();
        toast("Datos del conductor guardados.");
      },
      { label: "Guardar chofer" },
    );
  }
  function download(filename, content, type) {
    let b = new Blob([content], { type }),
      url = URL.createObjectURL(b),
      a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function backup() {
    download(
      `CL14_respaldo_${today()}.json`,
      JSON.stringify({ version: 8, created: now(), data: state }, null, 2),
      "application/json;charset=utf-8",
    );
    toast("Respaldo descargado.");
  }
  function exportCSV() {
    let seen = new Set(),
      headers = [
        "Región",
        "Cliente",
        "PV",
        "Producto solicitado",
        "Material SAP",
        "Denominación SAP",
        "Fecha requerida",
        "Cantidad solicitada",
        "Cantidad pendiente",
        "Cantidad disponible",
        "Peso bruto SAP (kg)",
        "Planta de carga",
        "Status origen",
        "Observación",
        "ID despacho",
        "Documento comercial",
        "N° entrega",
        "N° transporte",
        "Gasto transporte",
        "OS",
        "Guía de despacho",
        "Ruta",
        "Chofer",
        "PPU",
        "Estado ruta",
        "IBC enviados ruta",
        "IBC retornados ruta",
        "IBC pendientes ruta",
      ];
    let data = state.lines.map((l) => {
      let t = trip(l.tripId),
        m = materialByCode(l.materialCode),
        cost = "";
      let k = t?.id + "|" + l.transport;
      if (t && l.transport && !seen.has(k)) {
        seen.add(k);
        cost = t.costs?.[l.transport] ?? "";
      }
      return [
        regionLabel(l.region),
        l.client,
        l.pv,
        l.originalProduct || l.product,
        l.materialCode,
        m?.name || "",
        day(l.requestedDate || l.date),
        l.qty,
        l.pendingQty,
        shipUnits(l),
        weightFor(l),
        l.plant,
        l.sourceStatus,
        l.notes,
        l.dispatchId,
        l.commercial,
        l.delivery,
        l.transport,
        cost,
        l.os,
        l.guide,
        t?.id || "",
        t?.driver || "",
        t?.ppu || "",
        t?.state || "",
        t?.expected?.ibc ?? "",
        t?.returned?.ibc ?? "",
        t?.ibcBalance ?? "",
      ];
    });
    let q = (x) => `"${String(x ?? "").replace(/"/g, '""')}"`;
    download(
      `CL14_despachos_${today()}.csv`,
      "\ufeff" + [headers, ...data].map((row) => row.map(q).join(";")).join("\r\n"),
      "text/csv;charset=utf-8",
    );
    toast("CSV exportado.");
  }
  async function restore(file) {
    if (!file) return;
    let content;
    try {
      content = JSON.parse(await file.text());
    } catch {
      return toast("El archivo JSON no es válido.", true);
    }
    let d = content.data || content;
    if (!Array.isArray(d.lines) || !Array.isArray(d.trips))
      return toast("Este respaldo no contiene el formato esperado.", true);
    modal(
      "Restaurar respaldo",
      "Esta acción reemplazará los registros actuales.",
      `<div class="notice red">¿Restaurar ${d.lines.length} líneas y ${d.trips.length} viajes desde el respaldo? Los datos actuales quedarán reemplazados.</div>`,
      () => {
        state = d;
        if (!Array.isArray(state.drivers)) state.drivers = DRIVERS_SEED.map((x) => ({ ...x }));
        if (!Array.isArray(state.history)) state.history = [];
        if (!Array.isArray(state.materials)) state.materials = MATERIAL_SEED.map((m) => ({ ...m }));
        closeModal();
        setupLists();
        save();
        toast("Respaldo restaurado.");
      },
      { small: true, label: "Restaurar datos" },
    );
  }
  function resetData() {
    modal(
      "Vaciar despachos",
      "No se eliminarán los conductores ni sus patentes.",
      `<div class="notice red">Se eliminarán todos los despachos, rutas, gastos, retornos y observaciones registrados en este navegador.</div><div class="field mt16"><label>Escribe VACIAR para confirmar</label><input name="confirm" autocomplete="off" placeholder="VACIAR"></div>`,
      () => {
        if (N($("[name=confirm]", $("#modalBody")).value) !== "VACIAR") return toast("Debes escribir VACIAR.", true);
        state.lines = [];
        state.trips = [];
        state.notes = [];
        state.history = [];
        state.seq = 0;
        state.tripSeq = 0;
        expanded = "";
        closeModal();
        save();
        toast("Base vacía y lista para iniciar.");
      },
      { small: true, label: "Vaciar despachos" },
    );
  }
  function setupLists() {
    let drivers = [...new Set(state.drivers.flatMap((d) => [d.name, d.replacement]).filter(Boolean))];
    $("#driverOptions").innerHTML = drivers.map((x) => `<option value="${E(x)}"></option>`).join("");
    let clients = new Set([...CLIENT_OPTIONS, ...state.lines.map((l) => l.client)]),
      products = new Set([
        ...PRODUCT_OPTIONS,
        ...state.lines.map((l) => l.product),
        ...state.materials.filter((m) => m.sapType === "FERT").map((m) => m.name),
      ]);
    $("#clientOptions").innerHTML = [...clients].map((x) => `<option value="${E(x)}"></option>`).join("");
    $("#productOptions").innerHTML = [...products].map((x) => `<option value="${E(x)}"></option>`).join("");
    $("#cityOptions").innerHTML = Object.keys(CITIES)
      .map((x) => `<option value="${E(x)}"></option>`)
      .join("");
  }
  function wireFiles() {
    const file = $("#uploadFile");
    file.addEventListener("change", async (e) => {
      let f = e.target.files?.[0];
      if (!f) return;
      let matrix;
      try {
        if (/\.xlsx$|\.xlsm$/i.test(f.name)) matrix = await readXLSX(f);
        else matrix = parseRaw(await f.text()).map((x) => x.raw);
      } catch (err) {
        console.error(err);
        toast("No fue posible leer el archivo. Puedes pegar las 10 columnas desde Excel.", true);
        return;
      }
      let parsed = createRows(matrix.map((raw, i) => ({ raw, rowNumber: i + 1 })));
      importRows = parsed.rows;
      showImportPreview(parsed.errors);
      toast(`${parsed.rows.length} líneas detectadas.`);
      file.value = "";
    });
    $("#restoreFile").addEventListener("change", (e) => {
      restore(e.target.files?.[0]);
      e.target.value = "";
    });
  }
  function wireUI() {
    document.addEventListener("click", (ev) => {
      let v = ev.target.closest("[data-view]");
      if (v) {
        setView(v.dataset.view);
        return;
      }
      let importLink = ev.target.closest("[data-import-tab]");
      if (importLink) {
        importTab = importLink.dataset.importTab;
        $$("[data-import-tab]").forEach((b) => b.classList.toggle("active", b === importLink));
        $("#pasteTab").hidden = importTab !== "paste";
        $("#fileTab").hidden = importTab !== "file";
        return;
      }
      if (ev.target.closest("#modalSave")) {
        modalHandler?.();
        return;
      }
      let b = ev.target.closest("[data-act]");
      if (!b) return;
      let a = b.dataset.act,
        id = b.dataset.id;
      switch (a) {
        case "goto":
          setView(b.dataset.to);
          break;
        case "new-material":
          editMaterial();
          break;
        case "edit-material":
          editMaterial(id);
          break;
        case "export-materials":
          exportMaterials();
          break;
        case "mat-prev":
          matPage--;
          renderMaterials();
          break;
        case "mat-next":
          matPage++;
          renderMaterials();
          break;
        case "link-line":
          showMaterialPicker("line", id);
          break;
        case "link-import":
          showMaterialPicker("import", b.dataset.index);
          break;
        case "material-pick":
          selectMaterial(id, b.dataset.target, b.dataset.row);
          break;
        case "manual-material":
          showManualMaterialSearch();
          break;
        case "manual-mat-select":
          applyManualMaterial(id);
          break;
        case "backup":
          backup();
          break;
        case "export-csv":
          exportCSV();
          break;
        case "new-manual":
          manualNew();
          break;
        case "add-line":
          manualNew(id);
          break;
        case "stage-line":
          stageLine();
          break;
        case "draft-remove":
          draft.splice(Number(b.dataset.index), 1);
          renderDraft();
          break;
        case "preview-import":
          previewImport();
          break;
        case "clear-import":
          importRows = [];
          $("#rawImport").value = "";
          $("#importPreview").hidden = true;
          break;
        case "confirm-import":
          importConfirm();
          break;
        case "manual-route":
          manualRoute();
          break;
        case "plan-suggested": {
          let groups = suggestGroups(state.lines.filter((l) => !l.tripId)),
            g = groups[Number(b.dataset.index)];
          if (g) {
            let t = makeTrip(g.rows.map((l) => l.uid));
            if (t) routeVehicle(t.id);
          }
          break;
        }
        case "route-vehicle":
          routeVehicle(id);
          break;
        case "edit-trip-lines":
          editTripLines(id);
          break;
        case "remove-plan":
          removePlan(id);
          break;
        case "depart":
          depart(id);
          break;
        case "admin":
          openAdmin(id);
          break;
        case "admin-next":
          navigateAdmin(adminStep + 1);
          break;
        case "admin-prev":
          navigateAdmin(adminStep - 1);
          break;
        case "admin-step":
          navigateAdmin(Number(b.dataset.index));
          break;
        case "admin-shared":
          adminShared(b.dataset.field);
          break;
        case "admin-paste":
          adminApplyPaste(b.dataset.field);
          break;
        case "admin-done":
          toast("Administrativo guardado. Cierra con la X.");
          break;
        case "expand":
          expanded = expanded === id ? "" : id;
          renderDispatch();
          break;
        case "page-prev":
          page--;
          renderDispatch();
          break;
        case "page-next":
          page++;
          renderDispatch();
          break;
        case "edit-line":
          editLine(id);
          break;
        case "search-hint":
          $("#searchDispatch").value = b.dataset.value;
          $("#searchHints").hidden = true;
          page = 0;
          renderDispatch();
          break;
        case "return-notice":
          closeModal();
          returnNotice(id);
          break;
        case "arrival":
          closeModal();
          arrival(id);
          break;
        case "container-line":
          closeModal();
          containerLine(id);
          break;
        case "show-renditions":
          showRenditions(id);
          break;
        case "view-trip":
          viewTrip(id);
          break;
        case "edit-notes":
          editNotes(id);
          break;
        case "edit-driver":
          editDriver(id);
          break;
        case "reset-data":
          resetData();
          break;
      }
    });
    $("#modalX").addEventListener("click", closeModal);
    $("#materialSearch").addEventListener("input", () => {
      matPage = 0;
      renderMaterials();
    });
    $("#materialCategory").addEventListener("change", () => {
      matPage = 0;
      renderMaterials();
    });
    document.addEventListener("input", (e) => {
      if (e.target.closest("#manualFields") && ["qty", "pendingQty"].includes(e.target.name)) {
        let holder = $("#manualFields"),
          mat = materialByCode($("[name=materialCode]", holder)?.value),
          out = $("#manualWeight"),
          qty = num($("[name=qty]", holder)?.value),
          pending = num($("[name=pendingQty]", holder)?.value);
        if (out)
          out.textContent =
            mat && mat.unit === "PC" ? `${fmt(Math.max(0, qty - pending) * mat.gross)} kg calculados` : "";
      }
    });
    document.addEventListener("input", (e) => {
      if (e.target.id === "pickerSearch") renderMaterialPicker();
      if (e.target.id === "inlineManualMatSearch") showManualMaterialSearch(false);
    });
    document.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.matches(".groupheading")) {
        e.preventDefault();
        expanded = expanded === e.target.dataset.id ? "" : e.target.dataset.id;
        renderDispatch();
      }
    });
    $("#searchDispatch").addEventListener("input", () => {
      page = 0;
      renderDispatch();
      searchHints();
    });
    $("#filterRegion").addEventListener("change", () => {
      page = 0;
      renderDispatch();
    });
    $("#filterStatus").addEventListener("change", () => {
      page = 0;
      renderDispatch();
    });
    $("#fleetFilter").addEventListener("change", renderFleet);
    $("#pendingFilter").addEventListener("change", renderPending);
    $("#pendingSearch").addEventListener("input", renderPending);
    document.addEventListener("change", (ev) => {
      let el = ev.target;
      if (el.dataset.inline) {
        inlineChange(el);
        return;
      }
      if (el.dataset.adminLine || el.dataset.adminTrip || el.dataset.adminCost !== undefined) {
        persistAdminInput(el);
        return;
      }
      if (el.id === "manualReg") {
        showManualLines();
        return;
      }
      if (el.classList.contains("routeCheck")) {
        if (el.checked) selectedRouteLines.add(el.dataset.uid);
        else selectedRouteLines.delete(el.dataset.uid);
        refreshManualTotal();
        return;
      }
      if (el.name === "driver" && $("#adminDriver")?.contains(el)) {
        syncDriver(el.value, $("#adminDriver"));
        return;
      }
      if (el.name === "driver" && $("#modalBody")?.contains(el) && !activeAdmin) syncDriver(el.value, $("#modalBody"));
    });
    // Las ventanas no se cierran al pulsar afuera ni con Escape.
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && !$("#overlay").hidden) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    });
    wireFiles();
  }
  // Lector XLSX autocontenido para archivos Office Open XML: no requiere Internet.
  async function unzipXlsx(file) {
    let buf = await file.arrayBuffer(),
      dv = new DataView(buf),
      bytes = new Uint8Array(buf),
      eocd = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 66000); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) {
        eocd = i;
        break;
      }
    }
    if (eocd < 0) throw Error("Archivo ZIP no válido");
    let dir = dv.getUint32(eocd + 16, true),
      count = dv.getUint16(eocd + 10, true),
      map = new Map(),
      dec = new TextDecoder();
    for (let j = 0; j < count; j++) {
      if (dv.getUint32(dir, true) !== 0x02014b50) throw Error("Índice de ZIP inválido");
      let method = dv.getUint16(dir + 10, true),
        length = dv.getUint32(dir + 20, true),
        nameLen = dv.getUint16(dir + 28, true),
        extra = dv.getUint16(dir + 30, true),
        comment = dv.getUint16(dir + 32, true),
        offset = dv.getUint32(dir + 42, true),
        name = dec.decode(bytes.slice(dir + 46, dir + 46 + nameLen));
      map.set(name, { method, length, offset });
      dir += 46 + nameLen + extra + comment;
    }
    return async (path) => {
      let entry = map.get(path);
      if (!entry) return "";
      let o = entry.offset;
      if (dv.getUint32(o, true) !== 0x04034b50) throw Error("Cabecera de ZIP inválida");
      let p = o + 30 + dv.getUint16(o + 26, true) + dv.getUint16(o + 28, true),
        src = bytes.slice(p, p + entry.length);
      if (entry.method === 0) return dec.decode(src);
      if (entry.method !== 8) throw Error("Formato de compresión no compatible");
      if (!("DecompressionStream" in window)) throw Error("El navegador no soporta la descompresión offline");
      let stream = new Blob([src]).stream().pipeThrough(new DecompressionStream("deflate-raw")),
        out = await new Response(stream).arrayBuffer();
      return dec.decode(new Uint8Array(out));
    };
  }
  function xmlNodes(root, tag) {
    return [...root.getElementsByTagNameNS("*", tag)];
  }
  const parseXML = (x) => new DOMParser().parseFromString(x, "application/xml");
  async function readXLSX(file) {
    let load = await unzipXlsx(file),
      wbxml = await load("xl/workbook.xml");
    if (!wbxml) throw Error("No hay libro Excel");
    let w = parseXML(wbxml),
      s = xmlNodes(w, "sheet")[0];
    if (!s) throw Error("Libro sin hojas");
    let relId =
        s.getAttribute("r:id") ||
        s.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id"),
      rels = parseXML(await load("xl/_rels/workbook.xml.rels")),
      relationship = xmlNodes(rels, "Relationship").find((x) => x.getAttribute("Id") === relId),
      path = relationship?.getAttribute("Target") || "worksheets/sheet1.xml";
    if (path.startsWith("/")) path = path.slice(1);
    else path = path.startsWith("xl/") ? path : "xl/" + path;
    let sh = await load(path);
    if (!sh) throw Error("No se encontró la primera hoja");
    let sstxml = await load("xl/sharedStrings.xml"),
      sst = sstxml
        ? xmlNodes(parseXML(sstxml), "si").map((x) =>
            xmlNodes(x, "t")
              .map((n) => n.textContent || "")
              .join(""),
          )
        : [];
    let sheet = parseXML(sh),
      rows = [];
    for (const row of xmlNodes(sheet, "row")) {
      let r = Array(10).fill("");
      for (const cell of xmlNodes(row, "c")) {
        let ref = cell.getAttribute("r") || "",
          letters = (ref.match(/^[A-Z]+/) || [])[0];
        if (!letters) continue;
        let col = 0;
        for (const c of letters) col = col * 26 + (c.charCodeAt(0) - 64);
        col--;
        if (col < 0 || col > 9) continue;
        let t = cell.getAttribute("t"),
          v = xmlNodes(cell, "v")[0]?.textContent || "",
          value =
            t === "s"
              ? sst[Number(v)] || ""
              : t === "inlineStr"
                ? xmlNodes(cell, "t")
                    .map((x) => x.textContent || "")
                    .join("")
                : v;
        r[col] = value;
      }
      if (r.some((v) => v !== "")) rows.push(r);
    }
    if (rows[0] && N(rows[0][0]).includes("REGION") && N(rows[0][1] || "").includes("CLIENTE")) rows.shift();
    return rows;
  }

  // Catálogo SAP: el nombre original del pedido se conserva y el material confirmado identifica la presentación real.
  let matPage = 0,
    pickerAdminReturn = null;
  const materialByCode = (c) => state.materials.find((m) => m.code === String(c || "").trim());
  const matType = (l) => materialByCode(l.materialCode)?.category || "POR DEFINIR";
  const normalizedMaterial = (q) => N(q).replace(/[^A-Z0-9]/g, "");
  function findMaterials(query, limit = 12) {
    let text = N(query),
      compact = normalizedMaterial(query);
    if (!text) return [];
    let pieces = text.split(/\s+/).filter((x) => x.length > 1);
    return state.materials
      .map((m) => {
        let mn = N(m.name),
          cn = normalizedMaterial(m.name),
          score = 0;
        if (m.code === query.trim()) score = 1100;
        else if (mn === text) score = 950;
        else if (mn.startsWith(text)) score = 560;
        else if (mn.includes(text)) score = 480;
        else if (compact.length >= 4 && cn.includes(compact)) score = 460;
        else if (pieces.length && pieces.every((p) => mn.includes(p))) score = 230 + pieces.length * 5;
        else if (m.code.includes(query.trim()) && query.trim().length >= 3) score = 160;
        if (m.sapType === "FERT") score += 12;
        return { m, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.m.name.localeCompare(b.m.name))
      .slice(0, limit)
      .map((x) => x.m);
  }
  function recommendMaterial(product) {
    let matches = findMaterials(product, 12);
    if (!matches.length) return null;
    let pn = normalizedMaterial(product);
    let exact = matches.filter((m) => normalizedMaterial(m.name) === pn);
    // No se selecciona automáticamente un código si hay más de una presentación.
    return exact.length === 1 ? exact[0] : null;
  }
  function shipUnits(l) {
    return Math.max(0, num(l.qty) - Math.max(0, num(l.pendingQty)));
  }
  function orderWeight(l) {
    let m = materialByCode(l.materialCode);
    return m && m.unit === "PC" && m.gross > 0 ? Math.round(m.gross * num(l.qty) * 100) / 100 : 0;
  }
  function weightFor(l) {
    let m = materialByCode(l.materialCode),
      q = shipUnits(l);
    if (!m || m.unit !== "PC" || m.gross <= 0 || q <= 0) return 0;
    return Math.round(m.gross * q * 100) / 100;
  }

  function routeWeight(rows) {
    const base = rows.reduce((s, l) => s + weightFor(l), 0);
    let groups = new Map();
    for (const l of rows) {
      if (matType(l) === "TB" && shipUnits(l) > 0) {
        const key = N(l.client) + "|" + (l.materialCode || "");
        groups.set(key, (groups.get(key) || 0) + shipUnits(l));
      }
    }
    let pal = [...groups.values()].reduce((sum, q) => sum + Math.ceil(q / 4), 0);
    return Math.round((base + 20 * pal) * 100) / 100;
  }

  function expectedPack(rows) {
    let ibc = 0,
      tb = 0;
    let groups = new Map();
    for (let l of rows) {
      let ty = matType(l),
        q = shipUnits(l);
      if (ty === "IBC") ibc += q;
      if (ty === "TB") {
        tb += q;
        let key = N(l.client) + "|" + (l.materialCode || "");
        groups.set(key, (groups.get(key) || 0) + q);
      }
    }
    return { ibc, tb, pal: [...groups.values()].reduce((n, q) => n + Math.ceil(q / 4), 0) };
  }

  function bindMaterial(row, mat) {
    if (!mat) return;
    row.originalProduct ??= row.product;
    row.materialCode = mat.code;
    row.materialVerified = true;
    row.sapDisplayName = mat.name;
    // El peso es derivado del peso bruto SAP y la cantidad disponible; el origen conserva su descripción.
  }
  const matLabel = (m) =>
    m
      ? `<b class="material-code">${E(m.code)}</b> · ${E(m.name)} <span class="matpill ${m.category === "POR DEFINIR" ? "POR" : m.category}">${E(m.category === "MP" ? "Materia prima" : m.category === "TB" ? "TB" : m.category === "IBC" ? "IBC" : "Por definir")}</span>`
      : '<span class="chip amber">Material sin vincular</span>';
  function renderMaterials() {
    let all = state.materials || [],
      q = N($("#materialSearch")?.value),
      category = $("#materialCategory")?.value || "",
      list = all.filter(
        (m) => (!category || m.category === category) && (!q || N(m.name).includes(q) || m.code.includes(q)),
      );
    let count = all.reduce((a, m) => ((a[m.category] = (a[m.category] || 0) + 1), a), {});
    $("#materialKPIs").innerHTML =
      stat("Materiales SAP", all.length, "Catálogo editable", "▣", "#ba8b12", "#fff5d9") +
      stat("IBC", count.IBC || 0, "Presentación contenedor", "◈", "#2477af", "#eaf4ff") +
      stat("Tambores", count.TB || 0, "Hasta 4 por PAL", "▥", "#bb7c14", "#fff3e1") +
      stat("Sin clasificar", count["POR DEFINIR"] || 0, "Revisar presentación", "!", "#ae392d", "#ffede9");
    $("#materialsCount").textContent = `${list.length} registros`;
    let per = 30,
      pages = Math.max(1, Math.ceil(list.length / per));
    matPage = Math.min(Math.max(0, matPage), pages - 1);
    let pageData = list.slice(matPage * per, (matPage + 1) * per);
    $("#materialsTable").innerHTML = pageData.length
      ? `<table><thead><tr><th>Material SAP</th><th>Denominación</th><th>Tipo</th><th>Peso bruto</th><th>Peso neto</th><th>UM</th><th></th></tr></thead><tbody>${pageData.map((m) => `<tr><td><span class="material-code">${E(m.code)}</span></td><td class="matname">${E(m.name)}</td><td><span class="matpill ${m.category === "POR DEFINIR" ? "POR" : m.category}">${E(m.category === "MP" ? "Materia prima" : m.category)}</span></td><td>${fmt(m.gross)} kg</td><td>${fmt(m.net)} kg</td><td>${E(m.unit)}</td><td>${button("Editar", "edit-material", m.code)}</td></tr>`).join("")}</tbody></table>`
      : empty("No hay materiales con ese filtro");
    $("#materialPager").innerHTML =
      pages > 1
        ? `${button("Anterior", "mat-prev", "", "outline mini", matPage === 0 ? "disabled" : "")}<span class="small muted">Página ${matPage + 1} / ${pages}</span>${button("Siguiente", "mat-next", "", "outline mini", matPage === pages - 1 ? "disabled" : "")}`
        : "";
    $("#navMatCount").textContent = all.length;
  }
  function editMaterial(code = "") {
    let orig = materialByCode(code),
      m = orig
        ? { ...orig }
        : {
            code: "",
            name: "",
            sapType: "FERT",
            gross: 0,
            net: 0,
            unit: "PC",
            category: "POR DEFINIR",
            confidence: "EDITADO",
          };
    modal(
      orig ? "Editar material SAP" : "Nuevo material",
      "Código, denominación y pesos por unidad SAP.",
      `<div class="formgrid cols3">${field("code", "Número de material", m.code, "text", "required")}
<div class="wide">${field("name", "Denominación SAP", m.name, "text", "required")}</div>
${field("sapType", "Clase SAP", m.sapType)}${field("unit", "Unidad", m.unit)}${field("gross", "Peso bruto por UM (kg)", m.gross, "number", 'min="0" step="any"')}${field("net", "Peso neto por UM (kg)", m.net, "number", 'min="0" step="any"')}
<div class="wide field"><label>Clasificación de despacho</label><select name="category">${[
        ["IBC", "IBC"],
        ["TB", "Tambor (TB)"],
        ["MP", "Materia prima"],
        ["POR DEFINIR", "Por definir"],
      ]
        .map(([k, v]) => `<option value="${k}" ${m.category === k ? "selected" : ""}>${v}</option>`)
        .join("")}</select></div></div>`,
      () => {
        let v = getVals(),
          id = v.code.trim(),
          name = v.name.trim();
        if (!id || !name) return toast("Ingresa código y denominación.", true);
        let found = materialByCode(id);
        if (found && found !== orig) return toast("Ese código ya existe.", true);
        let o = {
          code: id,
          name,
          sapType: v.sapType.trim(),
          gross: num(v.gross),
          net: num(v.net),
          unit: v.unit.trim().toUpperCase(),
          category: v.category,
          confidence: "VALIDADO POR USUARIO",
        };
        if (orig) Object.assign(orig, o);
        else state.materials.push(o);
        audit("Material", `${id} · ${name}`);
        closeModal();
        save();
        toast("Material guardado.");
      },
      { label: "Guardar material" },
    );
  }
  function exportMaterials() {
    let lines = [
      ["Material", "Denominación", "Tipo SAP", "Peso bruto", "Peso neto", "UM", "Clasificación"],
      ...state.materials.map((m) => [m.code, m.name, m.sapType, m.gross, m.net, m.unit, m.category]),
    ];
    let csv = lines.map((r) => r.map((v) => '"' + String(v ?? "").replace(/"/g, '""') + '"').join(";")).join("\r\n");
    download("CL14_materiales_SAP.csv", "\ufeff" + csv, "text/csv;charset=utf-8");
  }
  function showMaterialPicker(where, id = "") {
    pickerAdminReturn = activeAdmin ? { tripId: activeAdmin, step: adminStep } : null;
    let selected = where === "import" ? importRows[Number(id)] : where === "line" ? line(id) : null;
    const query = selected?.product || "";
    let title =
      where === "import"
        ? "Vincular material importado"
        : where === "line"
          ? "Material de pedido"
          : "Seleccionar material SAP";
    modal(
      title,
      selected?.client || "Buscar código SAP o denominación real",
      `<div class="field"><label>Buscar material</label><input id="pickerSearch" autocomplete="off" placeholder="Código SAP o denominación" value="${E(query)}"></div><div class="small muted mt8">Selecciona la presentación correcta: IBC, tambor u otra. No se asignarán códigos ambiguos automáticamente.</div><div id="pickerResults" class="pickbox mt12"></div>`,
      null,
      { foot: '<span class="small muted">El texto original se conserva en el historial del pedido.</span>' },
    );
    const box = $("#pickerSearch");
    box.dataset.pickerWhere = where;
    box.dataset.pickerId = id;
    renderMaterialPicker();
    box.focus();
    box.select();
  }
  function renderMaterialPicker() {
    let e = $("#pickerSearch");
    if (!e) return;
    let matches = findMaterials(e.value, 20);
    $("#pickerResults").innerHTML = matches.length
      ? matches
          .map(
            (m) =>
              `<button class="material-select-row" data-act="material-pick" data-id="${E(m.code)}" data-target="${E(e.dataset.pickerWhere)}" data-row="${E(e.dataset.pickerId)}"><span><span class="material-code">${E(m.code)}</span><br><span class="small">${E(m.name)}</span></span><span><span class="matpill ${m.category === "POR DEFINIR" ? "POR" : m.category}">${E(m.category)}</span><br><span class="small muted">${fmt(m.gross)} kg bruto</span></span></button>`,
          )
          .join("")
      : empty("Sin coincidencias", "Prueba por número SAP o por parte del nombre");
  }
  function selectMaterial(code, where, id) {
    let m = materialByCode(code);
    if (!m) return;
    if (where === "import") {
      let l = importRows[Number(id)];
      if (!l) return;
      bindMaterial(l, m);
      closeModal();
      showImportPreview();
      toast(`Material ${m.code} vinculado.`);
    } else if (where === "line") {
      let l = line(id);
      if (!l) return;
      let test = { ...l };
      bindMaterial(test, m);
      let t = trip(l.tripId);
      if (t && t.state === "PLANNED") {
        let v = routeWeight(tripLines(t).map((x) => (x.uid === l.uid ? test : x)));
        if (v > 15000) return toast(`No se puede vincular: carga resultante ${fmt(v)} kg supera 15 toneladas.`, true);
      }
      bindMaterial(l, m);
      audit("Material vinculado", `${l.dispatchId} · ${m.code}`);
      closeModal();
      save();
      if (pickerAdminReturn) {
        let back = pickerAdminReturn;
        pickerAdminReturn = null;
        openAdmin(back.tripId, back.step);
      }
      toast(`Material ${m.code} vinculado.`);
    } else if (where === "manual") {
      let c = $("[name=materialCode]", $("#modalBody"));
      if (c) c.value = m.code;
      let p = $("[name=product]", $("#modalBody"));
      if (p && (!p.value || !p.value.trim())) p.value = m.name;
      let detail = $("#manualMaterialResult");
      if (detail)
        detail.innerHTML = matLabel(m) + ` <span class="small muted">Bruto: ${fmt(m.gross)} kg / ${E(m.unit)}</span>`;
      closeModal();
      toast(`Material ${m.code} seleccionado.`);
    }
  }

  function showManualMaterialSearch(open = true) {
    let b = $("#manualMaterialFinder");
    if (!b) {
      let spot = $("#manualMaterialResult");
      if (!spot) return;
      b = document.createElement("div");
      b.id = "manualMaterialFinder";
      b.className = "mt12";
      spot.parentElement.parentElement.appendChild(b);
      b.innerHTML = `<div class="field"><label>Buscar por código SAP o denominación</label><input id="inlineManualMatSearch" type="search" placeholder="Ej. 606335 o Viscocrete 6000"></div><div class="pickbox mt8" id="manualMatches" style="max-height:250px"></div>`;
      b.dataset.open = "no";
    }
    if (open && b.dataset.open === "yes") {
      b.hidden = true;
      b.dataset.open = "no";
      return;
    }
    b.hidden = false;
    b.dataset.open = "yes";
    let search = $("#inlineManualMatSearch"),
      q = search?.value || "";
    $("#manualMatches").innerHTML =
      findMaterials(q, 8)
        .map(
          (m) =>
            `<button class="material-select-row" data-act="manual-mat-select" data-id="${E(m.code)}"><span class="small"><b>${E(m.code)}</b> · ${E(m.name)}</span><span class="small">${E(m.category)} · ${fmt(m.gross)} kg</span></button>`,
        )
        .join("") ||
      '<div class="small muted" style="padding:12px">Escribe un código o nombre para ver hasta 8 opciones.</div>';
    if (open) search.focus();
  }
  function applyManualMaterial(code) {
    let m = materialByCode(code);
    if (!m) return;
    let form = $("#modalBody");
    let el = $("[name=materialCode]", form),
      p = $("[name=product]", form);
    if (el) el.value = m.code;
    if (p && (!p.value || !p.value.trim())) p.value = m.name;
    $("#manualMaterialResult").innerHTML =
      matLabel(m) + ` <span class="small muted">${fmt(m.gross)} kg bruto / ${E(m.unit)}</span>`;
    let b = $("#manualMaterialFinder");
    if (b) b.remove();
    let target = $("#manualWeight"),
      qty = num($("[name=qty]", $("#modalBody"))?.value),
      pending = num($("[name=pendingQty]", $("#modalBody"))?.value);
    if (target)
      target.textContent =
        m.unit === "PC"
          ? `${fmt(Math.max(0, qty - pending) * m.gross)} kg calculados`
          : "Peso por determinar (unidad no PC)";
    toast(`Material SAP ${m.code} seleccionado.`);
  }

  $("#filterRegion").innerHTML = regionOptions("", true);
  enhanceRegionControls();
  setupLists();
  wireUI();
  render();
})();
