"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/components/product-card";
import type { Product } from "@/lib/products";

type CatalogBrowserProps = {
  products: Product[];
};

type CartItem = Product & {
  quantity: number;
};

type SortOption = "nombre-asc" | "precio-asc" | "precio-desc" | "categoria-asc";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "57TUNUMERO";
const CART_STORAGE_KEY = "eliza-cart";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parsePrice(value: string) {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}\b)/g, "");
  const withDecimalPoint = normalized.replace(",", ".");
  const parsed = Number(withDecimalPoint);

  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function getProductMessage(product: Product) {
  return `Hola Eliza! Me interesa esta prenda: ${product.nombre} - ${product.precio}. \u00BFA\u00FAn est\u00E1 disponible?`;
}

function getProductWhatsappUrl(product: Product) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    getProductMessage(product),
  )}`;
}

function getCartWhatsappUrl(items: CartItem[], total: number) {
  const itemLines = items.map(
    (item) => `\u2022 ${item.nombre} - ${item.precio} x ${item.quantity}`,
  );
  const message = `Hola Eliza! Me interesan estas prendas:\n${itemLines.join(
    "\n",
  )}\n\nTotal: ${formatPrice(total)}`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function CatalogBrowser({ products }: CatalogBrowserProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sortBy, setSortBy] = useState<SortOption>("nombre-asc");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          setCart(JSON.parse(storedCart) as CartItem[]);
        }
      } catch {
        setCart([]);
      }

      hasMountedRef.current = true;
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!selectedProduct && !isCartOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [isCartOpen, selectedProduct]);

  const categories = [
    "Todas",
    ...Array.from(new Set(products.map((product) => product.categoria))).sort(
      (left, right) => left.localeCompare(right, "es"),
    ),
  ];

  const filteredProducts = products
    .filter((product) => {
      if (
        selectedCategory !== "Todas" &&
        product.categoria !== selectedCategory
      ) {
        return false;
      }

      if (!deferredSearch.trim()) {
        return true;
      }

      return normalizeText(product.nombre).includes(
        normalizeText(deferredSearch),
      );
    })
    .sort((left, right) => {
      switch (sortBy) {
        case "precio-asc":
          return parsePrice(left.precio) - parsePrice(right.precio);
        case "precio-desc":
          return parsePrice(right.precio) - parsePrice(left.precio);
        case "categoria-asc":
          return left.categoria.localeCompare(right.categoria, "es");
        case "nombre-asc":
        default:
          return left.nombre.localeCompare(right.nombre, "es");
      }
    });

  const cartItemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + parsePrice(item.precio) * item.quantity,
        0,
      ),
    [cart],
  );

  function addToCart(product: Product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }

  function updateQuantity(productId: string, nextQuantity: number) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: nextQuantity } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  return (
    <>
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="inline-flex items-center gap-3 rounded-full bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-[color:var(--surface)] shadow-[0_16px_34px_rgba(111,3,3,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--accent)]"
        >
          <CartIcon />
          Carrito
          <span className="rounded-full bg-white/14 px-2.5 py-1 text-xs">
            {cartItemCount}
          </span>
        </button>
      </div>

      <section className="mt-10 grid gap-4 rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-5 shadow-[var(--shadow)] backdrop-blur sm:grid-cols-2 xl:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">
            Buscar
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre"
            className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-4 py-3 text-sm text-[color:var(--ink)] outline-none transition duration-300 focus:border-[color:var(--accent)] focus:shadow-[0_0_0_4px_rgba(164,90,61,0.12)]"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">
            Categoria
          </span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-4 py-3 text-sm text-[color:var(--ink)] outline-none transition duration-300 focus:border-[color:var(--accent)] focus:shadow-[0_0_0_4px_rgba(164,90,61,0.12)]"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">
            Ordenar por
          </span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-4 py-3 text-sm text-[color:var(--ink)] outline-none transition duration-300 focus:border-[color:var(--accent)] focus:shadow-[0_0_0_4px_rgba(164,90,61,0.12)]"
          >
            <option value="nombre-asc">Nombre</option>
            <option value="categoria-asc">Categoria</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </label>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-4 py-2 text-sm text-[color:var(--ink)]/78">
          {filteredProducts.length} producto
          {filteredProducts.length === 1 ? "" : "s"} encontrado
          {filteredProducts.length === 1 ? "" : "s"}
        </span>
        {selectedCategory !== "Todas" ? (
          <span className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-medium text-[color:var(--surface)]">
            {selectedCategory}
          </span>
        ) : null}
        {search.trim() ? (
          <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-4 py-2 text-sm text-[color:var(--accent)]">
            {search}
          </span>
        ) : null}
      </div>

      <AnimatePresence>
        {filteredProducts.length === 0 ? (
          <section className="mt-8 rounded-[2rem] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--panel-strong)] px-6 py-12 text-center shadow-[0_10px_30px_rgba(7,7,5,0.04)]">
            <h2 className="text-2xl font-semibold text-[color:var(--primary)]">
              No encontramos productos
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--ink)]/75">
              Prueba otra categoria, cambia el orden o busca con otro nombre.
            </p>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                nombre={product.nombre}
                precio={product.precio}
                categoria={product.categoria}
                imagen={product.imagen}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct ? (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(7,7,5,0.52)] px-4 py-8 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { duration: 0.18 },
              }}
              exit={{
                opacity: 0,
                scale: 0.98,
                transition: { duration: 0.14 },
              }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel-strong)] shadow-[0_30px_90px_rgba(7,7,5,0.22)]"
            >
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--panel)] text-[color:var(--primary)] shadow-[0_8px_20px_rgba(7,7,5,0.12)] transition hover:bg-white"
                aria-label="Cerrar modal"
              >
                <CloseIcon />
              </button>

              <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <motion.div
                  layoutId={`image-${selectedProduct.id}`}
                  className="relative aspect-[4/5] bg-[color:var(--surface-strong)]"
                >
                  <Image
                    src={selectedProduct.imagen}
                    alt={selectedProduct.nombre}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </motion.div>

                <div className="flex min-w-0 flex-col justify-between p-6 sm:p-8">
                  <div>
                    <motion.p
                      layoutId={`categoria-${selectedProduct.id}`}
                      className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--accent)]"
                    >
                      {selectedProduct.categoria}
                    </motion.p>
                    <motion.h2
                      layoutId={`nombre-${selectedProduct.id}`}
                      className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[color:var(--primary)]"
                    >
                      {selectedProduct.nombre}
                    </motion.h2>
                    <motion.p
                      layoutId={`precio-${selectedProduct.id}`}
                      className="mt-4 text-2xl font-medium text-[color:var(--ink)]"
                    >
                      {selectedProduct.precio}
                    </motion.p>
                    <p className="mt-6 text-sm leading-7 text-[color:var(--ink)]/72">
                      Explora la prenda con una vista ampliada y decide si
                      quieres preguntar directamente por disponibilidad o
                      guardarla en el carrito para consultarlo todo junto.
                    </p>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <a
                      href={getProductWhatsappUrl(selectedProduct)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-[color:var(--surface)] transition hover:brightness-110"
                    >
                      <WhatsappIcon />
                      Preguntar por la prenda
                    </a>
                    <button
                      type="button"
                      onClick={() => addToCart(selectedProduct)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-[color:var(--surface)] transition hover:bg-[color:var(--accent)]"
                    >
                      <CartIcon />
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-[rgba(7,7,5,0.45)] backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              aria-label="Cerrar carrito"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0, transition: { duration: 0.3 } }}
              exit={{ x: "100%", transition: { duration: 0.22 } }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[color:var(--line)] bg-[color:var(--panel-strong)] shadow-[-18px_0_40px_rgba(7,7,5,0.12)]"
            >
              <div className="flex items-center justify-between border-b border-[color:var(--line)] px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)]">
                    Eliza
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[color:var(--primary)]">
                    Carrito
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--primary)] transition hover:bg-[color:var(--panel)]"
                  aria-label="Cerrar carrito"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                {cart.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--panel)] px-5 py-8 text-center">
                    <p className="text-lg font-semibold text-[color:var(--primary)]">
                      Tu carrito est\u00E1 vac\u00EDo
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--ink)]/72">
                      Agrega prendas desde el catalogo y luego pregunta por todo
                      en un solo mensaje.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/70 p-4"
                    >
                      <div className="flex gap-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.1rem] bg-[color:var(--surface-strong)]">
                          <Image
                            src={item.imagen}
                            alt={item.nombre}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">
                            {item.categoria}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold text-[color:var(--primary)]">
                            {item.nombre}
                          </h3>
                          <p className="mt-1 text-sm text-[color:var(--ink)]/78">
                            {item.precio}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-[color:var(--line)] bg-[color:var(--panel)]">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-3 py-2 text-[color:var(--primary)]"
                            aria-label={`Disminuir ${item.nombre}`}
                          >
                            -
                          </button>
                          <span className="px-2 text-sm font-semibold text-[color:var(--ink)]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-3 py-2 text-[color:var(--primary)]"
                            aria-label={`Aumentar ${item.nombre}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 0)}
                          className="text-sm font-semibold text-[color:var(--accent)]"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-[color:var(--line)] px-6 py-5">
                <div className="flex items-center justify-between text-base">
                  <span className="font-medium text-[color:var(--ink)]/72">
                    Total
                  </span>
                  <span className="text-2xl font-semibold text-[color:var(--primary)]">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <a
                  href={
                    cart.length > 0
                      ? getCartWhatsappUrl(cart, cartTotal)
                      : undefined
                  }
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={cart.length === 0}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                    cart.length === 0
                      ? "cursor-not-allowed bg-[color:var(--line)] text-[color:var(--ink)]/45"
                      : "bg-[color:var(--primary)] text-[color:var(--surface)] hover:bg-[color:var(--accent)]"
                  }`}
                  onClick={(event) => {
                    if (cart.length === 0) {
                      event.preventDefault();
                    }
                  }}
                >
                  <WhatsappIcon />
                  Preguntar por todo
                </a>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.2 10.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H7.2" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M19.1 4.9A9.88 9.88 0 0 0 12.06 2C6.56 2 2.1 6.47 2.1 11.96c0 1.76.46 3.47 1.33 4.98L2 22l5.2-1.36a9.9 9.9 0 0 0 4.77 1.22h.01c5.49 0 9.96-4.47 9.96-9.96a9.9 9.9 0 0 0-2.84-7.01Zm-7.13 15.3h-.01a8.24 8.24 0 0 1-4.2-1.15l-.3-.18-3.08.8.82-3-.2-.31A8.28 8.28 0 0 1 3.73 12c0-4.55 3.7-8.25 8.25-8.25 2.2 0 4.27.86 5.82 2.42A8.18 8.18 0 0 1 20.2 12c0 4.55-3.7 8.25-8.24 8.25Zm4.53-6.17c-.25-.13-1.47-.73-1.7-.81-.23-.09-.4-.13-.56.12-.17.25-.65.81-.8.98-.15.17-.3.19-.55.07-.25-.13-1.07-.39-2.03-1.24-.75-.66-1.25-1.47-1.4-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.38-.43.13-.15.17-.25.25-.42.09-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.45.06-.69.32-.23.25-.88.86-.88 2.1s.9 2.44 1.02 2.61c.13.17 1.78 2.72 4.3 3.81.6.26 1.08.42 1.44.54.61.19 1.16.16 1.59.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
