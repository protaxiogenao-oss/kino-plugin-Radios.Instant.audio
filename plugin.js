/// <reference path="./kino.d.ts" />

/**
 * Instant Audio – continente → país → radios (todo kind: "live").
 * Los ítems live no se guardan en Mi biblioteca.
 * Posters en formato horizontal 16:9.
 */

const RB_HOSTS = [
  "https://de1.api.radio-browser.info",
  "https://de2.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
  "https://fr1.api.radio-browser.info",
];

const UA = "KinoInstantAudio/1.0.5";

const SA_CODES = ["AR", "BO", "BR", "CL", "CO", "EC", "PY", "PE", "SR", "UY", "VE"];

const CONTINENTS = [
  {
    id: "SA",
    title: "Sudamérica",
    countries: [
      { code: "AR", name: "Argentina" },
      { code: "BO", name: "Bolivia" },
      { code: "BR", name: "Brasil" },
      { code: "CL", name: "Chile" },
      { code: "CO", name: "Colombia" },
      { code: "EC", name: "Ecuador" },
      { code: "PY", name: "Paraguay" },
      { code: "PE", name: "Perú" },
      { code: "SR", name: "Surinam" },
      { code: "UY", name: "Uruguay" },
      { code: "VE", name: "Venezuela" },
    ],
  },
  {
    id: "NA",
    title: "Norteamérica",
    countries: [
      { code: "MX", name: "México" },
      { code: "US", name: "Estados Unidos" },
      { code: "CA", name: "Canadá" },
      { code: "CU", name: "Cuba" },
      { code: "DO", name: "República Dominicana" },
      { code: "PR", name: "Puerto Rico" },
      { code: "HT", name: "Haití" },
      { code: "JM", name: "Jamaica" },
      { code: "TT", name: "Trinidad y Tobago" },
    ],
  },
  {
    id: "CA",
    title: "Centroamérica",
    countries: [
      { code: "CR", name: "Costa Rica" },
      { code: "SV", name: "El Salvador" },
      { code: "GT", name: "Guatemala" },
      { code: "HN", name: "Honduras" },
      { code: "NI", name: "Nicaragua" },
      { code: "PA", name: "Panamá" },
      { code: "BZ", name: "Belice" },
    ],
  },
  {
    id: "EU",
    title: "Europa",
    countries: [
      { code: "ES", name: "España" },
      { code: "FR", name: "Francia" },
      { code: "IT", name: "Italia" },
      { code: "DE", name: "Alemania" },
      { code: "GB", name: "Reino Unido" },
      { code: "PT", name: "Portugal" },
      { code: "NL", name: "Países Bajos" },
      { code: "BE", name: "Bélgica" },
      { code: "CH", name: "Suiza" },
      { code: "AT", name: "Austria" },
      { code: "PL", name: "Polonia" },
      { code: "RO", name: "Rumanía" },
      { code: "SE", name: "Suecia" },
      { code: "NO", name: "Noruega" },
      { code: "DK", name: "Dinamarca" },
      { code: "FI", name: "Finlandia" },
      { code: "IE", name: "Irlanda" },
      { code: "GR", name: "Grecia" },
      { code: "UA", name: "Ucrania" },
    ],
  },
  {
    id: "AF",
    title: "África",
    countries: [
      { code: "DZ", name: "Argelia" },
      { code: "MA", name: "Marruecos" },
      { code: "EG", name: "Egipto" },
      { code: "NG", name: "Nigeria" },
      { code: "ZA", name: "Sudáfrica" },
      { code: "KE", name: "Kenia" },
      { code: "GH", name: "Ghana" },
      { code: "SN", name: "Senegal" },
      { code: "TN", name: "Túnez" },
      { code: "CI", name: "Costa de Marfil" },
      { code: "CM", name: "Camerún" },
      { code: "UG", name: "Uganda" },
    ],
  },
  {
    id: "AS",
    title: "Asia",
    countries: [
      { code: "IN", name: "India" },
      { code: "JP", name: "Japón" },
      { code: "KR", name: "Corea del Sur" },
      { code: "CN", name: "China" },
      { code: "TW", name: "Taiwán" },
      { code: "ID", name: "Indonesia" },
      { code: "MY", name: "Malasia" },
      { code: "PH", name: "Filipinas" },
      { code: "TH", name: "Tailandia" },
      { code: "VN", name: "Vietnam" },
      { code: "PK", name: "Pakistán" },
      { code: "BD", name: "Bangladés" },
      { code: "IL", name: "Israel" },
      { code: "SG", name: "Singapur" },
      { code: "HK", name: "Hong Kong" },
    ],
  },
  {
    id: "OC",
    title: "Oceanía",
    countries: [
      { code: "AU", name: "Australia" },
      { code: "NZ", name: "Nueva Zelanda" },
    ],
  },
];

