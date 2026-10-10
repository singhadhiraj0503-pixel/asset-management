"use client";

import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  addNewCategoryAction,
  deleteCategoryAction,
} from "@/actions/admin-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type Category = {
  id: number;
  name: string;
  createdAt: Date;
};

interface CategoryManagerProps {
  categories: Category[];
}

const CategoryManager = ({
  categories: initialCategories,
}: CategoryManagerProps) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddNewCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newCategoryName);

      const result = await addNewCategoryAction(formData);

      if (result.success) {
        const newCategory = {
          id: Math.max(0, ...categories.map((c) => c.id)) + 1,
          name: newCategoryName,
          createdAt: new Date(),
        };
        setCategories([...categories, newCategory]);
        setNewCategoryName("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeletecategory = async (currentCategoryIdToDelete: number) => {
    const result = await deleteCategoryAction(currentCategoryIdToDelete);

    if (result.success) {
      setCategories(
        categories.filter((c) => c.id !== currentCategoryIdToDelete),
      );
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddNewCategory} className="space-y-2" action="">
        <div className="space-y-2">
          <Label htmlFor="categoryName">New Category</Label>
          <div className="flex gap-2">
            <Input
              id="categoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter Category name"
            />
            <Button
              type="submit"
              className={
                "bg-teal-500 text-white hover:bg-teal-700 cursor-pointer"
              }
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </div>
      </form>

      <div>
        <h3 className="text-lg font-medium mb-4">Categories</h3>
        {categories.length === 0 ? (
          <p>No categories added. Add your first category above.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                return (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size={"icon"}
                        className={"cursor-pointer"}
                        onClick={() => handleDeletecategory(category.id)}
                      >
                        <Trash2 className="size-5 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
