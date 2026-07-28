import type { PrismaService } from '../prisma/prisma.service';

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function uniqueSlug(
  candidateBase: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = candidateBase || 'item';
  let candidate = base;
  let suffix = 2;

  while (await exists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function uniqueBlogSlug(
  prisma: PrismaService,
  title: string,
  explicit?: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(explicit?.trim() || title) || 'post';
  return uniqueSlug(base, async (candidate) => {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: candidate },
    });
    return Boolean(existing && existing.id !== excludeId);
  });
}

export async function uniqueCarSlug(
  prisma: PrismaService,
  name: string,
  explicit?: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(explicit?.trim() || name) || 'car';
  return uniqueSlug(base, async (candidate) => {
    const existing = await prisma.car.findUnique({
      where: { slug: candidate },
    });
    return Boolean(existing && existing.id !== excludeId);
  });
}
