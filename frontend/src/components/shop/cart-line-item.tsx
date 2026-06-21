import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatOfferingPrice } from "@/lib/offerings";

export function CartLineItem({
  name,
  variantName,
  quantity,
  unitPrice,
  slug,
  image,
  onRemove,
}: {
  name: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: string;
  slug?: string;
  image?: string | null;
  onRemove?: () => void;
}) {
  const lineTotal = Number(unitPrice) * quantity;

  return (
    <div className="flex gap-3 rounded-xl border border-app-border bg-app-surface/80 p-3 sm:gap-4 sm:p-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-app-surface-muted ring-1 ring-app-border sm:h-20 sm:w-20">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <ShoppingBag className="h-7 w-7 text-app-muted" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {slug ? (
          <Link href={`/shop/${slug}`} className="font-medium text-app-text hover:text-accent-soft">
            {name}
          </Link>
        ) : (
          <p className="font-medium text-app-text">{name}</p>
        )}
        {variantName && <p className="text-sm text-app-muted">{variantName}</p>}
        <p className="mt-2 text-sm text-app-muted">
          Qty {quantity} × {formatOfferingPrice(unitPrice, { prefix: false })}
        </p>
        <p className="mt-1 text-sm font-medium text-app-text">
          {formatOfferingPrice(lineTotal, { prefix: false })}
        </p>
      </div>
      {onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 self-start"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          <Trash2 className="h-4 w-4 text-status-error" />
        </Button>
      ) : null}
    </div>
  );
}
