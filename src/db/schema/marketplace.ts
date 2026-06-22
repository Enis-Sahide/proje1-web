import { pgTable, text, integer, numeric, boolean } from 'drizzle-orm/pg-core';

export const productCategories = pgTable('product_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
});

export const vendors = pgTable('vendors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  avatar: text('avatar'),
  rating: numeric('rating'),
  isFeatured: boolean('is_featured').notNull().default(false),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').references(() => vendors.id),
  categoryId: text('category_id').references(() => productCategories.id),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price'),
  image: text('image'),
  stock: integer('stock').notNull().default(0),
});
