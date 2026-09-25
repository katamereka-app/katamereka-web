<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>

<xsl:template match="/">
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Sitemap — Katamereka</title>
  <meta name="robots" content="noindex"/>
  <style>
    :root {
      --bg: #0f172a;
      --card: #ffffff;
      --accent: #ea580c;
      --accent-dark: #c2410c;
      --text: #1e293b;
      --muted: #64748b;
      --border: #e2e8f0;
      --row-alt: #f8fafc;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(180deg, var(--bg) 0%, #1e293b 220px, #f1f5f9 220px);
      color: var(--text);
    }
    header {
      max-width: 1100px;
      margin: 0 auto;
      padding: 40px 24px 24px;
      color: #f8fafc;
    }
    header .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 22px;
      letter-spacing: -0.02em;
    }
    header .brand span.dot { color: var(--accent); }
    header p.subtitle {
      margin: 8px 0 0;
      color: #cbd5e1;
      font-size: 14px;
    }
    main {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px 60px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      overflow: hidden;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 22px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      gap: 8px;
    }
    .card-header h1 {
      font-size: 16px;
      margin: 0;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fff7ed;
      color: var(--accent-dark);
      border: 1px solid #fed7aa;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    thead th {
      text-align: left;
      padding: 12px 22px;
      background: var(--row-alt);
      color: var(--muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 11px;
      border-bottom: 1px solid var(--border);
    }
    tbody td {
      padding: 12px 22px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    tbody tr:nth-child(even) { background: var(--row-alt); }
    tbody tr:hover { background: #fff7ed; }
    a.loc {
      color: var(--accent-dark);
      text-decoration: none;
      font-weight: 500;
      word-break: break-all;
    }
    a.loc:hover { text-decoration: underline; }
    .muted { color: var(--muted); }
    .pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      background: #eef2ff;
      color: #4338ca;
      font-size: 11px;
      font-weight: 600;
    }
    footer {
      max-width: 1100px;
      margin: 18px auto 0;
      padding: 0 24px;
      color: var(--muted);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">Katamereka<span class="dot">.</span>id</div>
    <p class="subtitle">XML Sitemap — generated dynamically from the businesses API</p>
  </header>
  <main>
    <div class="card">
      <div class="card-header">
        <h1>Daftar URL</h1>
        <span class="badge">
          <xsl:value-of select="count(//sm:url)"/> URL terdaftar
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:55%">URL</th>
            <th>Last Modified</th>
            <th>Change Freq</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          <xsl:for-each select="//sm:url">
            <tr>
              <td>
                <a class="loc" href="{sm:loc}" target="_blank" rel="noopener">
                  <xsl:value-of select="sm:loc"/>
                </a>
              </td>
              <td class="muted">
                <xsl:choose>
                  <xsl:when test="sm:lastmod">
                    <xsl:value-of select="sm:lastmod"/>
                  </xsl:when>
                  <xsl:otherwise>—</xsl:otherwise>
                </xsl:choose>
              </td>
              <td>
                <xsl:if test="sm:changefreq">
                  <span class="pill"><xsl:value-of select="sm:changefreq"/></span>
                </xsl:if>
              </td>
              <td class="muted">
                <xsl:value-of select="sm:priority"/>
              </td>
            </tr>
          </xsl:for-each>
        </tbody>
      </table>
    </div>
    <footer>Dibuat otomatis oleh katamereka-web · disajikan lewat /sitemap.xml</footer>
  </main>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
