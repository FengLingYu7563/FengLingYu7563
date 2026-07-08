import { mkdir, writeFile } from "node:fs/promises";

const username = process.env.GITHUB_USERNAME || "FengLingYu7563";
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
const outDir = "assets";
const pinnedRepos = ["discord-bot-demo", "Wynnmaze"];

const headers = {
  "Accept": "application/vnd.github+json",
  "User-Agent": "github-profile-stats-generator",
  "X-GitHub-Api-Version": "2022-11-28",
};

if (token) {
  headers.Authorization = `Bearer ${token}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function fetchJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return response.json();
}

async function fetchAllPages(url) {
  const results = [];
  let page = 1;

  while (true) {
    const separator = url.includes("?") ? "&" : "?";
    const pageUrl = `${url}${separator}per_page=100&page=${page}`;
    const data = await fetchJson(pageUrl);
    results.push(...data);

    if (!Array.isArray(data) || data.length < 100) {
      break;
    }

    page += 1;
  }

  return results;
}

async function fetchLanguages(repos) {
  const totals = new Map();

  for (const repo of repos) {
    const langs = await fetchJson(repo.languages_url);
    for (const [language, bytes] of Object.entries(langs)) {
      totals.set(language, (totals.get(language) || 0) + bytes);
    }
  }

  return [...totals.entries()]
    .filter(([, bytes]) => bytes > 0)
    .sort((a, b) => b[1] - a[1]);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function renderStatsCard(stats) {
  const rows = [
    ["Total Stars", formatNumber(stats.stars)],
    ["Public Repos", formatNumber(stats.repos)],
    ["Forks", formatNumber(stats.forks)],
    ["Languages", formatNumber(stats.languages)],
  ];

  const rowSvg = rows.map(([label, value], index) => {
    const y = 63 + index * 25;
    return `
      <text x="32" y="${y}" class="label">${escapeXml(label)}</text>
      <text x="463" y="${y}" text-anchor="end" class="value">${escapeXml(value)}</text>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="495" height="165" viewBox="0 0 495 165" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(username)} GitHub stats</title>
  <desc id="desc">Automatically generated GitHub profile statistics.</desc>
  <style>
    .card { fill: #0d1117; }
    .title { fill: #58a6ff; font: 600 18px Segoe UI, Ubuntu, Sans-Serif; }
    .label { fill: #c9d1d9; font: 400 14px Segoe UI, Ubuntu, Sans-Serif; }
    .value { fill: #f0f6fc; font: 700 14px Segoe UI, Ubuntu, Sans-Serif; }
    .accent { fill: #f85149; }
  </style>
  <rect class="card" width="495" height="165" rx="6"/>
  <text x="24" y="34" class="title">${escapeXml(username)}'s GitHub Stats</text>
  <circle class="accent" cx="463" cy="28" r="5"/>
  ${rowSvg}
  <text x="24" y="148" class="label">Updated by GitHub Actions</text>
</svg>
`;
}

function renderTopLanguagesCard(languageTotals) {
  const colors = [
    "#f1e05a",
    "#3572A5",
    "#A97BFF",
    "#b07219",
    "#00ADD8",
    "#41b883",
    "#e34c26",
    "#89e051",
  ];

  const totalBytes = languageTotals.reduce((sum, [, bytes]) => sum + bytes, 0);
  const top = languageTotals.slice(0, 5);

  let x = 24;
  const bars = top.map(([, bytes], index) => {
    const width = totalBytes > 0 ? Math.max(4, Math.round((bytes / totalBytes) * 312)) : 0;
    const svg = `<rect x="${x}" y="52" width="${width}" height="8" fill="${colors[index]}" rx="4"/>`;
    x += width;
    return svg;
  }).join("");

  const rows = top.map(([language, bytes], index) => {
    const percent = totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : "0.0";
    const y = 80 + index * 18;
    return `
      <circle cx="29" cy="${y - 4}" r="4" fill="${colors[index]}"/>
      <text x="42" y="${y}" class="label">${escapeXml(language)}</text>
      <text x="336" y="${y}" text-anchor="end" class="value">${percent}%</text>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="360" height="165" viewBox="0 0 360 165" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(username)} top languages</title>
  <desc id="desc">Automatically generated language usage across public repositories.</desc>
  <style>
    .card { fill: #0d1117; }
    .title { fill: #58a6ff; font: 600 18px Segoe UI, Ubuntu, Sans-Serif; }
    .label { fill: #c9d1d9; font: 400 13px Segoe UI, Ubuntu, Sans-Serif; }
    .value { fill: #f0f6fc; font: 700 13px Segoe UI, Ubuntu, Sans-Serif; }
  </style>
  <rect class="card" width="360" height="165" rx="6"/>
  <text x="24" y="34" class="title">Most Used Languages</text>
  ${bars}
  ${rows}
</svg>
`;
}

function renderRepoCard(repo) {
  const description = repo.description || "GitHub repository";
  const language = repo.language || "Code";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="120" viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(repo.name)} repository card</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <style>
    .card { fill: #1f222e; }
    .repo { fill: #f85d7f; font: 600 18px Segoe UI, Ubuntu, Sans-Serif; }
    .desc { fill: #c9d1d9; font: 400 13px Segoe UI, Ubuntu, Sans-Serif; }
    .meta { fill: #f0f6fc; font: 600 12px Segoe UI, Ubuntu, Sans-Serif; }
    .muted { fill: #8b949e; font: 400 12px Segoe UI, Ubuntu, Sans-Serif; }
    .icon { fill: #f8d866; }
  </style>
  <rect class="card" width="400" height="120" rx="6"/>
  <text x="24" y="32" class="repo">${escapeXml(repo.name)}</text>
  <text x="24" y="58" class="desc">${escapeXml(description.slice(0, 48))}${description.length > 48 ? "..." : ""}</text>
  <circle cx="30" cy="89" r="5" class="icon"/>
  <text x="42" y="93" class="muted">${escapeXml(language)}</text>
  <text x="245" y="93" class="meta">Stars ${formatNumber(repo.stargazers_count)}</text>
  <text x="322" y="93" class="meta">Forks ${formatNumber(repo.forks_count)}</text>
</svg>
`;
}

const repos = await fetchAllPages(`https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated`);
const ownRepos = repos.filter((repo) => !repo.fork);
const languageTotals = await fetchLanguages(ownRepos);

const stats = {
  stars: ownRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
  repos: ownRepos.length,
  forks: ownRepos.reduce((sum, repo) => sum + repo.forks_count, 0),
  languages: languageTotals.length,
};

await mkdir(outDir, { recursive: true });
await writeFile(`${outDir}/github-stats.svg`, renderStatsCard(stats), "utf8");
await writeFile(`${outDir}/top-langs.svg`, renderTopLanguagesCard(languageTotals), "utf8");

for (const repoName of pinnedRepos) {
  const repo = await fetchJson(`https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}`);
  await writeFile(`${outDir}/${repoName.toLowerCase()}-card.svg`, renderRepoCard(repo), "utf8");
}

console.log(`Generated stats for ${username}: ${stats.repos} repos, ${stats.languages} languages.`);
