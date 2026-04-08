import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

async function getContent() {
  const { rows } = await query('SELECT * FROM content WHERE id=1');
  return rows[0];
}

export async function GET() {
  const content = await getContent();
  return NextResponse.json({
    content: {
      homepage: { heroText: content.homepage_hero_text, heroImage: content.homepage_hero_image },
      about: { text: content.about_text, image: content.about_image },
    },
  });
}

export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const homepage = body.homepage || {};
  const about = body.about || {};

  const { rows } = await query(
    `UPDATE content SET homepage_hero_text=$1, homepage_hero_image=$2, about_text=$3, about_image=$4 WHERE id=1 RETURNING *`,
    [homepage.heroText ?? '', homepage.heroImage ?? '', about.text ?? '', about.image ?? '']
  );

  const updated = rows[0];
  return NextResponse.json({
    content: {
      homepage: { heroText: updated.homepage_hero_text, heroImage: updated.homepage_hero_image },
      about: { text: updated.about_text, image: updated.about_image },
    },
  });
}
