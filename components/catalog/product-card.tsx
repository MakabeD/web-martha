import Image from "next/image";
import { motion } from "framer-motion";

type ProductCardProps = {
  id: string;
  nombre: string;
  precio: string;
  categoria: string;
  imagen: string;
  onClick: () => void;
};

export default function ProductCard({
  id,
  nombre,
  precio,
  categoria,
  imagen,
  onClick,
}: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full overflow-hidden rounded-[1.75rem] border border-[color:var(--line)] bg-[color:var(--panel-strong)] text-left shadow-[var(--shadow)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(7,7,5,0.12)]"
    >
      <motion.div
        layoutId={`image-${id}`}
        className="relative aspect-[4/5] overflow-hidden bg-[color:var(--surface-strong)]"
      >
        <Image
          src={imagen}
          alt={nombre}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[rgba(7,7,5,0.18)] to-transparent sm:h-24" />
      </motion.div>

      <div className="space-y-2 px-4 py-4 sm:space-y-3 sm:p-5">
        <motion.p
          layoutId={`categoria-${id}`}
          className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)] sm:text-xs"
        >
          {categoria}
        </motion.p>
        <motion.h2
          layoutId={`nombre-${id}`}
          className="text-xl font-semibold tracking-[-0.04em] text-[color:var(--primary)] sm:text-2xl"
        >
          {nombre}
        </motion.h2>
        <div className="flex items-center justify-between gap-3">
          <motion.p
            layoutId={`precio-${id}`}
            className="text-base font-medium text-[color:var(--ink)] sm:text-lg"
          >
            {precio}
          </motion.p>
          <span className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)] sm:text-xs">
            Eliza
          </span>
        </div>
        <p className="text-sm leading-6 text-[color:var(--ink)]/65">
          Pieza seleccionada para un catalogo visual limpio y facil de explorar.
        </p>
      </div>
    </button>
  );
}
