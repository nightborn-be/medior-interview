import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";

import { db, schema, sql } from "../lib/db";

/**
 * Date de reference du jeu de donnees : les emails de data/inbox/ sont dates
 * de ce jour, et l'historique de commandes couvre les 6 mois qui precedent.
 */
const REFERENCE_DATE = "2026-08-27";

// --------------------------------------------------------------- utilitaires

/** Generateur pseudo-aleatoire deterministe (mulberry32). */
function makeRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < content.length; i += 1) {
    const c = content[i];
    if (quoted) {
      if (c === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || r[0] !== "");
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Recule jusqu'au jour de semaine demande (1 = lundi ... 5 = vendredi). */
function previousWeekday(iso: string, weekday: number): string {
  let d = iso;
  for (let i = 0; i < 8; i += 1) {
    const day = new Date(`${d}T00:00:00Z`).getUTCDay();
    if (day === weekday) return d;
    d = addDays(d, -1);
  }
  return d;
}

// ------------------------------------------------------------------ clients

type Profile = "bakkerij" | "sandwicherie" | "hotel" | "cantine" | "traiteur" | "snack";

type CustomerSeed = {
  code: string;
  name: string;
  email: string;
  language: "nl" | "fr";
  phone: string;
  profile: Profile;
  /** Nombre de commandes par mois, approximatif. */
  cadence: number;
};

const CUSTOMERS: CustomerSeed[] = [
  // clients presents dans data/inbox/
  { code: "K10014", name: "Bakkerij Moens", email: "bakkerij.moens@telenet.be", language: "nl", phone: "053 21 44 07", profile: "bakkerij", cadence: 4 },
  { code: "K10027", name: "Sandwicherie Le Pain", email: "sandwicherie.lepain@gmail.com", language: "fr", phone: "067 33 18 92", profile: "sandwicherie", cadence: 4 },
  { code: "K10031", name: "Hotel du Lac", email: "economat@hoteldulac.be", language: "fr", phone: "069 84 22 10", profile: "hotel", cadence: 3 },
  { code: "K10042", name: "Broodjeszaak Vermeersch", email: "info@vermeersch-broodjes.be", language: "nl", phone: "050 34 77 21", profile: "sandwicherie", cadence: 4 },
  { code: "K10056", name: "Cantine Saint-Joseph", email: "cuisine@saintjoseph-braine.be", language: "fr", phone: "02 384 66 12", profile: "cantine", cadence: 2 },
  { code: "K10063", name: "Traiteur Dupont", email: "commandes@traiteurdupont.be", language: "fr", phone: "02 384 11 07", profile: "traiteur", cadence: 3 },
  { code: "K10078", name: "Bakkerij Claes", email: "bakkerijclaes@skynet.be", language: "nl", phone: "014 58 30 45", profile: "bakkerij", cadence: 4 },
  { code: "K10085", name: "Snackbar Mertens", email: "snackmertens@hotmail.com", language: "nl", phone: "011 27 66 39", profile: "snack", cadence: 3 },

  // reste du portefeuille
  { code: "K10102", name: "Bakkerij De Meyer", email: "info@bakkerijdemeyer.be", language: "nl", phone: "052 41 09 88", profile: "bakkerij", cadence: 4 },
  { code: "K10108", name: "Boulangerie Lambert", email: "contact@boulangerie-lambert.be", language: "fr", phone: "081 22 74 15", profile: "bakkerij", cadence: 3 },
  { code: "K10115", name: "Bakkerij Van Hecke", email: "bestellingen@vanhecke.be", language: "nl", phone: "09 227 61 30", profile: "bakkerij", cadence: 4 },
  { code: "K10121", name: "Patisserie Verlinden", email: "shop@verlinden-patisserie.be", language: "nl", phone: "015 43 87 20", profile: "bakkerij", cadence: 2 },
  { code: "K10130", name: "Boulangerie Le Fournil", email: "lefournil@skynet.be", language: "fr", phone: "071 35 12 66", profile: "bakkerij", cadence: 3 },
  { code: "K10137", name: "Bakkerij Peeters", email: "bakkerij.peeters@telenet.be", language: "nl", phone: "014 41 55 09", profile: "bakkerij", cadence: 3 },
  { code: "K10144", name: "Sandwicherie Chez Nathalie", email: "cheznathalie@gmail.com", language: "fr", phone: "04 223 91 47", profile: "sandwicherie", cadence: 4 },
  { code: "K10151", name: "Broodjesbar 't Hoekske", email: "hoekske@telenet.be", language: "nl", phone: "03 231 08 74", profile: "sandwicherie", cadence: 4 },
  { code: "K10158", name: "Sandwicherie du Marche", email: "sandwicherie.marche@gmail.com", language: "fr", phone: "065 31 22 88", profile: "sandwicherie", cadence: 3 },
  { code: "K10164", name: "Broodjeszaak Panorama", email: "info@panorama-broodjes.be", language: "nl", phone: "050 61 44 12", profile: "sandwicherie", cadence: 3 },
  { code: "K10171", name: "Lunchbar Het Anker", email: "hetanker@telenet.be", language: "nl", phone: "011 51 77 40", profile: "sandwicherie", cadence: 3 },
  { code: "K10178", name: "Hotel Ter Duinen", email: "keuken@terduinen.be", language: "nl", phone: "058 51 20 33", profile: "hotel", cadence: 3 },
  { code: "K10185", name: "Hotel de la Gare", email: "reception@hoteldelagare.be", language: "fr", phone: "084 31 66 21", profile: "hotel", cadence: 2 },
  { code: "K10192", name: "Hotel Ardennes", email: "achats@hotel-ardennes.be", language: "fr", phone: "061 22 08 55", profile: "hotel", cadence: 2 },
  { code: "K10199", name: "Hotel Zeezicht", email: "info@zeezicht-hotel.be", language: "nl", phone: "059 70 12 90", profile: "hotel", cadence: 3 },
  { code: "K10206", name: "Auberge du Moulin", email: "cuisine@aubergedumoulin.be", language: "fr", phone: "060 41 33 27", profile: "hotel", cadence: 2 },
  { code: "K10213", name: "Cantine Sint-Lucas", email: "keuken@sintlucas-gent.be", language: "nl", phone: "09 224 18 05", profile: "cantine", cadence: 2 },
  { code: "K10220", name: "College Saint-Michel", email: "cuisine@college-saintmichel.be", language: "fr", phone: "02 736 55 41", profile: "cantine", cadence: 2 },
  { code: "K10227", name: "Woonzorgcentrum De Linde", email: "keuken@wzcdelinde.be", language: "nl", phone: "013 55 21 76", profile: "cantine", cadence: 3 },
  { code: "K10234", name: "Home Les Tilleuls", email: "cuisine@lestilleuls.be", language: "fr", phone: "071 44 90 12", profile: "cantine", cadence: 3 },
  { code: "K10241", name: "Bedrijfsrestaurant Sofrex", email: "catering@sofrex.be", language: "nl", phone: "03 646 71 22", profile: "cantine", cadence: 2 },
  { code: "K10248", name: "Traiteur Vanden Berghe", email: "orders@vandenberghe-traiteur.be", language: "nl", phone: "056 22 41 09", profile: "traiteur", cadence: 3 },
  { code: "K10255", name: "Traiteur Le Gourmet", email: "info@legourmet-traiteur.be", language: "fr", phone: "010 24 66 38", profile: "traiteur", cadence: 3 },
  { code: "K10262", name: "Feestzaal Ter Elst", email: "keuken@terelst.be", language: "nl", phone: "03 455 12 87", profile: "traiteur", cadence: 2 },
  { code: "K10269", name: "Traiteur Bocuse & Fils", email: "commandes@bocusefils.be", language: "fr", phone: "085 21 44 90", profile: "traiteur", cadence: 2 },
  { code: "K10276", name: "Frituur 't Pleintje", email: "pleintje@telenet.be", language: "nl", phone: "016 22 74 51", profile: "snack", cadence: 4 },
  { code: "K10283", name: "Friterie du Centre", email: "friteriecentre@gmail.com", language: "fr", phone: "071 30 88 14", profile: "snack", cadence: 4 },
  { code: "K10290", name: "Snackbar De Kaai", email: "dekaai@telenet.be", language: "nl", phone: "03 219 40 66", profile: "snack", cadence: 3 },
  { code: "K10297", name: "Friterie Chez Marcel", email: "chezmarcel@skynet.be", language: "fr", phone: "063 22 15 40", profile: "snack", cadence: 3 },
  { code: "K10304", name: "Pizzeria Bella Roma", email: "bellaroma@telenet.be", language: "nl", phone: "015 20 61 33", profile: "snack", cadence: 3 },
  { code: "K10311", name: "Brasserie De Markt", email: "keuken@brasseriedemarkt.be", language: "nl", phone: "053 70 22 18", profile: "hotel", cadence: 3 },
  { code: "K10318", name: "Brasserie Le Chalet", email: "lechalet@brasserie.be", language: "fr", phone: "080 33 71 20", profile: "hotel", cadence: 2 },
];

// -------------------------------------------------------- paniers habituels

type BasketItem = { sku: string; min: number; max: number; unit: string };

const BASKETS: Record<Profile, BasketItem[]> = {
  bakkerij: [
    { sku: "257764", min: 4, max: 12, unit: "kg" },
    { sku: "180740", min: 2, max: 6, unit: "kg" },
    { sku: "997140", min: 2, max: 8, unit: "kg" },
    { sku: "840525", min: 1, max: 5, unit: "kg" },
    { sku: "615441", min: 1, max: 4, unit: "kg" },
    { sku: "756037", min: 1, max: 6, unit: "g" },
    { sku: "382772", min: 1, max: 4, unit: "kg" },
    { sku: "277342", min: 1, max: 3, unit: "kg" },
    { sku: "558356", min: 1, max: 3, unit: "kg" },
    { sku: "245394", min: 1, max: 4, unit: "piece" },
    { sku: "928430", min: 1, max: 2, unit: "kg" },
    { sku: "600577", min: 6, max: 24, unit: "L" },
  ],
  sandwicherie: [
    { sku: "839108", min: 2, max: 6, unit: "kg" },
    { sku: "437245", min: 1, max: 4, unit: "L" },
    { sku: "161752", min: 2, max: 6, unit: "kg" },
    { sku: "233947", min: 1, max: 4, unit: "kg" },
    { sku: "442575", min: 1, max: 4, unit: "kg" },
    { sku: "142586", min: 1, max: 5, unit: "carton" },
    { sku: "739177", min: 1, max: 3, unit: "piece" },
    { sku: "340845", min: 1, max: 3, unit: "piece" },
    { sku: "921018", min: 1, max: 3, unit: "kg" },
    { sku: "756777", min: 1, max: 3, unit: "kg" },
  ],
  hotel: [
    { sku: "766566", min: 2, max: 6, unit: "L" },
    { sku: "615386", min: 5, max: 20, unit: "kg" },
    { sku: "572756", min: 3, max: 12, unit: "piece" },
    { sku: "437245", min: 1, max: 3, unit: "L" },
    { sku: "179231", min: 2, max: 8, unit: "kg" },
    { sku: "600577", min: 6, max: 24, unit: "L" },
    { sku: "328650", min: 4, max: 12, unit: "L" },
    { sku: "839116", min: 2, max: 8, unit: "piece" },
    { sku: "657119", min: 1, max: 4, unit: "kg" },
    { sku: "833530", min: 6, max: 24, unit: "L" },
  ],
  cantine: [
    { sku: "361556", min: 8, max: 30, unit: "kg" },
    { sku: "353415", min: 10, max: 30, unit: "kg" },
    { sku: "988412", min: 4, max: 12, unit: "piece" },
    { sku: "820934", min: 2, max: 8, unit: "kg" },
    { sku: "933093", min: 4, max: 12, unit: "piece" },
    { sku: "121663", min: 12, max: 40, unit: "L" },
    { sku: "615386", min: 5, max: 25, unit: "kg" },
    { sku: "930869", min: 1, max: 4, unit: "kg" },
  ],
  traiteur: [
    { sku: "257764", min: 2, max: 8, unit: "kg" },
    { sku: "615441", min: 2, max: 8, unit: "kg" },
    { sku: "328650", min: 6, max: 24, unit: "L" },
    { sku: "839116", min: 2, max: 8, unit: "piece" },
    { sku: "277342", min: 1, max: 4, unit: "kg" },
    { sku: "678360", min: 1, max: 4, unit: "piece" },
    { sku: "554010", min: 1, max: 3, unit: "kg" },
    { sku: "925812", min: 1, max: 4, unit: "kg" },
  ],
  snack: [
    { sku: "361556", min: 4, max: 16, unit: "kg" },
    { sku: "437245", min: 1, max: 4, unit: "L" },
    { sku: "770964", min: 1, max: 3, unit: "L" },
    { sku: "259609", min: 1, max: 4, unit: "bac" },
    { sku: "978826", min: 1, max: 2, unit: "L" },
    { sku: "467650", min: 1, max: 3, unit: "kg" },
    { sku: "107794", min: 2, max: 6, unit: "kg" },
    { sku: "966006", min: 1, max: 3, unit: "bac" },
  ],
};

const CHANNELS = ["email", "email", "email", "phone", "pdf", "whatsapp"];

// ---------------------------------------------------------------------- run

async function main() {
  const csvPath = path.join(process.cwd(), "data", "catalog.csv");
  const rows = parseCsv(readFileSync(csvPath, "utf-8"));
  const [header, ...body] = rows;
  if (header[0] !== "sku_code") {
    throw new Error(`En-tete inattendu dans ${csvPath}`);
  }

  console.log("Nettoyage des tables...");
  await sql.unsafe(
    "truncate table erp_orders, order_history_lines, order_history, products, customers restart identity cascade",
  );

  console.log(`Insertion de ${body.length} produits...`);
  await db.insert(schema.products).values(
    body.map((r) => ({
      skuCode: r[0],
      descriptionNl: r[1],
      descriptionFr: r[2],
      packaging: r[3],
      unit: r[4],
      category: r[5],
    })),
  );

  const knownSkus = new Set(body.map((r) => r[0]));
  for (const [profile, items] of Object.entries(BASKETS)) {
    for (const item of items) {
      if (!knownSkus.has(item.sku)) {
        throw new Error(`Panier ${profile} : SKU inconnu ${item.sku}`);
      }
    }
  }

  console.log(`Insertion de ${CUSTOMERS.length} clients...`);
  const insertedCustomers = await db
    .insert(schema.customers)
    .values(
      CUSTOMERS.map((c) => ({
        code: c.code,
        name: c.name,
        email: c.email,
        language: c.language,
        phone: c.phone,
      })),
    )
    .returning({ id: schema.customers.id, code: schema.customers.code });

  const customerIdByCode = new Map(insertedCustomers.map((c) => [c.code, c.id]));

  console.log("Generation de 6 mois d'historique de commandes...");
  type PendingOrder = { customerId: number; orderDate: string; channel: string; lines: BasketItem[] };
  const orders: PendingOrder[] = [];

  const random = makeRandom(20260827);

  for (const customer of CUSTOMERS) {
    const customerId = customerIdByCode.get(customer.code)!;
    const basket = BASKETS[customer.profile];
    // jour de commande habituel du client
    const usualWeekday = 1 + Math.floor(random() * 5);

    for (let week = 26; week >= 1; week -= 1) {
      const weekAnchor = addDays(REFERENCE_DATE, -7 * week);
      const ordersThisWeek = customer.cadence >= 4 ? 1 : random() < customer.cadence / 4 ? 1 : 0;
      if (ordersThisWeek === 0) continue;

      const shift = Math.floor(random() * 3) - 1;
      const orderDate = previousWeekday(addDays(weekAnchor, shift), usualWeekday);
      const channel = CHANNELS[Math.floor(random() * CHANNELS.length)];

      const lines = basket.filter(() => random() < 0.72);
      if (lines.length === 0) lines.push(basket[Math.floor(random() * basket.length)]);

      orders.push({ customerId, orderDate, channel, lines });
    }
  }

  // Commandes de reference citees par les emails de data/inbox/.
  const moensId = customerIdByCode.get("K10014")!;
  const lepainId = customerIdByCode.get("K10027")!;
  const moensLastWeek = addDays(REFERENCE_DATE, -7);
  const lepainMonday = previousWeekday(REFERENCE_DATE, 1);

  const filtered = orders.filter(
    (o) =>
      !(o.customerId === moensId && o.orderDate === moensLastWeek) &&
      !(o.customerId === lepainId && o.orderDate === lepainMonday),
  );

  filtered.push({
    customerId: moensId,
    orderDate: moensLastWeek,
    channel: "email",
    lines: [
      { sku: "257764", min: 2, max: 2, unit: "kg" },
      { sku: "840525", min: 5, max: 5, unit: "kg" },
      { sku: "615441", min: 1, max: 1, unit: "kg" },
      { sku: "756037", min: 2, max: 2, unit: "g" },
      { sku: "245394", min: 2, max: 2, unit: "piece" },
    ],
  });

  filtered.push({
    customerId: lepainId,
    orderDate: lepainMonday,
    channel: "email",
    lines: [
      { sku: "839108", min: 3, max: 3, unit: "kg" },
      { sku: "233947", min: 2, max: 2, unit: "kg" },
      { sku: "442575", min: 2, max: 2, unit: "kg" },
      { sku: "142586", min: 2, max: 2, unit: "carton" },
      { sku: "739177", min: 1, max: 1, unit: "piece" },
      { sku: "921018", min: 1, max: 1, unit: "kg" },
    ],
  });

  filtered.sort((a, b) => (a.orderDate < b.orderDate ? -1 : a.orderDate > b.orderDate ? 1 : 0));

  const insertedOrders = await db
    .insert(schema.orderHistory)
    .values(
      filtered.map((o) => ({
        customerId: o.customerId,
        orderDate: o.orderDate,
        channel: o.channel,
      })),
    )
    .returning({ id: schema.orderHistory.id });

  const lineValues = filtered.flatMap((o, i) =>
    o.lines.map((line) => {
      const span = line.max - line.min;
      const quantity = line.min + (span === 0 ? 0 : Math.floor(random() * (span + 1)));
      return {
        orderId: insertedOrders[i].id,
        skuCode: line.sku,
        quantity: quantity.toFixed(3),
        unit: line.unit,
      };
    }),
  );

  for (let i = 0; i < lineValues.length; i += 500) {
    await db.insert(schema.orderHistoryLines).values(lineValues.slice(i, i + 500));
  }

  console.log(
    `Termine : ${body.length} produits, ${CUSTOMERS.length} clients, ` +
      `${insertedOrders.length} commandes, ${lineValues.length} lignes.`,
  );
  await sql.end();
}

main().catch(async (error) => {
  console.error(error);
  await sql.end();
  process.exit(1);
});
