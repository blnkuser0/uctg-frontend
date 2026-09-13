// Placeholder icon generator — run `node scripts/generate-icons.mjs`.
// Produces a simple amber "UC" mark for Ugnexa Catalyst. Swap for real
// brand assets in public/ once logo files are provided; this script can
// then be deleted or left as a fallback generator.
import sharp from "sharp";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
mkdirSync(publicDir, { recursive: true });

const svg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#f59e0b"/>
  <text x="256" y="300" font-family="Arial, Helvetica, sans-serif" font-weight="700"
    font-size="220" fill="#1c1917" text-anchor="middle">UC</text>
</svg>`;

const targets = [
  { file: "icon-192x192.png", size: 192 },
  { file: "icon-512x512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "favicon-32x32.png", size: 32 },
];

for (const { file, size } of targets) {
  await sharp(Buffer.from(svg(size))).resize(size, size).png().toFile(join(publicDir, file));
  // eslint-disable-next-line no-console
  console.log(`Generated ${file}`);
}
