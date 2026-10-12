import { getCategoriesAction } from "@/actions/dashboard-actions";
import AssetGrid from "@/components/dashboard/asset-grid";
import UploadAsset from "@/components/dashboard/upload-asset";
import React from "react";

const AssetsPage = async () => {
  const [categories] = await Promise.all([getCategoriesAction()]);

  return (
    <div className="container py-15">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold">My Assets</h1>
        <UploadAsset categories={categories || []} />
      </div>
      <AssetGrid />
    </div>
  );
};

export default AssetsPage;
