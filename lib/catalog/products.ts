import { cache } from "react";

export type Product = {
  id: string;
  nombre: string;
  precio: string;
  categoria: string;
  imagen: string;
};

const fallbackProducts: Product[] = [
  {
    id: "vestido-aura",
    nombre: "Vestido Aura",
    precio: "$120.000",
    categoria: "Vestidos",
    imagen: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  },
  {
    id: "blusa-sol",
    nombre: "Blusa Sol",
    precio: "$85.000",
    categoria: "Blusas",
    imagen: "https://res.cloudinary.com/demo/image/upload/woman.jpg",
  },
  {
    id: "conjunto-nube",
    nombre: "Conjunto Nube",
    precio: "$160.000",
    categoria: "Conjuntos",
    imagen: "https://res.cloudinary.com/demo/image/upload/dog.jpg",
  },
];

function getSheetUrl() {
  const directUrl = process.env.GOOGLE_SHEET_CSV_URL;

  if (directUrl) {
    return directUrl;
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetGid = process.env.GOOGLE_SHEET_GID ?? "0";

  if (!sheetId) {
    return null;
  }

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheetGid}`;
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values.map((value) => value.replace(/\r/g, ""));
}

function parseCsv(csvText: string) {
  const lines = csvText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) =>
    header.toLowerCase().replace(/\s+/g, ""),
  );

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    );

    const nombre = row.nombre ?? "";
    const precio = row.precio ?? "";
    const categoria = row.categoria ?? "";
    const imagen =
      row.imagen ??
      row.image ??
      row.imageurl ??
      row.cloudinaryurl ??
      row.cloudinary ??
      "";

    return {
      id:
        row.id ??
        `${nombre}-${categoria}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      nombre,
      precio,
      categoria,
      imagen,
    };
  });
}

function isValidProduct(product: Product) {
  return Boolean(
    product.nombre && product.precio && product.categoria && product.imagen,
  );
}

export const getProducts = cache(async () => {
  const sheetUrl = getSheetUrl();

  if (!sheetUrl) {
    return {
      products: fallbackProducts,
      source: "fallback" as const,
    };
  }

  try {
    const response = await fetch(sheetUrl, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status}`);
    }

    const csvText = await response.text();
    const products = parseCsv(csvText).filter(isValidProduct);

    if (products.length === 0) {
      return {
        products: fallbackProducts,
        source: "fallback" as const,
      };
    }

    return {
      products,
      source: "google-sheets" as const,
    };
  } catch {
    return {
      products: fallbackProducts,
      source: "fallback" as const,
    };
  }
});
