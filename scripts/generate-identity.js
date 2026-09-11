/**
 * Identity-generation pipeline.
 *
 * Takes one source logo image (PNG/JPG/SVG, ideally square and at least 512x512) and
 * generates a full set of favicon/touch-icon/OG-image variants from it. Writes everything
 * into public/generated/ rather than overwriting the site's current app/icon.svg directly —
 * review the output, then manually swap in whichever files you want to adopt. This keeps
 * running the script from silently changing the site's current branding. Adopting the
 * generated og-image.png as a fixed replacement for the site's current default (the dynamic
 * app/opengraph-image.js route, which already renders the real admin-edited business name/
 * tagline) means deleting that route, not just adding the PNG to public/.
 *
 * Usage:
 *   node scripts/generate-identity.js --source path/to/logo.png [--bg "#ffffff"]
 *
 * Requires the source image to already exist — this does not create a logo from nothing.
 */
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

function parseArgs(argv) {
  const args = { bg: "#ffffff" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--source") args.source = argv[++i];
    else if (argv[i] === "--bg") args.bg = argv[++i];
    else if (argv[i] === "--out-dir") args.outDir = argv[++i];
  }
  return args;
}

const OUTPUTS = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "favicon-48x48.png", size: 48 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-512x512.png", size: 512 },
];

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.source) {
    console.error(
      "Missing --source. Usage: node scripts/generate-identity.js --source path/to/logo.png"
    );
    process.exit(1);
  }

  const sourcePath = path.resolve(args.source);
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    process.exit(1);
  }

  const outDir = args.outDir
    ? path.resolve(args.outDir)
    : path.resolve(__dirname, "..", "public", "generated");
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Source: ${sourcePath}`);
  console.log(`Output: ${outDir}\n`);

  for (const { name, size } of OUTPUTS) {
    const outPath = path.join(outDir, name);
    await sharp(sourcePath)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`  ${name} (${size}x${size})`);
  }

  // OG image: logo centered on a solid background canvas, standard 1200x630 social-share size.
  const ogWidth = 1200;
  const ogHeight = 630;
  const logoSize = 320;
  const logoBuffer = await sharp(sourcePath)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const ogPath = path.join(outDir, "og-image.png");
  await sharp({
    create: {
      width: ogWidth,
      height: ogHeight,
      channels: 4,
      background: args.bg,
    },
  })
    .composite([
      {
        input: logoBuffer,
        left: Math.round((ogWidth - logoSize) / 2),
        top: Math.round((ogHeight - logoSize) / 2),
      },
    ])
    .png()
    .toFile(ogPath);
  console.log(`  og-image.png (${ogWidth}x${ogHeight}, bg ${args.bg})`);

  console.log(
    `\nDone. Nothing in app/ or public/ was overwritten — review the files in ` +
      `${path.relative(process.cwd(), outDir)} and manually copy whichever ones you want ` +
      `to adopt over app/icon.svg / a real favicon.ico. Adopting og-image.png instead of the ` +
      `dynamic app/opengraph-image.js default means deleting that route, not just adding the PNG.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
