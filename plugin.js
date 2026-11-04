/// <reference path="./kino.d.ts" />

/**
 * Instant Audio – radios en vivo por continente / país.
 * Fuente de datos: Radio Browser (streams limpios, sin anuncios).
 * Estructura de Home y navegación inspirada en instant.audio.
 */

const RB_HOSTS = [
  "https://de1.api.radio-browser.info",
  "https://de2.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
  "https://fr1.api.radio-browser.info",
];

const UA = "KinoInstantAudio/1.0.0";

/** Continentes y países (misma organización que instant.audio) */
const CONTINENTS = [
  {
    id: "NA",
    title: "Norteamérica",
    countries: [
      { code: "CU", name: "Cuba" },
      { code: "HT", name: "Haití" },
      { code: "JM", name: "Jamaica" },
      { code: "MX", name: "México" },
      { code: "PR", name: "Puerto Rico" },
      { code: "DO", name: "República Dominicana" },
      { code: "TT", name: "Trinidad y Tobago" },
      { code: "US", name: "Estados Unidos" },
      { code: "CA", name: "Canadá" },
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
      { code: "RU", name: "Rusia" },
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

function countryByCode(code) {
  for (var i = 0; i < CONTINENTS.length; i++) {
    var list = CONTINENTS[i].countries;
    for (var j = 0; j < list.length; j++) {
      if (list[j].code === code) return list[j];
    }
  }
  return null;
}

function flagUrl(code) {
  // 16:9-friendly wide flag (w160 = ~16:9 when used as poster)
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

function stationToItem(st) {
  var id = st.stationuuid || st.changeuuid || st.id;
  if (!id) return null;
  var title = cleanTitle(st.name);
  if (!title) return null;
  var logo = st.favicon && /^https?:\/\//i.test(st.favicon) ? st.favicon : null;
  // Prefer logo; if missing use country flag as 16:9 horizontal poster
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

function countryItem(c) {
  return {
    id: "co-" + c.code,
    ref: "country:" + c.code,
    title: c.name,
    kind: "live",
    poster: flagUrl(c.code),
    overview: "Radios de " + c.name,
  };
}

function continentItem(cont) {
  return {
    id: "ct-" + cont.id,
    ref: "continent:" + cont.id,
    title: cont.title,
    kind: "live",
    poster: flagUrl(cont.countries[0] && cont.countries[0].code) || undefined,
    overview: cont.countries.length + " países",
  };
}

/* ───────── home ───────── */

export async function home() {
  var prefer = kino.config.get("preferContinent") || "SA";
  var rows = [];

  // Preferido primero
  var ordered = CONTINENTS.slice();
  if (prefer !== "all") {
    ordered.sort(function (a, b) {
      if (a.id === prefer) return -1;
      if (b.id === prefer) return 1;
      return 0;
    });
  }

  for (var i = 0; i < ordered.length; i++) {
    var cont = ordered[i];
    var items = cont.countries.map(countryItem);
    rows.push({
      id: "row-" + cont.id,
      title: cont.title,
      items: items,
      ref: "continent:" + cont.id,
      genre: "musica",
    });
  }

  // Fila extra: populares mundiales (pocas, para no saturar)
  try {
    var top = await rbFetch(
      "/json/stations/topclick/12?hidebroken=true&order=clickcount&reverse=true"
    );
    if (Array.isArray(top) && top.length) {
      var topItems = [];
      for (var t = 0; t < top.length && topItems.length < 12; t++) {
        var it = stationToItem(top[t]);
        if (it) topItems.push(it);
      }
      if (topItems.length) {
        rows.unshift({
          id: "row-popular",
          title: "Más escuchadas",
          items: topItems,
          genre: "musica",
        });
      }
    }
  } catch (e) {
    kino.log("home popular failed", String(e));
  }

  return rows;
}

/* ───────── browse ───────── */

export async function browse(ref, cursor) {
  if (!ref) return { items: [] };

  if (ref.indexOf("continent:") === 0) {
    var cid = ref.slice("continent:".length);
    var cont = null;
    for (var i = 0; i < CONTINENTS.length; i++) {
      if (CONTINENTS[i].id === cid) {
        cont = CONTINENTS[i];
        break;
      }
    }
    if (!cont) return { items: [] };
    return {
      items: cont.countries.map(countryItem),
    };
  }

  if (ref.indexOf("country:") === 0) {
    var code = ref.slice("country:".length).toUpperCase();
    var limit = limitStations();
    var offset = 0;
    if (cursor) {
      var n = parseInt(cursor, 10);
      if (!isNaN(n) && n > 0) offset = n;
    }
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
    var next = items.length >= limit ? String(offset + limit) : undefined;
    return { items: items, next: next };
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
  // Filtrado de relevancia suave (Kino también filtra live)
  if (kino.rank && typeof kino.rank.filterRelevant === "function") {
    try {
      items = kino.rank.filterRelevant(items, q);
    } catch (e) {}
  }
  return items;
}

/* ───────── resolve ───────── */

export async function resolve(ref) {
  if (!ref || ref.indexOf("station:") !== 0) {
    throw kino.error("not_found", "ref", {
      userMessage: "Emisora no encontrada.",
    });
  }
  var uuid = ref.slice("station:".length);

  // Click + URL resuelta (Radio Browser recomienda el click para ranking)
  var clicked = null;
  try {
    clicked = await rbFetch("/json/url/" + encodeURIComponent(uuid));
  } catch (e) {
    // fallback a station by uuid
  }

  var url = null;
  var mime = null;
  if (clicked && clicked.url) {
    url = clicked.url;
  } else {
    var st = await rbFetch("/json/stations/byuuid/" + encodeURIComponent(uuid));
    if (Array.isArray(st) && st[0]) {
      url = st[0].url_resolved || st[0].url;
      if (st[0].hls) mime = "application/vnd.apple.mpegurl";
      else if (st[0].codec) {
        var c = String(st[0].codec).toUpperCase();
        if (c.indexOf("AAC") >= 0) mime = "audio/aac";
        else if (c.indexOf("MP3") >= 0) mime = "audio/mpeg";
        else if (c.indexOf("OGG") >= 0) mime = "audio/ogg";
      }
    }
  }

  if (!url || !/^https?:\/\//i.test(url)) {
    throw kino.error("unavailable", "no stream", {
      userMessage: "Esta emisora no tiene stream disponible ahora.",
    });
  }

  // Evitar anuncios / páginas intermedias: solo URLs de audio/stream
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
    } else {
      // progressive / icecast / shoutcast – el reproductor lo detecta
      mime = undefined;
    }
  }

  var stream = { url: url };
  if (mime) stream.mime = mime;
  // Headers suaves que muchos streams Icecast/Shoutcast aceptan mejor
  stream.headers = {
    "User-Agent": UA,
    Accept: "*/*",
  };
  return stream;
}

/* ───────── channels (pestaña En vivo) ───────── */

export async function liveCategories() {
  var cats = [];
  for (var i = 0; i < CONTINENTS.length; i++) {
    var cont = CONTINENTS[i];
    cats.push({
      id: "cat-" + cont.id,
      title: cont.title,
      genre: "musica",
    });
    // Subcategorías por país (primer nivel práctico)
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

  var code = null;
  if (categoryId.indexOf("cat-co-") === 0) {
    code = categoryId.slice("cat-co-".length).toUpperCase();
  } else if (categoryId.indexOf("cat-") === 0) {
    // Continente completo: devolver países como “canales” que resuelven a browse
    // Mejor: devolver las radios más populares del continente
    var cid = categoryId.slice("cat-".length);
    var cont = null;
    for (var i = 0; i < CONTINENTS.length; i++) {
      if (CONTINENTS[i].id === cid) {
        cont = CONTINENTS[i];
        break;
      }
    }
    if (!cont) return { items: [] };
    // Tomar top de los primeros países
    var all = [];
    var per = Math.max(4, Math.floor(24 / cont.countries.length));
    for (var k = 0; k < cont.countries.length && all.length < 30; k++) {
      try {
        var list = await rbFetch(
          "/json/stations/bycountrycodeexact/" +
            encodeURIComponent(cont.countries[k].code) +
            "?hidebroken=true&order=clickcount&reverse=true&limit=" +
            per
        );
        if (Array.isArray(list)) {
          for (var m = 0; m < list.length; m++) {
            var it = stationToItem(list[m]);
            if (it) {
              all.push({
                id: it.id,
                title: it.title,
                ref: it.ref,
                logo: it.poster,
                categoryId: categoryId,
              });
            }
          }
        }
      } catch (e) {}
    }
    return { items: all };
  }

  if (!code) return { items: [] };

  var limit = limitStations();
  var offset = 0;
  if (cursor) {
    var n = parseInt(cursor, 10);
    if (!isNaN(n) && n > 0) offset = n;
  }
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
      var st = list[j];
      var it = stationToItem(st);
      if (!it) continue;
      items.push({
        id: it.id,
        title: it.title,
        ref: it.ref,
        logo: it.poster,
        categoryId: categoryId,
        number: offset + j + 1,
      });
    }
  }
  var next = items.length >= limit ? String(offset + limit) : undefined;
  return { items: items, next: next };
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
      var it = stationToItem(list[i]);
      if (it) {
        items.push({
          id: it.id,
          title: it.title,
          ref: it.ref,
          logo: it.poster,
        });
      }
    }
  }
  return { items: items };
}
