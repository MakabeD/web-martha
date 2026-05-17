"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import ProductCard from "@/components/catalog/product-card";
import { CartIcon, CloseIcon, WhatsappIcon } from "@/components/catalog/icons";
import { formatPrice, normalizeText, parsePrice } from "@/lib/catalog/format";
import type { Product } from "@/lib/catalog/products";
import {
  getCartWhatsappUrl,
  getProductWhatsappUrl,
} from "@/lib/catalog/whatsapp";

type CatalogBrowserProps = {
  products: Product[];
};

type CartItem = Product & {
  quantity: number;
};

type SortOption =
  | "nombre-asc"
  | "precio-asc"
  | "precio-desc"
  | "categoria-asc";

const CART_STORAGE_KEY = "eliza-cart";
const AUTO_REFRESH_MS = 30000;

export default function CatalogBrowser({ products }: CatalogBrowserProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sortBy, setSortBy] = useState<SortOption>("nombre-asc");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const hasMountedRef = useRef(false);

  const refreshCatalog = useEffectEvent(() => {
    startTransition(() => {
      router.refresh();
    });
  });

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
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshCatalog();
      }
    }, AUTO_REFRESH_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshCatalog();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
      <div className="mt-6 flex justify-end sm:mt-8">
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="inline-flex items-center gap-3 rounded-full bg-[color:var(--primary)] px-4 py-3 text-sm font-semibold text-[color:var(--surface)] shadow-[0_16px_34px_rgba(111,3,3,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--accent)] sm:px-5"
        >
          <CartIcon />
          Carrito
          <span className="rounded-full bg-white/14 px-2.5 py-1 text-xs">
            {cartItemCount}
          </span>
        </button>
      </div>

      <section className="mt-8 grid gap-4 rounded-[1.75rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-4 shadow-[var(--shadow)] backdrop-blur sm:mt-10 sm:p-5 lg:grid-cols-3">
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

      <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-6 sm:gap-3">
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
          <section className="mt-8 rounded-[1.75rem] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--panel-strong)] px-5 py-10 text-center shadow-[0_10px_30px_rgba(7,7,5,0.04)] sm:px-6 sm:py-12">
            <h2 className="text-2xl font-semibold text-[color:var(--primary)]">
              No encontramos productos
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--ink)]/75">
              Prueba otra categoria, cambia el orden o busca con otro nombre.
            </p>
          </section>
        ) : (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3">
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
            className="fixed inset-0 z-40 overflow-y-auto bg-[rgba(7,7,5,0.52)] px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <div className="flex min-h-full items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.16 },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.98,
                  transition: { duration: 0.12 },
                }}
                onClick={(event) => event.stopPropagation()}
                className="relative w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-[color:var(--line)] bg-[color:var(--panel-strong)] shadow-[0_30px_90px_rgba(7,7,5,0.22)]"
              >
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--panel)] text-[color:var(--primary)] shadow-[0_8px_20px_rgba(7,7,5,0.12)] transition hover:bg-white sm:right-4 sm:top-4 sm:h-11 sm:w-11"
                  aria-label="Cerrar modal"
                >
                  <CloseIcon />
                </button>

                <div className="grid lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
                  <motion.div
                    layoutId={`image-${selectedProduct.id}`}
                    className="relative aspect-[4/5] bg-[color:var(--surface-strong)]"
                  >
                    <Image
                      src={selectedProduct.imagen}
                      alt={selectedProduct.nombre}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 34vw"
                      className="object-cover"
                    />
                  </motion.div>

                  <div className="flex min-w-0 flex-col justify-between p-5 sm:p-6 lg:p-8">
                    <div>
                      <motion.p
                        layoutId={`categoria-${selectedProduct.id}`}
                        className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--accent)] sm:text-xs"
                      >
                        {selectedProduct.categoria}
                      </motion.p>
                      <motion.h2
                        layoutId={`nombre-${selectedProduct.id}`}
                        className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--primary)] sm:mt-4 sm:text-4xl"
                      >
                        {selectedProduct.nombre}
                      </motion.h2>
                      <motion.p
                        layoutId={`precio-${selectedProduct.id}`}
                        className="mt-3 text-xl font-medium text-[color:var(--ink)] sm:mt-4 sm:text-2xl"
                      >
                        {selectedProduct.precio}
                      </motion.p>
                      <p className="mt-5 text-sm leading-7 text-[color:var(--ink)]/72 sm:mt-6">
                        Explora la prenda con una vista ampliada y decide si
                        quieres preguntar directamente por disponibilidad o
                        guardarla en el carrito para consultarlo todo junto.
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:mt-8">
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
            </div>
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
              className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-[color:var(--line)] bg-[color:var(--panel-strong)] shadow-[-18px_0_40px_rgba(7,7,5,0.12)] sm:max-w-md"
            >
              <div className="flex items-center justify-between border-b border-[color:var(--line)] px-4 py-4 sm:px-6 sm:py-5">
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--primary)] transition hover:bg-[color:var(--panel)] sm:h-11 sm:w-11"
                  aria-label="Cerrar carrito"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                {cart.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--panel)] px-5 py-8 text-center">
                    <p className="text-lg font-semibold text-[color:var(--primary)]">
                      Tu carrito esta vacio
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
                      <div className="flex gap-3 sm:gap-4">
                        <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-[1.1rem] bg-[color:var(--surface-strong)] sm:h-20 sm:w-20">
                          <Image
                            src={item.imagen}
                            alt={item.nombre}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)] sm:text-xs">
                            {item.categoria}
                          </p>
                          <h3 className="mt-1 text-base font-semibold text-[color:var(--primary)] sm:text-lg">
                            {item.nombre}
                          </h3>
                          <p className="mt-1 text-sm text-[color:var(--ink)]/78">
                            {item.precio}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
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

              <div className="border-t border-[color:var(--line)] px-4 py-4 sm:px-6 sm:py-5">
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
