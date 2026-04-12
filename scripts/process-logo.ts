#!/usr/bin/env tsx
/**
 * Script pour traiter une image locale en logo + favicon
 * et l'uploader sur Supabase Storage.
 *
 * Usage :
 *   npx tsx --env-file=.env.local scripts/process-logo.ts --city rouen --image ~/Downloads/logo-pizza.png
 *   npx tsx --env-file=.env.local scripts/process-logo.ts --city caen --image ./mon-logo.png
 *   npx tsx --env-file=.env.local scripts/process-logo.ts --city rennes --image ~/Desktop/pizza.webp
 *
 * Ce script :
 *   1. Lit l'image locale (PNG, JPG, WebP, SVG...)
 *   2. Redimensionne en logo 512x512 (WebP), Apple Touch 180x180, favicons 32+16
 *   3. Crée le favicon.ico multi-taille
 *   4. Upload tout sur Supabase Storage (bucket city-assets)
 *   5. Met à jour la colonne logo_url de la ville
 *
 * Options :
 *   --city <slug>     Slug de la ville (ex: rouen, caen, rennes)
 *   --image <path>    Chemin vers l'image source
 *   --all             Appliquer la même image à toutes les villes
 *   --dry-run         Affiche ce qui serait fait sans écrire
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { createClient } from '@supabase/supabase-js';

// ─── Parse CLI args ───────────────────────────────────────────

function parseArgs(): { citySlug: string; imagePath: string; all: boolean; dryRun: boolean } {
  const args = process.argv.slice(2);
  let citySlug = '';
  let imagePath = '';
  let all = false;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--city' && args[i + 1]) { citySlug = args[i + 1]; i++; }
    if (args[i] === '--image' && args[i + 1]) { imagePath = args[i + 1]; i++; }
    if (args[i] === '--all') all = true;
    if (args[i] === '--dry-run') dryRun = true;
  }

  if (!imagePath) {
    console.error('Usage: npx tsx --env-file=.env.local scripts/process-logo.ts --city <slug> --image <path>');
    console.error('');
    console.error('Options:');
    console.error('  --city <slug>   Slug de la ville (ex: rouen)');
    console.error('  --image <path>  Chemin vers l\'image source (PNG, JPG, WebP, SVG)');
    console.error('  --all           Appliquer à toutes les villes');
    console.error('  --dry-run       Affiche ce qui serait fait sans écrire');
    process.exit(1);
  }

  if (!citySlug && !all) {
    console.error('❌ Spécifie --city <slug> ou --all');
    process.exit(1);
  }

  return { citySlug, imagePath, all, dryRun };
}

// ─── Helpers ──────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  return `${(bytes / 1024).toFixed(1)} Ko`;
}

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── Traitement d'image ───────────────────────────────────────

async function processImage(imagePath: string) {
  const fullPath = path.resolve(imagePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Fichier non trouvé : ${fullPath}`);
    process.exit(1);
  }

  const originalBuffer = fs.readFileSync(fullPath);
  console.log(`📂 Image source : ${fullPath} (${formatSize(originalBuffer.length)})`);

  // Logo principal : WebP 512x512
  const logoWebp = await sharp(originalBuffer)
    .resize(512, 512, { fit: 'cover', position: 'center' })
    .webp({ quality: 80 })
    .toBuffer();
  console.log(`  ✅ Logo 512x512 WebP : ${formatSize(logoWebp.length)}`);

  // Apple Touch Icon : PNG 180x180
  const png180 = await sharp(originalBuffer)
    .resize(180, 180, { fit: 'cover', position: 'center' })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  console.log(`  ✅ Apple Touch 180x180 PNG : ${formatSize(png180.length)}`);

  // Favicon 32px
  const png32 = await sharp(originalBuffer)
    .resize(32, 32, { fit: 'cover', position: 'center' })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  console.log(`  ✅ Favicon 32x32 PNG : ${formatSize(png32.length)}`);

  // Favicon 16px
  const png16 = await sharp(originalBuffer)
    .resize(16, 16, { fit: 'cover', position: 'center' })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  console.log(`  ✅ Favicon 16x16 PNG : ${formatSize(png16.length)}`);

  // Favicon .ico
  const faviconIco = await pngToIco([png16, png32]);
  console.log(`  ✅ Favicon .ico : ${formatSize(faviconIco.length)}`);

  return { logoWebp, png180, png32, png16, faviconIco };
}

// ─── Upload sur Supabase Storage ──────────────────────────────

async function uploadAssets(
  citySlug: string,
  assets: { logoWebp: Buffer; png180: Buffer; faviconIco: Buffer },
  dryRun: boolean
): Promise<{ logoUrl: string; faviconUrl: string } | null> {
  const supabase = createAdminClient();
  const bucket = 'city-assets';

  if (dryRun) {
    console.log(`\n📦 [DRY RUN] Upload pour "${citySlug}" :`);
    console.log(`   → ${bucket}/${citySlug}/logo.webp`);
    console.log(`   → ${bucket}/${citySlug}/apple-touch-icon.png`);
    console.log(`   → ${bucket}/${citySlug}/favicon.ico`);
    return null;
  }

  console.log(`\n📦 Upload pour "${citySlug}"...`);

  // Vérifier/créer le bucket
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.name === bucket);
  if (!bucketExists) {
    await supabase.storage.createBucket(bucket, { public: true });
    console.log(`  ✅ Bucket "${bucket}" créé`);
  }

  // Upload logo
  const { error: e1 } = await supabase.storage.from(bucket)
    .upload(`${citySlug}/logo.webp`, assets.logoWebp, { contentType: 'image/webp', upsert: true });
  if (e1) throw new Error(`Upload logo: ${e1.message}`);

  // Upload Apple Touch Icon
  const { error: e2 } = await supabase.storage.from(bucket)
    .upload(`${citySlug}/apple-touch-icon.png`, assets.png180, { contentType: 'image/png', upsert: true });
  if (e2) throw new Error(`Upload apple-touch: ${e2.message}`);

  // Upload favicon
  const { error: e3 } = await supabase.storage.from(bucket)
    .upload(`${citySlug}/favicon.ico`, assets.faviconIco, { contentType: 'image/x-icon', upsert: true });
  if (e3) throw new Error(`Upload favicon: ${e3.message}`);

  // URLs publiques
  const { data: logoData } = supabase.storage.from(bucket).getPublicUrl(`${citySlug}/logo.webp`);
  const { data: faviconData } = supabase.storage.from(bucket).getPublicUrl(`${citySlug}/favicon.ico`);

  console.log(`  ✅ Logo : ${logoData.publicUrl}`);
  console.log(`  ✅ Favicon : ${faviconData.publicUrl}`);

  return { logoUrl: logoData.publicUrl, faviconUrl: faviconData.publicUrl };
}

// ─── Mise à jour de la ville ──────────────────────────────────

async function updateCity(citySlug: string, logoUrl: string, dryRun: boolean) {
  if (dryRun) {
    console.log(`  [DRY RUN] Mise à jour cities.logo_url pour "${citySlug}"`);
    return;
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('cities')
    .update({ logo_url: logoUrl })
    .eq('slug', citySlug);

  if (error) {
    console.error(`  ❌ Erreur mise à jour ville "${citySlug}": ${error.message}`);
  } else {
    console.log(`  ✅ Ville "${citySlug}" mise à jour (logo_url)`);
  }
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  const { citySlug, imagePath, all, dryRun } = parseArgs();

  console.log('');
  console.log('🍕 Pizza Logo Processor');
  console.log('═'.repeat(50));
  if (dryRun) console.log('⚠️  Mode DRY RUN');
  console.log('');

  // Vérifier env
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises');
    process.exit(1);
  }

  // 1. Traiter l'image
  const assets = await processImage(imagePath);

  // 2. Déterminer les villes
  let citySlugs: string[] = [];

  if (all) {
    const supabase = createAdminClient();
    const { data: cities } = await supabase.from('cities').select('slug').order('slug');
    citySlugs = (cities || []).map((c) => c.slug);
    console.log(`\n🏙️  ${citySlugs.length} villes trouvées : ${citySlugs.join(', ')}`);
  } else {
    citySlugs = [citySlug];
  }

  // 3. Upload + mise à jour pour chaque ville
  for (const slug of citySlugs) {
    const result = await uploadAssets(slug, assets, dryRun);
    if (result) {
      await updateCity(slug, result.logoUrl, dryRun);
    }
  }

  console.log('\n✅ Terminé !');
  console.log('');
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
