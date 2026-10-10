"use client";

import React, { useMemo, useState } from "react";
import {
  addNewCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/admin-actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Tag,
  Image as ImageIcon,
  Layers,
  Box,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
  createdAt: Date | string;
};

interface CategoryManagerProps {
  categories: Category[];
}

const PAGE_SIZE = 5;

const getCategoryIcon = (name: string) => {
  const normalized = name.toLowerCase();

  if (normalized.includes("photo") || normalized.includes("image")) {
    return { Icon: ImageIcon, color: "text-amber-400", bg: "bg-amber-500/10" };
  }

  if (normalized.includes("model") || normalized.includes("3d")) {
    return { Icon: Box, color: "text-cyan-400", bg: "bg-cyan-500/10" };
  }

  if (normalized.includes("ui") || normalized.includes("kit")) {
    return { Icon: Layers, color: "text-violet-400", bg: "bg-violet-500/10" };
  }

  return { Icon: Tag, color: "text-emerald-400", bg: "bg-emerald-500/10" };
};

const formatDate = (date: Date | string) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const CategoryManager = ({
  categories: initialCategories,
}: CategoryManagerProps) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));

  const visibleCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return categories.slice(start, start + PAGE_SIZE);
  }, [categories, currentPage]);

  const handleAddNewCategory = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const name = newCategoryName.trim();

    if (name.length < 2) {
      setMessage("Category name must contain at least 2 characters.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("name", name);

      const result = await addNewCategoryAction(formData);

      if (!result.success) {
        setMessage(result.message || "Failed to add category.");
        return;
      }

      // The existing action returns success/message, not the inserted row.
      // Refresh the page data to retrieve the actual database record.
      window.location.reload();
    } catch (error) {
      console.error("Failed to add category:", error);
      setMessage("Unable to add category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const result = await deleteCategoryAction(id);

      if (!result.success) {
        setMessage(result.message || "Failed to delete category.");
        return;
      }

      const updated = categories.filter((item) => item.id !== id);
      setCategories(updated);
      setCurrentPage((page) =>
        Math.min(page, Math.max(1, Math.ceil(updated.length / PAGE_SIZE))),
      );
      setMessage(result.message);
    } catch (error) {
      console.error("Failed to delete category:", error);
      setMessage("Unable to delete category. Please try again.");
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setMessage("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEditing = async (id: number) => {
    const name = editingName.trim();

    if (name.length < 2) {
      setMessage("Category name must contain at least 2 characters.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const result = await updateCategoryAction(id, name);

      if (!result.success) {
        setMessage(result.message || "Failed to update category.");
        return;
      }

      setCategories((current) =>
        current
          .map((item) => (item.id === id ? { ...item, name } : item))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );

      cancelEditing();
      setMessage(result.message);
    } catch (error) {
      console.error("Failed to update category:", error);
      setMessage("Unable to update category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add category */}
      <form onSubmit={handleAddNewCategory} className="space-y-2">
        <Label htmlFor="categoryName" className="text-xs font-medium">
          New Category
        </Label>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Input
              id="categoryName"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Enter category name (e.g. 3D Models, Vector Icons, Cloths...)"
              maxLength={50}
              disabled={isSubmitting}
              className="h-10 border-border bg-muted/50 pr-16 text-sm placeholder:text-muted-foreground/70"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground sm:block">
              Enter
            </span>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !newCategoryName.trim()}
            className="h-10 shrink-0 gap-2 bg-emerald-500 px-5 text-sm font-medium text-black hover:bg-emerald-400"
          >
            {isSubmitting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add Category
          </Button>
        </div>
      </form>

      {message && (
        <p
          role="status"
          className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
        >
          {message}
        </p>
      )}

      {/* Category table */}
      <section className="border-t border-border pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Existing Categories</h3>
          <span className="text-xs text-muted-foreground">
            {categories.length} total categor
            {categories.length === 1 ? "y" : "ies"} defined
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 text-center">
            <Tag className="mb-3 size-7 text-muted-foreground" />
            <p className="text-sm font-medium">No categories yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add your first category using the form above.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/60 hover:bg-muted/60">
                    <TableHead className="h-11 min-w-[230px] px-5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="h-11 min-w-[130px] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Created At
                    </TableHead>
                    <TableHead className="h-11 min-w-[110px] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-11 w-24 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {visibleCategories.map((category) => {
                    const { Icon, color, bg } = getCategoryIcon(category.name);
                    const isEditing = editingId === category.id;

                    return (
                      <TableRow
                        key={category.id}
                        className="border-border transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="px-5 py-3.5">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex size-8 shrink-0 items-center justify-center rounded-md border border-current/10 ${bg}`}
                            >
                              <Icon className={`size-4 ${color}`} />
                            </div>

                            {isEditing ? (
                              <Input
                                value={editingName}
                                onChange={(event) =>
                                  setEditingName(event.target.value)
                                }
                                maxLength={50}
                                autoFocus
                                className="h-8 min-w-0"
                                aria-label="Edit category name"
                              />
                            ) : (
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {category.name}
                                </p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                  Classification group
                                </p>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(category.createdAt)}
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={isSubmitting}
                                  aria-label="Save category"
                                  onClick={() => saveEditing(category.id)}
                                  className="size-8 text-emerald-500 hover:text-emerald-400"
                                >
                                  <Check className="size-4" />
                                </Button>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Cancel editing"
                                  onClick={cancelEditing}
                                  className="size-8"
                                >
                                  <X className="size-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Edit ${category.name}`}
                                  onClick={() => startEditing(category)}
                                  className="size-8 text-muted-foreground hover:text-foreground"
                                >
                                  <Pencil className="size-4" />
                                </Button>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Delete ${category.name}`}
                                  onClick={() =>
                                    handleDeleteCategory(category.id)
                                  }
                                  className="size-8 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * PAGE_SIZE + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(currentPage * PAGE_SIZE, categories.length)}
                </span>{" "}
                of {categories.length} categories
              </p>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="h-8 gap-1 text-xs"
                >
                  <ChevronLeft className="size-3.5" />
                  Previous
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  className="h-8 gap-1 text-xs"
                >
                  Next
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryManager;
