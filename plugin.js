/// <reference path="./kino.d.ts" />

/**
 * Instant Audio – radios en vivo por continente / país.
 * Fuente: Radio Browser (streams limpios, sin anuncios).
 * Navegación: continente → emisoras (Home / Ver más).
 * Países en pestaña En vivo y como filtro de browse.
 */

const RB_HOSTS = [
  "https://de1.api.radio-browser.info",
  "https://de2.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
  "https://fr1.api.radio-browser.info",
];

const UA = "KinoInstantAudio/1.0.2";

/** Códigos ISO de Sudamérica (populares + filas prioritarias) */
const SA_CODES = ["AR", "BO", "BR", "CL", "CO", "EC", "PY", "PE", "SR", "UY", "VE"];

/** Continentes y países (misma organización que instant.audio) */
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

function flagUrl(code) {
  return "https://flagcdn.com/w640/" + String(code || "").toLowerCase() + ".png";
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

/** Solo emisoras reproducibles (kind live + ref station:) */
function stationToItem(st) {
  var id = st.stationuuid || st.changeuuid;
  if (!id) return null;
  var title = cleanTitle(st.name);
  if (!title) return null;
  var logo = st.favicon && /^https?:\/\//i.test(st.favicon) ? st.favicon : null;
  var poster = logo || flagUrl(st.countrycode);
  return {
    id: "st-" + id,
    ref: "station:" + id,
    title: title,
    kind: "live",
    poster: poster,
    overview: [st.country, st.state, st.tags].filter(Boolean).join(" · ").slice(0, 300) || undefined,
    badges: st.bitrate ? [String(st.bitrate) + " kbps"] : undefined,
  };
}

function stationToChannel(st, categoryId, number) {
  var it = stationToItem(st);
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

/** Estaciones de un país (paginado) */
async function stationsByCountry(code, offset, limit) {
  var path =
    "/json/stations/bycountrycodeexact/" +
    encodeURIComponent(code) +
    "?hidebroken=true&order=clickcount&reverse=true&limit=" +
    limit +
    "&offset=" +
    offset;
  var list = await rbFetch(path);
  var items = [];
  if (Array.isArray(list)) {
    for (var j = 0; j < list.length; j++) {
      var it = stationToItem(list[j]);
      if (it) items.push(it);
    }
  }
  return items;
}

/** Top estaciones de varios países (p. ej. un continente) */
async function topStationsFromCodes(codes, perCountry, maxTotal) {
  var all = [];
  var seen = {};
  perCountry = perCountry || 6;
  maxTotal = maxTotal || 30;
  for (var k = 0; k < codes.length && all.length < maxTotal; k++) {
    try {
      var list = await rbFetch(
        "/json/stations/bycountrycodeexact/" +
          encodeURIComponent(codes[k]) +
          "?hidebroken=true&order=clickcount&reverse=true&limit=" +
          perCountry
      );
      if (!Array.isArray(list)) continue;
      for (var m = 0; m < list.length && all.length < maxTotal; m++) {
        var it = stationToItem(list[m]);
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
 * Cada fila de continente muestra emisoras (live), no países.
 * Así al tocar se reproduce; "Ver más" usa ref → browse.
 * Los países viven en En vivo y en browse(country:XX).
 */

export async function home() {
  var prefer = kino.config.get("preferContinent") || "SA";
  var rows = [];

  // Populares de Sudamérica (no mundiales)
  try {
    var popular = await topStationsFromCodes(SA_CODES, 4, 16);
    if (popular.length) {
      rows.push({
        id: "row-popular",
        title: "Más escuchadas · Sudamérica",
        items: popular,
        genre: "musica",
      });
    }
  } catch (e) {
    kino.log("home popular SA failed", String(e));
  }

  var ordered = CONTINENTS.slice();
  if (prefer !== "all") {
    ordered.sort(function (a, b) {
      if (a.id === prefer) return -1;
      if (b.id === prefer) return 1;
      return 0;
    });
  }

  // Una fila por continente con emisoras reales (kind live)
  for (var i = 0; i < ordered.length; i++) {
    var cont = ordered[i];
    var codes = cont.countries.map(function (c) {
      return c.code;
    });
    try {
      var items = await topStationsFromCodes(codes, 3, 12);
      if (!items.length) continue;
      rows.push({
        id: "row-" + cont.id,
        title: cont.title,
        items: items,
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
 * continent:XX → emisoras del continente
 * country:XX  → emisoras del país
 */

export async function browse(ref, cursor) {
  if (!ref) return { items: [] };

  var limit = limitStations();
  var offset = 0;
  if (cursor) {
    var n = parseInt(cursor, 10);
    if (!isNaN(n) && n > 0) offset = n;
  }

  if (ref.indexOf("continent:") === 0) {
    var cid = ref.slice("continent:".length);
    var cont = continentById(cid);
    if (!cont) return { items: [] };

    var codes = cont.countries.map(function (c) {
      return c.code;
    });
    var batch = Math.max(limit, 20);
    var gathered = [];
    var seen = {};
    var countryIdx = 0;
    var per = Math.max(8, Math.ceil(batch / Math.max(1, codes.length)));

    while (gathered.length < offset + limit && countryIdx < codes.length * 3) {
      var code = codes[countryIdx % codes.length];
      var pageOff = Math.floor(countryIdx / codes.length) * per;
      try {
        var chunk = await stationsByCountry(code, pageOff, per);
        for (var i = 0; i < chunk.length; i++) {
          if (seen[chunk[i].id]) continue;
          seen[chunk[i].id] = true;
          gathered.push(chunk[i]);
        }
      } catch (e) {}
      countryIdx++;
      if (countryIdx > codes.length * 5) break;
    }

    var page = gathered.slice(offset, offset + limit);
    var next = page.length >= limit ? String(offset + limit) : undefined;
    return { items: page, next: next };
  }

  if (ref.indexOf("country:") === 0) {
    var ccode = ref.slice("country:".length).toUpperCase();
    var items = await stationsByCountry(ccode, offset, limit);
    var nextC = items.length >= limit ? String(offset + limit) : undefined;
    return { items: items, next: nextC };
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
      var it = stationToItem(list[i]);
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

/* ───────── resolve ─────────
 * Solo refs station:<uuid>. country:/continent: no deben llegar aquí.
 */

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

/* ───────── channels (pestaña En vivo) ─────────
 * Categorías = continentes + países. Al abrir un país se listan emisoras.
 */

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
        title: c.name,
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
    var list = await rbFetch(
      "/json/stations/bycountrycodeexact/" +
        encodeURIComponent(code) +
        "?hidebroken=true&order=clickcount&reverse=true&limit=" +
        limit +
        "&offset=" +
        offset
    );
    var items = [];
    if (Array.isArray(list)) {
      for (var j = 0; j < list.length; j++) {
        var ch = stationToChannel(list[j], categoryId, offset + j + 1);
        if (ch) items.push(ch);
      }
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
    var stations = await topStationsFromCodes(codes, 5, offset || 40);
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
