import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { guestOrders } from './extra';

// ─────────────────────────────────────────────────────────────
// Sanal POS (Treps) ayarları — admin panelinden girilir.
// Tek merchant olduğumuz için provider başına tek satır tutulur.
// ─────────────────────────────────────────────────────────────
export const posSettings = pgTable('pos_settings', {
  provider: text('provider').primaryKey().default('treps'),
  isActive: boolean('is_active').notNull().default(false),
  apiBaseUrl: text('api_base_url').notNull().default('https://poapi.treps.tr'),
  apiUsername: text('api_username'),
  apiPassword: text('api_password'),
  merchantId: integer('merchant_id'),
  commissionPlanCode: text('commission_plan_code'),
  maxInstallment: integer('max_installment').notNull().default(1),
  minAmount: numeric('min_amount').notNull().default('1'),
  // 3D Secure hash doğrulaması ve HPP secure_key için
  secure3dKey: text('secure_3d_key'),
  // Webhook isteklerinin doğrulandığı paylaşılan gizli anahtar
  webhookSecret: text('webhook_secret'),
  lastTestedAt: timestamp('last_tested_at', { withTimezone: true }),
  lastTestResult: boolean('last_test_result'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────
// Satılan PDF raporları ve fiyatları — admin panelinden yönetilir.
// id, guest_orders.analysis_type ile aynı değerleri alır.
// ─────────────────────────────────────────────────────────────
export const reportProducts = pgTable('report_products', {
  id: text('id').primaryKey(), // 'astrology' | 'kabbalah' | 'human-design'
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price').notNull(),
  taxRate: numeric('tax_rate').notNull().default('20'),
  currency: text('currency').notNull().default('TRY'),
  isActive: boolean('is_active').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────
// POS işlemleri — her HPP oturumu için bir satır.
// external_order_id bizim ürettiğimiz referans, Treps tarafında da bu görünür.
// ─────────────────────────────────────────────────────────────
export const posTransactions = pgTable('pos_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  externalOrderId: text('external_order_id').notNull().unique(),
  guestOrderId: text('guest_order_id').references(() => guestOrders.id, {
    onDelete: 'set null',
  }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  productType: text('product_type').notNull(), // report_products.id
  amount: numeric('amount').notNull(),
  currency: text('currency').notNull().default('TRY'),
  installment: integer('installment').notNull().default(1),
  // created | pending | completed | failed | expired | refunded
  status: text('status').notNull().default('pending'),
  hppToken: text('hpp_token'),
  hppUrl: text('hpp_url'),
  trepsOrderId: text('treps_order_id'),
  trepsPaymentId: text('treps_payment_id'),
  trepsTransactionId: text('treps_transaction_id'),
  cardBrand: text('card_brand'),
  cardLastFour: text('card_last_four'),
  errorCode: text('error_code'),
  errorMessage: text('error_message'),
  payerName: text('payer_name'),
  payerEmail: text('payer_email'),
  payerPhone: text('payer_phone'),
  rawResponse: jsonb('raw_response'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────
// Faturalama ayarları — entegratör anahtarları ve satıcı künyesi.
// Anahtarlar boşsa fatura yalnızca dahili olarak (draft) kaydedilir.
// ─────────────────────────────────────────────────────────────
export const invoiceSettings = pgTable('invoice_settings', {
  provider: text('provider').primaryKey().default('birfatura'),
  isActive: boolean('is_active').notNull().default(false),
  testMode: boolean('test_mode').notNull().default(true),
  apiKey: text('api_key'),
  secretKey: text('secret_key'),
  integrationKey: text('integration_key'),
  // Satıcı (bizim firma) künyesi — UBL faturada zorunlu
  sellerTitle: text('seller_title'),
  sellerTaxNumber: text('seller_tax_number'),
  sellerTaxOffice: text('seller_tax_office'),
  sellerAddress: text('seller_address'),
  sellerDistrict: text('seller_district'),
  sellerCity: text('seller_city'),
  sellerEmail: text('seller_email'),
  sellerPhone: text('seller_phone'),
  invoiceSeries: text('invoice_series').notNull().default('EAR'),
  defaultTaxRate: numeric('default_tax_rate').notNull().default('20'),
  // Ödeme tamamlanınca otomatik fatura kesilsin mi
  autoIssue: boolean('auto_issue').notNull().default(true),
  lastTestedAt: timestamp('last_tested_at', { withTimezone: true }),
  lastTestResult: boolean('last_test_result'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────
// Kesilen faturalar. Entegratör kapalıyken de kayıt oluşur (status='draft').
// ─────────────────────────────────────────────────────────────
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  posTransactionId: uuid('pos_transaction_id').references(() => posTransactions.id, {
    onDelete: 'set null',
  }),
  guestOrderId: text('guest_order_id').references(() => guestOrders.id, {
    onDelete: 'set null',
  }),
  // Dahili sıra numarası (EAR2026000001). Entegratör kendi no'sunu atarsa
  // providerDocumentNo alanına yazılır.
  invoiceNumber: text('invoice_number').notNull().unique(),
  ettn: uuid('ettn').notNull().defaultRandom(),
  invoiceDate: timestamp('invoice_date', { withTimezone: true }).notNull().defaultNow(),
  buyerName: text('buyer_name').notNull(),
  buyerEmail: text('buyer_email'),
  buyerTaxNumber: text('buyer_tax_number'),
  buyerTaxOffice: text('buyer_tax_office'),
  buyerAddress: text('buyer_address'),
  buyerCity: text('buyer_city'),
  buyerDistrict: text('buyer_district'),
  subtotal: numeric('subtotal').notNull(),
  taxAmount: numeric('tax_amount').notNull(),
  total: numeric('total').notNull(),
  currency: text('currency').notNull().default('TRY'),
  // draft | sent | error | cancelled
  status: text('status').notNull().default('draft'),
  // EARSIV | EFATURA
  documentType: text('document_type').notNull().default('EARSIV'),
  provider: text('provider'),
  providerDocumentNo: text('provider_document_no'),
  providerUuid: text('provider_uuid'),
  pdfUrl: text('pdf_url'),
  errorMessage: text('error_message'),
  attemptCount: integer('attempt_count').notNull().default(0),
  rawResponse: jsonb('raw_response'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  quantity: numeric('quantity').notNull().default('1'),
  unitPrice: numeric('unit_price').notNull(), // KDV hariç birim fiyat
  taxRate: numeric('tax_rate').notNull().default('20'),
  lineTotal: numeric('line_total').notNull(), // KDV hariç satır toplamı
  taxAmount: numeric('tax_amount').notNull(),
  sort: integer('sort').notNull().default(0),
});

// Fatura numarası serisi için yıl bazlı sayaç. id = "<seri>-<yıl>" (ör. "EAR-2026").
export const invoiceCounters = pgTable('invoice_counters', {
  id: text('id').primaryKey(),
  series: text('series').notNull(),
  year: integer('year').notNull(),
  lastNumber: integer('last_number').notNull().default(0),
});