function continentById(id) {
  for (var i = 0; i < CONTINENTS.length; i++) {
    if (CONTINENTS[i].id === id) return CONTINENTS[i];
  }
  return null;
}

function countryByCode(code) {
  code = String(code || "").toUpperCase();
  for (var i = 0; i < CONTINENTS.length; i++) {
    var list = CONTINENTS[i].countries;
    for (var j = 0; j < list.length; j++) {
      if (list[j].code === code) {
        return { country: list[j], continent: CONTINENTS[i] };
      }
    }
  }
  return null;
}

/**
 * Bandera ancha (aprox. 3:2 / horizontal). flagcdn no ofrece 16:9 exacto;
 * w1280 se ve horizontal en tarjetas live.
 */
function flagPoster(code) {
  var c = String(code || "un").toLowerCase();
  if (!/^[a-z]{2}$/.test(c)) c = "un";
  return "https://flagcdn.com/w1280/" + c + ".png";
}

function isUsableImageUrl(u) {
  if (!u || typeof u !== "string") return false;
  u = u.trim();
  if (!/^https?:\/\//i.test(u)) return false;
  var low = u.toLowerCase();
  // píxeles de tracking / vacíos
  if (
    low.indexOf("1x1") >= 0 ||
    low.indexOf("pixel.gif") >= 0 ||
    low.indexOf("pixel.png") >= 0 ||
    low.indexOf("/blank.") >= 0 ||
    low.indexOf("about:blank") >= 0
  ) {
    return false;
  }
  return true;
}

function domainFromUrl(u) {
  if (!u) return null;
  var m = String(u).match(/^https?:\/\/([^\/\?:#]+)/i);
  if (!m) return null;
  return m[1].replace(/^www\./i, "").toLowerCase();
}

/** Intenta subir favicons de WordPress 32x32 → 180x180. */
function upgradeLogoUrl(u) {
  if (!u) return u;
  return u
    .replace(/-32x32(\.[a-z]+)/i, "-180x180$1")
    .replace(/-16x16(\.[a-z]+)/i, "-180x180$1")
    .replace(/-48x48(\.[a-z]+)/i, "-192x192$1")
    .replace(/\/favicon\.ico$/i, "/apple-touch-icon.png");
}

/**
 * Poster de emisora (prioridad):
 * 1) favicon de Radio Browser (png/jpg/ico/http/https)
 * 2) favicon Google 128px del dominio homepage/stream
 * 3) DuckDuckGo icons
 * 4) bandera ancha del país
 *
 * backdrop siempre bandera horizontal para reforzar 16:9 en la UI live.
 */
function stationPoster(st) {
  var raw = st.favicon ? String(st.favicon).trim() : "";
  if (raw.indexOf("//") === 0) raw = "https:" + raw;
  if (isUsableImageUrl(raw)) {
    return upgradeLogoUrl(raw);
  }
  var domain =
    domainFromUrl(st.homepage) ||
    domainFromUrl(st.url_resolved) ||
    domainFromUrl(st.url);
  if (domain) {
    // Google favicon service (128px)
    return (
      "https://www.google.com/s2/favicons?domain=" +
      encodeURIComponent(domain) +
      "&sz=128"
    );
  }
  return flagPoster(st.countrycode);
}

function stationBackdrop(st) {
  // Siempre horizontal / ancho para tarjetas live
  return flagPoster(st.countrycode);
}

function limitStations() {
  var n = parseInt(kino.config.get("limitPerCountry") || "40", 10);
  if (isNaN(n) || n < 10) n = 40;
  if (n > 100) n = 100;
  return n;
}

async function rbFetch(path) {
  var lastErr = null;
  for (var i = 0; i < RB_HOSTS.length; i++) {
    try {
      var r = await kino.fetch(RB_HOSTS[i] + path, {
        headers: {
          "User-Agent": UA,
          Accept: "application/json",
        },
        timeoutMs: 12000,
      });
      if (!r.ok) {
        lastErr = "http " + r.status;
        continue;
      }
      var text = await r.text();
      if (!text || text.length < 2) {
        lastErr = "empty";
        continue;
      }
      return JSON.parse(text);
    } catch (e) {
      lastErr = String(e && e.message ? e.message : e);
    }
  }
  throw kino.error("unavailable", "radio-browser " + (lastErr || "fail"), {
    userMessage: "No se pudo cargar el listado de radios. Intenta de nuevo.",
  });
}

function cleanTitle(name) {
  return String(name || "")
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001f]/g, "")
    .trim()
    .slice(0, 200);
}

/**
 * Solo kind: "live" — Kino no los guarda en Mi biblioteca,
 * no aparecen en Continuar viendo ni se pueden descargar.
 */
function stationToLiveItem(st) {
  var id = st.stationuuid || st.changeuuid;
  if (!id) return null;
  var title = cleanTitle(st.name);
  if (!title) return null;
  return {
    id: "st-" + id,
    ref: "station:" + id,
    title: title,
    kind: "live",
    poster: stationPoster(st),
    backdrop: stationBackdrop(st),
    overview: [st.country, st.state, st.tags].filter(Boolean).join(" · ").slice(0, 300) || undefined,
    badges: st.bitrate ? [String(st.bitrate) + " kbps"] : undefined,
  };
}

function stationToChannel(st, categoryId, number) {
  var it = stationToLiveItem(st);
  if (!it) return null;
  return {
    id: it.id,
    title: it.title,
    ref: it.ref,
    logo: it.poster,
    categoryId: categoryId || undefined,
    number: number || undefined,
  };
}

async function fetchStationsByCountry(code, offset, limit) {
  var path =
    "/json/stations/bycountrycodeexact/" +
    encodeURIComponent(code) +
    "?hidebroken=true&order=clickcount&reverse=true&limit=" +
    limit +
    "&offset=" +
    offset;
  var list = await rbFetch(path);
  return Array.isArray(list) ? list : [];
}

async function stationsAsLiveItems(code, offset, limit) {
  var list = await fetchStationsByCountry(code, offset, limit);
  var items = [];
  for (var i = 0; i < list.length; i++) {
    var it = stationToLiveItem(list[i]);
    if (it) items.push(it);
  }
  return items;
}

async function topStationsFromCodes(codes, perCountry, maxTotal) {
  var all = [];
  var seen = {};
  perCountry = perCountry || 4;
  maxTotal = maxTotal || 16;
  for (var k = 0; k < codes.length && all.length < maxTotal; k++) {
    try {
      var list = await fetchStationsByCountry(codes[k], 0, perCountry);
      for (var m = 0; m < list.length && all.length < maxTotal; m++) {
        var it = stationToLiveItem(list[m]);
        if (!it || seen[it.id]) continue;
        seen[it.id] = true;
        all.push(it);
      }
    } catch (e) {
      kino.log("stations " + codes[k], String(e));
    }
  }
  return all;
}

/* ───────── home ─────────
 * Organización: continente (título de fila) → emisoras del país en filas.
 * Todo kind live → no entra en Mi biblioteca.
 *
 * 1) Más escuchadas · Sudamérica
 * 2) Una fila por país (Argentina, Bolivia, …) con sus radios
 * 3) Resto de continentes igual (país = fila)
 */

export async function home() {
  var prefer = kino.config.get("preferContinent") || "SA";
  var rows = [];
  var previewPerCountry = 8;

  // Populares Sudamérica (siempre)
  try {
    var popular = await topStationsFromCodes(SA_CODES, 3, 14);
    if (popular.length) {
      rows.push({
        id: "row-popular",
        title: "Más escuchadas · Sudamérica",
        items: popular,
        genre: "musica",
      });
    }
  } catch (e) {
    kino.log("home popular", String(e));
  }

  // Continente preferido: una fila por país (Sudamérica por defecto)
  // Así no superamos el límite de ~60 fetch de Kino
  var focusId = prefer === "all" ? "SA" : prefer;
  var focus = continentById(focusId) || continentById("SA");
  if (focus) {
    for (var j = 0; j < focus.countries.length; j++) {
      var c = focus.countries[j];
      try {
        var items = await stationsAsLiveItems(c.code, 0, previewPerCountry);
        if (!items.length) continue;
        rows.push({
          id: "row-" + c.code,
          title: focus.title + " · " + c.name,
          items: items,
          ref: "country:" + c.code,
          genre: "musica",
        });
      } catch (e) {
        kino.log("home " + c.code, String(e));
      }
    }
  }

  // Resto de continentes: una sola fila con emisoras top (sin desglose por país)
  for (var i = 0; i < CONTINENTS.length; i++) {
    var cont = CONTINENTS[i];
    if (cont.id === focusId) continue;
    try {
      var codes = cont.countries.map(function (x) {
        return x.code;
      });
      var mixed = await topStationsFromCodes(codes, 2, 10);
      if (!mixed.length) continue;
      rows.push({
        id: "row-" + cont.id,
        title: cont.title,
        items: mixed,
        ref: "continent:" + cont.id,
        genre: "musica",
      });
    } catch (e) {
      kino.log("home " + cont.id, String(e));
    }
  }

  return rows;
}

/* ───────── browse ─────────
 * country:XX → más emisoras del país (paginado)
 * continent:XX → emisoras top del continente
 */

export async function browse(ref, cursor) {
  if (!ref) return { items: [] };

  var limit = limitStations();
  var offset = 0;
  if (cursor) {
    var n = parseInt(cursor, 10);
    if (!isNaN(n) && n > 0) offset = n;
  }

  if (ref.indexOf("country:") === 0) {
    var code = ref.slice("country:".length).toUpperCase();
    var items = await stationsAsLiveItems(code, offset, limit);
    var next = items.length >= limit ? String(offset + limit) : undefined;
    return { items: items, next: next };
  }

  if (ref.indexOf("continent:") === 0) {
    var cid = ref.slice("continent:".length);
    var cont = continentById(cid);
    if (!cont) return { items: [] };
    var codes = cont.countries.map(function (c) {
      return c.code;
    });
    // Página plana de emisoras del continente
    var gathered = await topStationsFromCodes(codes, 6, offset + limit);
    var page = gathered.slice(offset, offset + limit);
    var nextC = gathered.length > offset + limit ? String(offset + limit) : undefined;
    return { items: page, next: nextC };
  }

  return { items: [] };
}

/* ───────── search ───────── */

export async function search(query) {
  var q = (query && query.q ? String(query.q) : "").trim();
  if (!q || q.length < 2) return [];

  var path =
    "/json/stations/search?name=" +
    encodeURIComponent(q) +
    "&hidebroken=true&order=clickcount&reverse=true&limit=40";
  var list = await rbFetch(path);
  var items = [];
  if (Array.isArray(list)) {
    for (var i = 0; i < list.length; i++) {
      var it = stationToLiveItem(list[i]);
      if (it) items.push(it);
    }
  }
  if (kino.rank && typeof kino.rank.filterRelevant === "function") {
    try {
      items = kino.rank.filterRelevant(items, q);
    } catch (e) {}
  }
  return items;
}

/* ───────── resolve ───────── */

export async function resolve(ref) {
  if (!ref || typeof ref !== "string") {
    throw kino.error("not_found", "ref", {
      userMessage: "Emisora no encontrada.",
    });
  }

  if (ref.indexOf("country:") === 0 || ref.indexOf("continent:") === 0) {
    throw kino.error("not_found", "ref container", {
      userMessage: "Elige una emisora de la lista.",
    });
  }

  if (ref.indexOf("station:") !== 0) {
    throw kino.error("not_found", "ref", {
      userMessage: "Emisora no encontrada.",
    });
  }

  var uuid = ref.slice("station:".length);
  if (!uuid || uuid.length < 8) {
    throw kino.error("not_found", "uuid", {
      userMessage: "Emisora no encontrada.",
    });
  }

  var url = null;
  var mime = null;

  try {
    var clicked = await rbFetch("/json/url/" + encodeURIComponent(uuid));
    if (clicked && clicked.url && /^https?:\/\//i.test(clicked.url)) {
      url = clicked.url;
    }
  } catch (e) {
    kino.log("url click", String(e));
  }

  if (!url) {
    try {
      var st = await rbFetch("/json/stations/byuuid/" + encodeURIComponent(uuid));
      var row = Array.isArray(st) ? st[0] : st;
      if (row) {
        url = row.url_resolved || row.url;
        if (row.hls) mime = "application/vnd.apple.mpegurl";
        else if (row.codec) {
          var c = String(row.codec).toUpperCase();
          if (c.indexOf("AAC") >= 0) mime = "audio/aac";
          else if (c.indexOf("MP3") >= 0) mime = "audio/mpeg";
          else if (c.indexOf("OGG") >= 0) mime = "audio/ogg";
        }
      }
    } catch (e) {
      kino.log("byuuid", String(e));
    }
  }

  if (!url || !/^https?:\/\//i.test(url)) {
    throw kino.error("unavailable", "no stream", {
      userMessage: "Esta emisora no tiene stream disponible ahora.",
    });
  }

  var lower = url.toLowerCase();
  if (
    lower.indexOf("doubleclick") >= 0 ||
    lower.indexOf("googlesyndication") >= 0 ||
    lower.indexOf("/ad/") >= 0 ||
    lower.indexOf("ads.") >= 0
  ) {
    throw kino.error("unavailable", "ad url", {
      userMessage: "Stream no válido (anuncio detectado).",
    });
  }

  if (!mime) {
    if (/\.m3u8(\?|$)/i.test(url) || /\/hls\//i.test(url)) {
      mime = "application/vnd.apple.mpegurl";
    } else if (/\.aac(\?|$)/i.test(url) || /aac/i.test(url)) {
      mime = "audio/aac";
    } else if (/\.mp3(\?|$)/i.test(url)) {
      mime = "audio/mpeg";
    } else if (/\.ogg(\?|$)/i.test(url) || /\.opus(\?|$)/i.test(url)) {
      mime = "audio/ogg";
    }
  }

  var stream = {
    url: url,
    headers: {
      "User-Agent": UA,
      Accept: "*/*",
    },
  };
  if (mime) stream.mime = mime;
  return stream;
}

/* ───────── channels (En vivo) ───────── */

export async function liveCategories() {
  var cats = [];
  for (var i = 0; i < CONTINENTS.length; i++) {
    var cont = CONTINENTS[i];
    cats.push({
      id: "cat-" + cont.id,
      title: cont.title,
      genre: "musica",
    });
    for (var j = 0; j < cont.countries.length; j++) {
      var c = cont.countries[j];
      cats.push({
        id: "cat-co-" + c.code,
        title: cont.title + " · " + c.name,
        country: c.code,
        genre: "musica",
      });
    }
  }
  return cats;
}

export async function liveChannels({ categoryId, cursor }) {
  if (!categoryId) return { items: [] };

  var limit = limitStations();
  var offset = 0;
  if (cursor) {
    var n = parseInt(cursor, 10);
    if (!isNaN(n) && n > 0) offset = n;
  }

  if (categoryId.indexOf("cat-co-") === 0) {
    var code = categoryId.slice("cat-co-".length).toUpperCase();
    var list = await fetchStationsByCountry(code, offset, limit);
    var items = [];
    for (var j = 0; j < list.length; j++) {
      var ch = stationToChannel(list[j], categoryId, offset + j + 1);
      if (ch) items.push(ch);
    }
    var next = items.length >= limit ? String(offset + limit) : undefined;
    return { items: items, next: next };
  }

  if (categoryId.indexOf("cat-") === 0) {
    var cid = categoryId.slice("cat-".length);
    var cont = continentById(cid);
    if (!cont) return { items: [] };
    var codes = cont.countries.map(function (c) {
      return c.code;
    });
    var stations = await topStationsFromCodes(codes, 5, Math.max(offset + limit, 40));
    var slice = stations.slice(offset, offset + limit);
    var channels = [];
    for (var i = 0; i < slice.length; i++) {
      channels.push({
        id: slice[i].id,
        title: slice[i].title,
        ref: slice[i].ref,
        logo: slice[i].poster,
        categoryId: categoryId,
        number: offset + i + 1,
      });
    }
    var next2 = stations.length > offset + limit ? String(offset + limit) : undefined;
    return { items: channels, next: next2 };
  }

  return { items: [] };
}

export async function liveSearch({ query }) {
  var q = (query || "").trim();
  if (q.length < 2) return { items: [] };
  var path =
    "/json/stations/search?name=" +
    encodeURIComponent(q) +
    "&hidebroken=true&order=clickcount&reverse=true&limit=30";
  var list = await rbFetch(path);
  var items = [];
  if (Array.isArray(list)) {
    for (var i = 0; i < list.length; i++) {
      var ch = stationToChannel(list[i]);
      if (ch) items.push(ch);
    }
  }
  return { items: items };
}
