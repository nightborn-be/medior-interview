CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(16) NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(160) NOT NULL,
	"language" varchar(2) NOT NULL,
	"phone" varchar(32),
	CONSTRAINT "customers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "erp_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_file" varchar(200) NOT NULL,
	"customer_code" varchar(16) NOT NULL,
	"sku_code" varchar(16) NOT NULL,
	"quantity" numeric(10, 3) NOT NULL,
	"requested_delivery_date" date NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"order_date" date NOT NULL,
	"channel" varchar(16) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_history_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"sku_code" varchar(16) NOT NULL,
	"quantity" numeric(10, 3) NOT NULL,
	"unit" varchar(16) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku_code" varchar(16) NOT NULL,
	"description_nl" varchar(200) NOT NULL,
	"description_fr" varchar(200) NOT NULL,
	"packaging" varchar(80) NOT NULL,
	"unit" varchar(16) NOT NULL,
	"category" varchar(80) NOT NULL,
	CONSTRAINT "products_sku_code_unique" UNIQUE("sku_code")
);
--> statement-breakpoint
ALTER TABLE "order_history" ADD CONSTRAINT "order_history_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_history_lines" ADD CONSTRAINT "order_history_lines_order_id_order_history_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order_history"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_history_lines" ADD CONSTRAINT "order_history_lines_sku_code_products_sku_code_fk" FOREIGN KEY ("sku_code") REFERENCES "public"."products"("sku_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_history_customer_idx" ON "order_history" USING btree ("customer_id","order_date");--> statement-breakpoint
CREATE INDEX "order_history_lines_order_idx" ON "order_history_lines" USING btree ("order_id");