import { asset } from "@/lib/db/schema";
import React from "react";

type Asset = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  thumbnailUrl?: string;
  isApproved: string;
  categoryId: number | null;
  createdAt: Date;
};

// type Asset = typeof asset.$inferSelect;

interface AssetGridProps {
  assets: Asset[];
}

const AssetGrid = ({ assets }: AssetGridProps) => {
  return <div>AssetGrid</div>;
};

export default AssetGrid;
