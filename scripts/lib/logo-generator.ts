/**
 * Génère un logo pizza via DALL-E 3, le redimensionne et compresse
 * en logo + favicon, et upload le tout sur Supabase Storage.
 */

import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { createClient } from '@supabase/supabase-js';

interface LogoResult {
  logoUrl: string;      // URL du logo 512x512 (webp, ~20-40 Ko)
  faviconUrl: string;   // URL du favicon .ico (multi-taille, ~5 Ko)
}

const LOGO_PROMPT = `A minimalist pizza logo icon. Simple flat design, a single pizza slice or whole pizza seen from above. Warm colors (red, orange, yellow). Clean vector style, no text, no letters, no words. Solid colored background. Suitable as a website favicon and app icon. High contrast, modern, professional.`;

/**
 * Appelle DALL-E 3 pour générer une image de logo
 */
async function generateLogoImage(apiKey: string): Promise<Buffer> {
  console.log('  \x1b[2mAppel DALL-E 3...\x1b[0m');

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: LOGO_PROMPT,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
      quality: 'standard',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DALL-E API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const b64 = data.data[0].b64_json;
  return Buffer.from(b64, 'base64');
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  return `${(bytes / 1024).toFixed(1)} Ko`;
}

/**
 * Redimensionne et compresse le logo en plusieurs tailles
 * - Logo principal : 512x512 WebP (qualité 80) → ~20-40 Ko
 * - PNG 180x180 pour Apple Touch Icon → ~10-20 Ko
 * - PNG 32x32 pour favicon → ~1-2 Ko
 * - PNG 16x16 pour favicon → ~0.5-1 Ko
 */
async function processLogo(originalBuffer: Buffer): Promise<{
  logoWebp: Buffer;
  png180: Buffer;
  png32: Buffer;
  png16: Buffer;
}> {
  console.log('  \x1b[2mRedimensionnement + compression...\x1b[0m');

  // Logo principal : WebP qualité 80, bien plus léger que PNG
  const logoWebp = await sharp(originalBuffer)
    .resize(512, 512, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();

  // Apple Touch Icon : PNG 180x180, palette optimisée
  const png180 = await sharp(originalBuffer)
    .resize(180, 180, { fit: 'cover' })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();

  // Favicon 32px
  const png32 = await sharp(originalBuffer)
    .resize(32, 32, { fit: 'cover' })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();

  // Favicon 16px
  const png16 = await sharp(originalBuffer)
    .resize(16, 16, { fit: 'cover' })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();

  console.log(`  \x1b[2mTailles : logo=${formatSize(logoWebp.length)}, 180px=${formatSize(png180.length)}, 32px=${formatSize(png32.length)}, 16px=${formatSize(png16.length)}\x1b[0m`);

  return { logoWebp, png180, png32, png16 };
}

/**
 * Crée un fichier .ico à partir des PNG 16x16 et 32x32
 */
async function createFavicon(png16: Buffer, png32: Buffer): Promise<Buffer> {
  console.log('  \x1b[2mCréation du favicon .ico...\x1b[0m');
  const ico = await pngToIco([png16, png32]);
  console.log(`  \x1b[2mFavicon : ${formatSize(ico.length)}\x1b[0m`);
  return ico;
}

/**
 * Upload un fichier sur Supabase Storage
 */
async function uploadToStorage(
  supabaseUrl: string,
  serviceRoleKey: string,
  bucket: string,
  filePath: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Vérifier/créer le bucket
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.name === bucket);
  if (!bucketExists) {
    await supabase.storage.createBucket(bucket, { public: true });
  }

  // Upload (upsert pour écraser si existe déjà)
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload error (${filePath}): ${error.message}`);
  }

  // Retourner l'URL publique
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Fonction principale : génère le logo, crée favicon, upload tout, retourne les URLs
 */
export async function generateAndUploadLogo(
  citySlug: string,
  options: {
    supabaseUrl: string;
    serviceRoleKey: string;
    openaiApiKey: string;
    dryRun?: boolean;
  }
): Promise<LogoResult | null> {
  const { supabaseUrl, serviceRoleKey, openaiApiKey, dryRun } = options;

  if (!openaiApiKey) {
    console.log('\x1b[33m⚠️\x1b[0m  OPENAI_API_KEY non définie — logo non généré');
    return null;
  }

  if (dryRun) {
    console.log('\x1b[34mℹ\x1b[0m [DRY RUN] Logo non généré');
    return null;
  }

  try {
    // 1. Générer l'image via DALL-E (1024x1024 PNG ~1-2 Mo)
    const originalBuffer = await generateLogoImage(openaiApiKey);
    console.log(`  \x1b[32m✓\x1b[0m Image brute générée (${formatSize(originalBuffer.length)})`);

    // 2. Redimensionner + comprimer (→ ~30 Ko au total)
    const { logoWebp, png180, png32, png16 } = await processLogo(originalBuffer);

    // 3. Créer le favicon .ico
    const faviconBuffer = await createFavicon(png16, png32);

    // 4. Upload sur Supabase Storage
    console.log('  \x1b[2mUpload sur Supabase Storage...\x1b[0m');
    const bucket = 'city-assets';

    const logoUrl = await uploadToStorage(
      supabaseUrl, serviceRoleKey, bucket,
      `${citySlug}/logo.webp`, logoWebp, 'image/webp'
    );

    const faviconUrl = await uploadToStorage(
      supabaseUrl, serviceRoleKey, bucket,
      `${citySlug}/favicon.ico`, faviconBuffer, 'image/x-icon'
    );

    // Apple Touch Icon
    await uploadToStorage(
      supabaseUrl, serviceRoleKey, bucket,
      `${citySlug}/apple-touch-icon.png`, png180, 'image/png'
    );

    console.log('  \x1b[32m✓\x1b[0m Logo uploadé : ' + logoUrl);
    console.log('  \x1b[32m✓\x1b[0m Favicon uploadé : ' + faviconUrl);

    return { logoUrl, faviconUrl };
  } catch (error) {
    console.error('\x1b[31m✗\x1b[0m Erreur génération logo:', error);
    return null;
  }
}
