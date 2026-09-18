import type { BottleShape } from "@/lib/products";
import { cn } from "@/lib/utils";

const CAP = "#4a3b38";

interface ProductImageProps {
  shape: BottleShape;
  tint: string;
  backdrop: string;
  /** Path to a product photo in /public. Without one, the packaging is drawn in SVG. */
  image?: string | undefined;
  alt?: string | undefined;
  className?: string | undefined;
}

/** Square product visual: the product photo when available, otherwise an illustration. */
export function ProductImage({
  shape,
  tint,
  backdrop,
  image,
  alt = "",
  className,
}: ProductImageProps) {
  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center overflow-hidden",
        className,
      )}
      style={{ backgroundColor: backdrop }}
    >
      {image ? (
        <img
          src={image}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute bottom-[10%] h-[7%] w-[46%] rounded-[50%] bg-black/10 blur-md"
          />
          <svg viewBox="0 0 200 240" className="relative h-[76%] w-auto" aria-hidden="true">
            <Packaging shape={shape} tint={tint} />
          </svg>
        </>
      )}
    </div>
  );
}

function Packaging({ shape, tint }: { shape: BottleShape; tint: string }) {
  switch (shape) {
    case "dropper":
      return (
        <g>
          <rect x="84" y="18" width="32" height="48" rx="15" fill={CAP} />
          <rect x="78" y="60" width="44" height="26" rx="5" fill={CAP} />
          <rect x="56" y="82" width="88" height="140" rx="20" fill={tint} />
          <rect x="66" y="96" width="9" height="106" rx="4.5" fill="#fff" opacity="0.35" />
          <Label cx={100} cy={156} width={54} height={60} />
        </g>
      );
    case "pump":
      return (
        <g>
          <rect x="98" y="20" width="48" height="10" rx="5" fill={CAP} />
          <rect x="84" y="20" width="32" height="22" rx="6" fill={CAP} />
          <rect x="95" y="40" width="10" height="22" fill={CAP} />
          <rect x="78" y="58" width="44" height="24" rx="5" fill={CAP} />
          <rect x="52" y="78" width="96" height="144" rx="22" fill={tint} />
          <rect x="63" y="94" width="9" height="110" rx="4.5" fill="#fff" opacity="0.35" />
          <Label cx={100} cy={152} width={58} height={62} />
        </g>
      );
    case "bottle":
      return (
        <g>
          <rect x="76" y="18" width="48" height="44" rx="8" fill={CAP} />
          <rect x="84" y="60" width="32" height="18" fill={tint} />
          <rect x="84" y="60" width="32" height="18" fill="#000" opacity="0.06" />
          <rect x="58" y="74" width="84" height="148" rx="16" fill={tint} />
          <rect x="68" y="90" width="9" height="114" rx="4.5" fill="#fff" opacity="0.35" />
          <Label cx={100} cy={150} width={54} height={62} />
        </g>
      );
    case "jar":
      return (
        <g>
          <rect x="34" y="96" width="132" height="42" rx="10" fill={CAP} />
          <rect x="40" y="130" width="120" height="90" rx="22" fill={tint} />
          <rect x="40" y="130" width="120" height="6" fill="#000" opacity="0.06" />
          <rect x="52" y="146" width="9" height="56" rx="4.5" fill="#fff" opacity="0.35" />
          <Label cx={104} cy={176} width={66} height={44} />
        </g>
      );
    case "tube":
      return (
        <g>
          <rect x="54" y="16" width="92" height="14" rx="3" fill={tint} />
          <rect x="54" y="16" width="92" height="14" rx="3" fill="#000" opacity="0.08" />
          <path d="M56 28 H144 L130 174 H70 Z" fill={tint} />
          <path d="M68 40 H76 L80 160 H74 Z" fill="#fff" opacity="0.35" />
          <rect x="74" y="172" width="52" height="10" rx="2" fill={tint} />
          <rect x="74" y="172" width="52" height="10" rx="2" fill="#000" opacity="0.08" />
          <rect x="72" y="180" width="56" height="42" rx="6" fill={CAP} />
          <Label cx={100} cy={102} width={50} height={58} />
        </g>
      );
  }
}

function Label({
  cx,
  cy,
  width,
  height,
}: {
  cx: number;
  cy: number;
  width: number;
  height: number;
}) {
  return (
    <g>
      <rect
        x={cx - width / 2}
        y={cy - height / 2}
        width={width}
        height={height}
        rx="3"
        fill="#fff"
        opacity="0.92"
      />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="10"
        fill={CAP}
      >
        beauty
      </text>
      <text
        x={cx}
        y={cy + 9}
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="10"
        fontStyle="italic"
        fill={CAP}
      >
        glow
      </text>
      <rect x={cx - 10} y={cy + 15} width="20" height="1.2" fill={CAP} opacity="0.45" />
    </g>
  );
}
