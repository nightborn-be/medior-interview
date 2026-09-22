import {
  date,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 16 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 160 }).notNull(),
  language: varchar("language", { length: 2 }).notNull(),
  phone: varchar("phone", { length: 32 }),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  skuCode: varchar("sku_code", { length: 16 }).notNull().unique(),
  descriptionNl: varchar("description_nl", { length: 200 }).notNull(),
  descriptionFr: varchar("description_fr", { length: 200 }).notNull(),
  packaging: varchar("packaging", { length: 80 }).notNull(),
  unit: varchar("unit", { length: 16 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
});

export const orderHistory = pgTable(
  "order_history",
  {
    id: serial("id").primaryKey(),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    orderDate: date("order_date").notNull(),
    channel: varchar("channel", { length: 16 }).notNull(),
  },
  (table) => [index("order_history_customer_idx").on(table.customerId, table.orderDate)],
);

export const orderHistoryLines = pgTable(
  "order_history_lines",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orderHistory.id, { onDelete: "cascade" }),
    skuCode: varchar("sku_code", { length: 16 })
      .notNull()
      .references(() => products.skuCode),
    quantity: numeric("quantity", { precision: 10, scale: 3 }).notNull(),
    unit: varchar("unit", { length: 16 }).notNull(),
  },
  (table) => [index("order_history_lines_order_idx").on(table.orderId)],
);

/** Lignes avalees par le job d'import de l'ERP (voir erp-import-spec.md, en/ ou fr/). */
export const erpOrders = pgTable("erp_orders", {
  id: serial("id").primaryKey(),
  sourceFile: varchar("source_file", { length: 200 }).notNull(),
  customerCode: varchar("customer_code", { length: 16 }).notNull(),
  skuCode: varchar("sku_code", { length: 16 }).notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 3 }).notNull(),
  requestedDeliveryDate: date("requested_delivery_date").notNull(),
  importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
});
