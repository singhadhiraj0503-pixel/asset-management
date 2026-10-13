import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { Badge } from "../ui/badge";

type Asset = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  thumbnailUrl?: string | null;
  isApproved: string;
  categoryId: number | null;
  createdAt: Date;
};

interface AssetGridProps {
  assets: Asset[];
}

const AssetGrid = ({ assets }: AssetGridProps) => {
  if (assets.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-border bg-muted">
          <Image
            src="/placeholder.png"
            alt=""
            width={28}
            height={28}
            className="hidden"
          />
          <span className="text-2xl text-muted-foreground">＋</span>
        </div>

        <h2 className="text-lg font-semibold">No assets yet</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Upload your first asset to see it in your personal library.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {assets.map((asset) => {
        const status =
          asset.isApproved === "approved"
            ? "Approved"
            : asset.isApproved === "rejected"
              ? "Rejected"
              : "Pending";

        const statusClass =
          asset.isApproved === "approved"
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            : asset.isApproved === "rejected"
              ? "border-red-500/40 bg-red-500/10 text-red-400"
              : "border-amber-500/40 bg-amber-500/10 text-amber-400";

        return (
          <article
            key={asset.id}
            className="group min-w-0 overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-200 hover:border-emerald-500/30"
          >
            <div className="relative aspect-[1.55/1] overflow-hidden bg-muted">
              <Image
                src={asset.thumbnailUrl || asset.fileUrl}
                alt={asset.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />

              <Badge
                variant="outline"
                className={`absolute right-4 top-4 gap-2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md ${statusClass}`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    asset.isApproved === "approved"
                      ? "bg-emerald-400"
                      : asset.isApproved === "rejected"
                        ? "bg-red-400"
                        : "bg-amber-400"
                  }`}
                />
                {status}
              </Badge>
            </div>

            <div className="flex min-h-[152px] flex-col p-5">
              <h2
                className="truncate text-base font-medium tracking-tight sm:text-lg"
                title={asset.title}
              >
                {asset.title}
              </h2>

              {asset.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {asset.description}
                </p>
              ) : (
                <p className="mt-2 text-sm italic text-muted-foreground/70">
                  No description provided.
                </p>
              )}

              <div className="mt-auto flex items-center gap-2 pt-5 text-xs text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                <span>
                  {formatDistanceToNow(new Date(asset.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default AssetGrid;
