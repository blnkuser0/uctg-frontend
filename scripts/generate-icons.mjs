// Generates PWA/favicon icons from the real Ugnexa Catalyst logo.
// Run `node scripts/generate-icons.mjs` any time the source logo changes.
import sharp from "sharp";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const sourceLogo = join(publicDir, "assets", "branding", "logo-square.jpg");
mkdirSync(publicDir, { recursive: true });

const targets = [
  { file: "icon-192x192.png", size: 192 },
  { file: "icon-512x512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "favicon-32x32.png", size: 32 },
];

for (const { file, size } of targets) {
  await sharp(sourceLogo).resize(size, size, { fit: "cover" }).png().toFile(join(publicDir, file));
  // eslint-disable-next-line no-console
  console.log(`Generated ${file}`);
}
