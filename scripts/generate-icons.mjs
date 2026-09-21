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
  console.log(`Generated ${file}`);
}

// Maskable icons: Android crops these to a circle/squircle, and only the centre
// 80% is guaranteed visible. The logo's outer dial ring reaches almost to the
// edge, so scale it down onto a white canvas to keep it inside that safe zone.
const MASKABLE_LOGO_SCALE = 0.72;

for (const size of [192, 512]) {
  const inner = Math.round(size * MASKABLE_LOGO_SCALE);
  const logo = await sharp(sourceLogo).resize(inner, inner, { fit: "cover" }).png().toBuffer();
  const file = `icon-maskable-${size}x${size}.png`;
  await sharp({ create: { width: size, height: size, channels: 4, background: "#ffffff" } })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(join(publicDir, file));
  console.log(`Generated ${file}`);
}
