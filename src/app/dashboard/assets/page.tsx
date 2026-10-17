import {
  getCategoriesAction,
  getUserAssetsAction,
} from "@/actions/dashboard-actions";
import AssetGrid from "@/components/dashboard/asset-grid";
import UploadAsset from "@/components/dashboard/upload-asset";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const instant = false;

const AssetsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  const [categories, assets] = await Promise.all([
    getCategoriesAction(),
    getUserAssetsAction(session.user.id),
  ]);

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            My Assets
          </h1>

          <div className="shrink-0">
            <UploadAsset categories={categories ?? []} />
          </div>
        </div>

        <AssetGrid assets={assets ?? []} />
      </div>
    </main>
  );
};

export default AssetsPage;
