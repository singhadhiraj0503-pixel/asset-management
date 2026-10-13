import {
  approveAssetAction,
  getPendingAssetsAction,
  rejectAssetAction,
} from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import Image from "next/image";
import React from "react";

const AssetApprovalPage = async () => {
  const pendingAssets = await getPendingAssetsAction();

  return pendingAssets.length === 0 ? (
    <Card className="">
      <CardContent className="py-15 flex flex-col items-center justify-center">
        <p className="text-center text-slate-600 text-lg">
          All Assets have been reviewed
        </p>
      </CardContent>
    </Card>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-20">
      {pendingAssets.map(({ asset, userName }) => {
        return (
          <div
            key={asset.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow"
          >
            <div className="h-48 bg-slate-100 relative">
              <Image
                src={asset.fileUrl}
                alt={asset.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-4">
              <h3 className="font-medium truncate">{asset.title}</h3>
              {asset.description && (
                <p className="text-xs text-slate-500">{asset.description}</p>
              )}

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(asset.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                <div className="flex items-center text-xs text-slate-500">
                  <User className="size-4 mr-2" />
                  {userName}
                </div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <form
                action={async () => {
                  "use server";
                  await approveAssetAction(asset.id);
                }}
              >
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-800 cursor-pointer text-white"
                >
                  Approve
                </Button>
              </form>

              <form
                action={async () => {
                  "use server";
                  await rejectAssetAction(asset.id);
                }}
              >
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-800 cursor-pointer text-white"
                >
                  Reject
                </Button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssetApprovalPage;
