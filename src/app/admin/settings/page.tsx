import {
  getAllCategoriesAction,
  getTotalUsersCountAction,
} from "@/actions/admin-actions";
import CategoryManager from "@/components/admin/category-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import React from "react";

const SettingsPage = async () => {
  const [categories, userCount] = await Promise.all([
    getAllCategoriesAction(),
    getTotalUsersCountAction(),
  ]);

  return (
    <div className="container py-20">
      <h1 className="text-3xl font-bold mb-5">Admin Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium">
              <Users className="size-5 mr-2 text-teal-500" />
              Total Users
            </CardTitle>
            <CardDescription>All registered Users :</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-teal-500">{userCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium">
              <Users className="size-5 mr-2 text-teal-500" />
              Total Assets
            </CardTitle>
            <CardDescription>All uploaded Assets :</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-teal-500">500</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryManager categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
