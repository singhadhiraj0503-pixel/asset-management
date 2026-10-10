"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { category, user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

const CategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name should be atleast 2 characters long")
    .max(50, "Category name must be of maximum 50 characters"),
});

export type CategoryFormValues = z.infer<typeof CategorySchema>;

export const addNewCategoryAction = async (formData: FormData) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin")
    throw new Error("You must be an Admin to add categories");

  try {
    const name = formData.get("name") as string;

    const validateFields = CategorySchema.parse({ name });

    const existingCategory = await db
      .select()
      .from(category)
      .where(eq(category.name, validateFields.name))
      .limit(1);

    if (existingCategory.length > 0) {
      return {
        success: false,
        message: "Category already exists! Please try with a different name",
      };
    }

    await db.insert(category).values({
      name: validateFields.name,
    });

    revalidatePath("/admin/settings");
    return {
      success: true,
      message: "New category Added",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add category",
    };
  }
};

export const getAllCategoriesAction = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin")
      throw new Error("You must be an admin to access this data");

    return await db.select().from(category).orderBy(category.name);
  } catch (error) {
    console.log(error);
    // return {
    //   success: false,
    //   message: "Failed to fetch categories",
    // };
    return [];
  }
};

export const getTotalUsersCountAction = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin")
    throw new Error("You must be an admin to access this data");

  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(user);

    return result[0]?.count || 0;
  } catch (error) {
    console.log(error);
    // return {
    //   success: false,
    //   message: "Failed to fetch users count",
    // };
    return 0;
  }
};

export const deleteCategoryAction = async (categoryId: number) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin")
    throw new Error("You must be an admin to delete category");

  try {
    await db.delete(category).where(eq(category.id, categoryId));

    revalidatePath("/admin/settings");

    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to delete category",
    };
  }
};

export const updateCategoryAction = async (
  categoryId: number,
  name: string,
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be an admin to update categories");
  }

  try {
    const validated = CategorySchema.parse({
      name: name.trim(),
    });

    const existingCategory = await db
      .select()
      .from(category)
      .where(eq(category.name, validated.name))
      .limit(1);

    if (existingCategory.some((item) => item.id !== categoryId)) {
      return {
        success: false,
        message: "That category name is already in use.",
      };
    }

    await db
      .update(category)
      .set({ name: validated.name })
      .where(eq(category.id, categoryId));

    revalidatePath("/admin/settings");

    return {
      success: true,
      message: "Category updated successfully.",
    };
  } catch (error) {
    console.error("Failed to update category:", error);

    return {
      success: false,
      message: "Failed to update category.",
    };
  }
};
