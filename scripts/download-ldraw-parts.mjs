import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PARTS = [
  ['15462', '70'], ['24316', '70'], ['61903', '71'], ['18677', '71'],
  ['85943', '72'], ['15714', '2'], ['61678', '2'], ['11477', '2'],
  ['15068', '2'], ['2654', '0'], ['18654', '19'], ['4519', '4'],
  ['3705', '14'], ['32062', '4'], ['92280', '0'], ['3022', '71'],
  ['3666', '2'], ['3460', '72'], ['2420', '2'], ['3623', '72'],
  ['3023', '27'], ['3023', '14'], ['15570', '18'], ['32123b', '14'],
  ['32198', '19'], ['6589', '19'], ['3700', '0'], ['32000', '72'],
  ['32064', '2'], ['15672', '27'], ['3040', '27'], ['18862', '2'],
  ['6091', '2'], ['2780', '0'], ['391', '19'], ['43719', '0'],
  ['3021', '2'], ['33909', '0'], ['51739', '0'], ['30136', '0'],
  ['4854', '72'], ['32014', '71'], ['22961', '71'], ['11458', '72'],
];

const ROOT = path.resolve('assets/ldraw');
const PARTS_DIR = path.join(ROOT, 'parts');
const MODELS_DIR = path.join(ROOT, 'models');
const SOURCES = [
  'https://library.ldraw.org/library/official/parts',
  'https://library.ldraw.org/library/unofficial/parts',
];

async function downloadPart(partId) {
  for (const baseUrl of SOURCES) {
    const url = `${baseUrl}/${partId}.dat`;
    const response = await fetch(url);
    if (response.ok) {
      return { data: Buffer.from(await response.arrayBuffer()), url };
    }
    if (response.status !== 404) {
      throw new Error(`${url}: HTTP ${response.status}`);
    }
  }
  throw new Error(`${partId}.dat was not found in the official or unofficial library`);
}

await Promise.all([mkdir(PARTS_DIR, { recursive: true }), mkdir(MODELS_DIR, { recursive: true })]);

const uniquePartIds = [...new Set(PARTS.map(([partId]) => partId))];
const downloaded = new Map();
const failures = [];

for (const [index, partId] of uniquePartIds.entries()) {
  try {
    const result = await downloadPart(partId);
    await writeFile(path.join(PARTS_DIR, `${partId}.dat`), result.data);
    downloaded.set(partId, result.url);
    console.log(`[${index + 1}/${uniquePartIds.length}] ${partId}.dat`);
  } catch (error) {
    failures.push({ partId, error: error.message });
    console.error(`[${index + 1}/${uniquePartIds.length}] FAILED ${partId}: ${error.message}`);
  }
}

const manifest = [];
for (const [partId, colorCode] of PARTS) {
  if (!downloaded.has(partId)) continue;
  const fileName = `${partId}-${colorCode}.ldr`;
  const model = [
    `0 ${partId} in LDraw colour ${colorCode}`,
    '0 Name: ' + fileName,
    '0 !LDRAW_ORG Model',
    `1 ${colorCode} 0 0 0 1 0 0 0 1 0 0 0 1 ${partId}.dat`,
    '',
  ].join('\n');
  await writeFile(path.join(MODELS_DIR, fileName), model, 'utf8');
  manifest.push({
    partId,
    colorCode,
    model: `models/${fileName}`,
    part: `parts/${partId}.dat`,
    source: downloaded.get(partId),
  });
}

await writeFile(
  path.join(ROOT, 'manifest.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), count: manifest.length, parts: manifest }, null, 2) + '\n',
  'utf8',
);

console.log(`Saved ${downloaded.size} part files and ${manifest.length} coloured models to ${ROOT}`);
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
