"use server";

import { db } from "@/lib/db";
import { category } from "@/lib/db/schema";

export const getCategoriesAction = async () => {
  try {
    return await db.select().from(category);
  } catch (error) {
    console.log(error);
    return [];
  }
};
