#!/usr/bin/env node

/**
 * Fireside CMS Build Script
 *
 * Pulls copy from a Google Sheet (published as CSV) and updates index.html.
 *
 * Setup:
 *   1. In your Google Sheet: File → Share → Publish to web
 *      → select the sheet → CSV → Publish → copy the URL
 *   2. Paste the URL below as SHEET_URL, or pass it as an env var:
 *         SHEET_URL="https://..." node build.js
 *
 * Usage:
 *   node build.js              ← uses local content.csv
 *   SHEET_URL="..." node build.js  ← fetches live from Google Sheets
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SHEET_URL = process.env.SHEET_URL || '';
const HTML_FILE = path.join(__dirname, 'index.html');
const CSV_FILE  = path.join(__dirname, 'content.csv');

// ── CSV parser (handles quoted fields with commas) ──────────────────────────

function parseCSV(text) {
  const map = {};
  const rows = [];
  let col = '', row = [], inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { col += '"'; i++; }
      else if (c === '"')                    { inQuotes = false; }
      else                                   { col += c; }
    } else {
      if      (c === '"')  { inQuotes = true; }
      else if (c === ',')  { row.push(col); col = ''; }
      else if (c === '\n') { row.push(col); rows.push(row); row = []; col = ''; }
      else if (c !== '\r') { col += c; }
    }
  }
  if (col || row.length) { row.push(col); rows.push(row); }

  // Skip header row (row 0), build key→value map
  // The character-level parser above already handles quoted fields containing commas,
  // so rows[i][1] is always the full value — never join extra columns.
  for (let i = 1; i < rows.length; i++) {
    const key = (rows[i][0] || '').trim();
    const val = (rows[i][1] || '').trim();
    if (key) map[key] = val;
  }
  return map;
}

// ── Replace <!-- cms:key -->...<!-- /cms:key --> blocks ─────────────────────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyContent(html, map) {
  let out = html;
  let replaced = 0;
  for (const [key, value] of Object.entries(map)) {
    const re = new RegExp(`<!-- cms:${escapeRegex(key)} -->[\\s\\S]*?<!-- \\/cms:${escapeRegex(key)} -->`, 'g');
    const updated = out.replace(re, `<!-- cms:${key} -->${value}<!-- /cms:${key} -->`);
    if (updated !== out) replaced++;
    out = updated;
  }
  return { html: out, replaced };
}

// ── Fetch CSV from URL (follows one redirect) ───────────────────────────────

function fetchURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        return fetchURL(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// ── Main ────────────────────────────────────────────────────────────────────

async function run() {
  let csv;

  if (SHEET_URL) {
    console.log('Fetching content from Google Sheets…');
    csv = await fetchURL(SHEET_URL);
    console.log('Sheet fetched.');
  } else {
    console.log('No SHEET_URL set — using local content.csv');
    csv = fs.readFileSync(CSV_FILE, 'utf8');
  }

  // Sanity check — if the response doesn't look like CSV, bail early
  const firstLine = csv.split('\n')[0].trim().toLowerCase();
  if (!firstLine.startsWith('key')) {
    throw new Error(
      'Response does not look like a CSV file. Make sure your Google Sheet is published as CSV:\n' +
      '  File → Share → Publish to web → select sheet → CSV → Publish\n' +
      `  Got: ${firstLine.slice(0, 80)}`
    );
  }

  const map = parseCSV(csv);
  console.log(`Loaded ${Object.keys(map).length} content keys.`);

  const html = fs.readFileSync(HTML_FILE, 'utf8');
  const { html: updated, replaced } = applyContent(html, map);

  fs.writeFileSync(HTML_FILE, updated);
  console.log(`Done — updated ${replaced} content blocks in index.html.`);
}

run().catch(err => {
  console.error('Build failed:', err.message);
  process.exit(1);
});
