import { config } from 'dotenv';
config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { reportProducts } from '../db/schema/payment';
import { eq } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log('Seeding cosmic-matrix product into report_products...');
  try {
    const existing = await db
      .select()
      .from(reportProducts)
      .where(eq(reportProducts.id, 'cosmic-matrix'));

    if (existing.length > 0) {
      console.log('cosmic-matrix product already exists. Updating...');
      await db
        .update(reportProducts)
        .set({
          name: '7Layers Kozmik Matris Sentez Raporu',
          description: 'Astroloji, Human Design, Kabala ve Kelt/Druid kök ağacı sentezi; 4 element, 4 alem, 13 gezegen teşhisi ve bitkisel aromaterapi frekanslarını içeren kapsamlı PDF rapor.',
          price: '1111',
          currency: 'TRY',
          taxRate: '20',
          isActive: true,
          sort: 5,
        })
        .where(eq(reportProducts.id, 'cosmic-matrix'));
    } else {
      console.log('Inserting cosmic-matrix product...');
      await db.insert(reportProducts).values({
        id: 'cosmic-matrix',
        name: '7Layers Kozmik Matris Sentez Raporu',
        description: 'Astroloji, Human Design, Kabala ve Kelt/Druid kök ağacı sentezi; 4 element, 4 alem, 13 gezegen teşhisi ve bitkisel aromaterapi frekanslarını içeren kapsamlı PDF rapor.',
        price: '1111',
        currency: 'TRY',
        taxRate: '20',
        isActive: true,
        sort: 5,
      });
    }
    console.log('Successfully seeded cosmic-matrix product with price 1111 TL!');
  } catch (err) {
    console.error('Error seeding product:', err);
  } finally {
    await pool.end();
  }
}

main();
