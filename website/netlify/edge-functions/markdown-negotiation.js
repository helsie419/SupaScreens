// Serves a Markdown representation of any HTML page when a client's Accept
// header explicitly prefers text/markdown over text/html (RFC 9110 content
// negotiation), e.g. `curl -H "Accept: text/markdown" https://supascreens.com.au/`.
// Regular browser requests (which list text/html explicitly) are untouched.

function decodeEntities(str) {
  const map = {
    "&amp;": "&", "&nbsp;": " ", "&copy;": "©", "&middot;": "·",
    "&rsquo;": "’", "&lsquo;": "‘", "&rdquo;": "”", "&ldquo;": "“",
    "&mdash;": "—", "&ndash;": "–", "&#39;": "'", "&quot;": '"',
    "&lt;": "<", "&gt;": ">", "&times;": "×", "&#8249;": "‹", "&#8250;": "›",
  };
  return str.replace(/&[a-zA-Z#0-9]+;/g, (m) => (map[m] !== undefined ? map[m] : m));
}

function resolveUrl(url) {
  if (!url) return url;
  if (/^(https?:|mailto:|tel:|#)/i.test(url)) return url;
  if (url.startsWith("/")) return "https://supascreens.com.au" + url;
  return url;
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/[ \t]+/g, " ").trim();
}

function extractMain(html) {
  const mainMatch = html.match(/<main>([\s\S]*?)<\/main>/i);
  if (mainMatch) return mainMatch[1];
  let body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  body = body ? body[1] : html;
  body = body.replace(/<header[\s\S]*?<\/header>/i, "");
  body = body.replace(/<footer[\s\S]*?<\/footer>/i, "");
  return body;
}

function htmlToMarkdown(html) {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);

  const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : "SupaScreens";
  const description = descMatch ? decodeEntities(descMatch[1].trim()) : "";
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : "";

  let body = extractMain(html);

  body = body.replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, "");

  body = body.replace(/<img[^>]*\balt="([^"]*)"[^>]*\bsrc="([^"]*)"[^>]*>/gi,
    (m, alt, src) => `\n![${decodeEntities(alt)}](${resolveUrl(src)})\n`);
  body = body.replace(/<img[^>]*\bsrc="([^"]*)"[^>]*\balt="([^"]*)"[^>]*>/gi,
    (m, src, alt) => `\n![${decodeEntities(alt)}](${resolveUrl(src)})\n`);

  body = body.replace(/<a\b[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (m, href, inner) => {
    const text = stripTags(inner) || href;
    return `[${text}](${resolveUrl(href)})`;
  });

  body = body.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, (m, inner) => `\n\n# ${stripTags(inner)}\n`);
  body = body.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (m, inner) => `\n\n## ${stripTags(inner)}\n`);
  body = body.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, (m, inner) => `\n\n### ${stripTags(inner)}\n`);

  body = body.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (m, inner) => `\n- ${stripTags(inner)}`);

  body = body.replace(/<dt\b[^>]*>([\s\S]*?)<\/dt>/gi, (m, inner) => `\n**${stripTags(inner)}**`);
  body = body.replace(/<dd\b[^>]*>([\s\S]*?)<\/dd>/gi, (m, inner) => `: ${stripTags(inner)}\n`);

  body = body.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (m, inner) => `\n\n${stripTags(inner)}\n`);

  body = body.replace(/<\/?button[^>]*>/gi, "");

  body = body.replace(/<[^>]+>/g, "");
  body = decodeEntities(body);
  body = body.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  let out = `# ${title}\n`;
  if (description) out += `\n> ${description}\n`;
  out += `\n${body}\n`;
  if (canonical) out += `\n---\nPhone: 1300 158 699 | Email: sales@supascreens.com.au\nHTML version: ${canonical}\n`;
  return out;
}

function parseAccept(header) {
  return header.split(",").map((part) => {
    const [type, ...params] = part.trim().split(";").map((s) => s.trim());
    let q = 1;
    for (const p of params) {
      const m = p.match(/^q=([0-9.]+)$/);
      if (m) q = parseFloat(m[1]);
    }
    return { type: type.toLowerCase(), q };
  });
}

function exactQ(accepted, type) {
  const found = accepted.find((a) => a.type === type);
  return found ? found.q : 0;
}

function prefersMarkdown(acceptHeader) {
  if (!acceptHeader) return false;
  const lower = acceptHeader.toLowerCase();
  if (!lower.includes("text/markdown") && !lower.includes("text/x-markdown")) return false;
  const accepted = parseAccept(lower);
  const mdQ = Math.max(exactQ(accepted, "text/markdown"), exactQ(accepted, "text/x-markdown"));
  const htmlQ = exactQ(accepted, "text/html");
  return mdQ >= htmlQ;
}

function appendVary(existing, add) {
  if (!existing) return add;
  const parts = existing.split(",").map((s) => s.trim());
  if (parts.some((p) => p.toLowerCase() === add.toLowerCase())) return existing;
  return existing + ", " + add;
}

export default async (request, context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const accept = request.headers.get("accept") || "";
  const vary = appendVary(response.headers.get("vary"), "Accept");

  if (!prefersMarkdown(accept)) {
    response.headers.set("vary", vary);
    return response;
  }

  const html = await response.text();
  const markdown = htmlToMarkdown(html);

  return new Response(markdown, {
    status: response.status,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "vary": vary,
      "cache-control": response.headers.get("cache-control") || "public, max-age=0, must-revalidate",
    },
  });
};

export const config = { path: "/*" };
