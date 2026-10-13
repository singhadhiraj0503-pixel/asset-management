import {
  getCategoriesAction,
  getUserAssetsAction,
} from "@/actions/dashboard-actions";
import AssetGrid from "@/components/dashboard/asset-grid";
import UploadAsset from "@/components/dashboard/upload-asset";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import React from "react";

const AssetsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session === null) return null;

  const [categories, assets] = await Promise.all([
    getCategoriesAction(),
    getUserAssetsAction(session?.user?.id),
  ]);

  console.log(assets, "assets");

  return (
    <div className="container py-15">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold">My Assets</h1>
        <UploadAsset categories={categories || []} />
      </div>
      <AssetGrid assets={assets} />
    </div>
  );
};

export default AssetsPage;
