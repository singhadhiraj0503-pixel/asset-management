"use client";

import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Plus,
  Upload,
  X,
  Image as ImageIcon,
  Check,
  LoaderCircle,
  FileImage,
} from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { uploadAssetAction } from "@/actions/dashboard-actions";

type Category = {
  id: number;
  name: string;
  createdAt: Date;
};

type FormState = {
  title: string;
  description: string;
  categoryId: string;
  file: File | null;
};

type CloudinarySignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
};

interface UploadDialogProps {
  categories: Category[];
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const UploadAsset = ({ categories }: UploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressStatus, setUploadProgressStatus] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState<FormState>({
    title: "",
    description: "",
    categoryId: "",
    file: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "title" && value.length > 80) return;

    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormState((prev) => ({ ...prev, categoryId: value }));
  };

  const validateAndSetFile = (file?: File) => {
    if (!file) return;

    setFileError("");
    setUploadError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Choose a PNG, JPG, or WEBP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("The image must be 25 MB or smaller.");
      return;
    }

    setFormState((prev) => ({ ...prev, file }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isUploading) return;

    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const resetForm = () => {
    setFormState({
      title: "",
      description: "",
      categoryId: "",
      file: null,
    });

    setUploadProgressStatus(0);
    setFileError("");
    setUploadError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDialogChange = (nextOpen: boolean) => {
    if (isUploading) return;

    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const getCloudinarySignature = async (): Promise<CloudinarySignature> => {
    const timestamp = Math.round(Date.now() / 1000);

    const response = await fetch("/api/cloudinary/signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ timestamp }),
    });

    if (!response.ok) {
      throw new Error("Failed to create Cloudinary signature.");
    }

    return response.json();
  };

  const handleAssetUpload = async (event: React.FormEvent) => {
    event.preventDefault();

    setUploadError("");

    if (!formState.title.trim()) {
      setUploadError("Please enter an asset title.");
      return;
    }

    if (!formState.categoryId) {
      setUploadError("Please select a category.");
      return;
    }

    if (!formState.file) {
      setFileError("Please select an image to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgressStatus(0);

    try {
      const { signature, timestamp, apiKey } = await getCloudinarySignature();

      const cloudinaryData = new FormData();

      cloudinaryData.append("file", formState.file);
      cloudinaryData.append("api_key", apiKey);
      cloudinaryData.append("timestamp", timestamp.toString());
      cloudinaryData.append("signature", signature);
      cloudinaryData.append("folder", "asset-manager");

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      if (!cloudName) {
        throw new Error("Cloudinary cloud name is not configured.");
      }

      const xhr = new XMLHttpRequest();

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);

          setUploadProgressStatus(progress);
        }
      };

      const cloudinaryPromise = new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid response from Cloudinary."));
            }
          } else {
            let message = "Upload to Cloudinary failed.";

            try {
              const response = JSON.parse(xhr.responseText);
              message = response?.error?.message || message;
            } catch {
              // Keep the default error message.
            }

            reject(new Error(message));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error while uploading the image."));
        };

        xhr.onabort = () => {
          reject(new Error("The upload was cancelled."));
        };
      });

      xhr.send(cloudinaryData);

      const cloudinaryResponse = await cloudinaryPromise;

      const formData = new FormData();

      formData.append("title", formState.title.trim());
      formData.append("description", formState.description.trim());
      formData.append("categoryId", formState.categoryId);
      formData.append("fileUrl", cloudinaryResponse.secure_url);
      formData.append("thumbnailUrl", cloudinaryResponse.secure_url);

      const result = await uploadAssetAction(formData);

      if (!result.success) {
        throw new Error(result.error || "Failed to save the asset.");
      }

      setOpen(false);
      resetForm();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading the asset.";

      console.error("Asset upload failed:", error);
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 text-white shadow-sm transition-colors hover:bg-emerald-500">
          <Plus className="mr-2 size-4" />
          Upload Asset
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="
    flex
    max-h-[92dvh]
    w-[calc(100vw-2rem)]
    max-w-[900px]
    sm:max-w-[900px]
    md:max-w-[900px]
    lg:max-w-[900px]
    flex-col
    gap-0
    overflow-x-hidden
    overflow-y-hidden
    rounded-2xl
    border
    border-border
    bg-background
    p-0
    shadow-2xl
  "
      >
        {/* Dialog header */}
        <DialogHeader className="shrink-0 border-b border-border px-5 py-5 text-left sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-500">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Asset Creator
              </div>

              <DialogTitle className="text-xl font-semibold tracking-tight sm:text-[22px]">
                Upload New Asset
              </DialogTitle>

              <DialogDescription className="mt-2 max-w-[480px] text-sm leading-relaxed text-muted-foreground">
                Add an image asset to your personal library. Submissions undergo
                automatic quality and category validation.
              </DialogDescription>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close upload dialog"
              disabled={isUploading}
              onClick={() => handleDialogChange(false)}
              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable form */}
        <form
          onSubmit={handleAssetUpload}
          className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto"
        >
          <div className="w-full min-w-0 space-y-6 px-5 py-6 sm:px-7">
            {/* Title */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <Label
                  htmlFor="title"
                  className="text-xs font-semibold uppercase tracking-wide"
                >
                  Title <span className="text-emerald-500">*</span>
                </Label>

                <span
                  className={`font-mono text-[11px] ${
                    formState.title.length >= 75
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {formState.title.length}/80 chars
                </span>
              </div>

              <Input
                id="title"
                name="title"
                required
                maxLength={80}
                value={formState.title}
                onChange={handleInputChange}
                disabled={isUploading}
                placeholder="Enter an asset title"
                className="h-12 rounded-xl border-border bg-muted/50 px-4 text-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
              />
            </div>

            {/* Description */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <Label
                  htmlFor="description"
                  className="text-xs font-semibold uppercase tracking-wide"
                >
                  Description
                </Label>

                <span className="text-xs text-muted-foreground">Optional</span>
              </div>

              <Textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                disabled={isUploading}
                placeholder="Describe your asset..."
                rows={3}
                className="min-h-[92px] resize-none rounded-xl border-border bg-muted/50 px-4 py-3 text-sm leading-relaxed focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
              />
            </div>

            {/* Category */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <Label
                  htmlFor="category"
                  className="text-xs font-semibold uppercase tracking-wide"
                >
                  Category <span className="text-emerald-500">*</span>
                </Label>

                <span className="text-xs text-muted-foreground">
                  Classification
                </span>
              </div>

              <Select
                value={formState.categoryId}
                onValueChange={handleCategoryChange}
                disabled={isUploading}
                required
              >
                <SelectTrigger
                  id="category"
                  className="h-12 w-full rounded-xl border-border bg-muted/50 px-4 focus:ring-emerald-500/20"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {categories.length === 0 && (
                <p className="text-xs text-amber-500">
                  No categories available. Add a category in Admin Settings
                  first.
                </p>
              )}
            </div>

            {/* File picker */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label
                  htmlFor="file"
                  className="text-xs font-semibold uppercase tracking-wide"
                >
                  File <span className="text-emerald-500">*</span>
                </Label>

                <span className="font-mono text-[11px] text-muted-foreground">
                  PNG, JPG, WEBP (Max 25MB)
                </span>
              </div>

              <input
                ref={fileInputRef}
                id="file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                disabled={isUploading}
                className="sr-only"
              />

              <div
                role="button"
                tabIndex={isUploading ? -1 : 0}
                aria-label="Choose an image file or drop an image here"
                aria-disabled={isUploading}
                onClick={() => {
                  if (!isUploading) fileInputRef.current?.click();
                }}
                onKeyDown={(event) => {
                  if (
                    !isUploading &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!isUploading) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex min-h-[96px] cursor-pointer items-center gap-4 rounded-xl border border-dashed p-4 transition-colors sm:p-5 ${
                  isDragging
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-emerald-500/40 bg-emerald-500/[0.035] hover:border-emerald-400/70 hover:bg-emerald-500/[0.06]"
                } ${isUploading ? "cursor-not-allowed opacity-70" : ""}`}
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                  {formState.file ? (
                    <FileImage className="size-5" />
                  ) : (
                    <ImageIcon className="size-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {formState.file ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="max-w-full truncate text-sm font-medium">
                          {formState.file.name}
                        </p>

                        <span className="inline-flex items-center gap-1 rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500">
                          <Check className="size-3" />
                          Ready
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatFileSize(formState.file.size)} · Click or drag to
                        replace image
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium">
                        Select an image to upload
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Click to browse or drag and drop an image here
                      </p>
                    </>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={(event) => {
                    event.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="shrink-0 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                >
                  Browse
                </Button>
              </div>

              {fileError && (
                <p role="alert" className="text-xs text-destructive">
                  {fileError}
                </p>
              )}
            </div>

            {/* Upload progress */}
            {isUploading && (
              <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    Cloudinary Sync Protocol
                  </div>

                  <span className="font-mono text-xs text-emerald-500">
                    {uploadProgressStatus}% upload
                  </span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full border border-border bg-muted"
                  role="progressbar"
                  aria-label="Image upload progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={uploadProgressStatus}
                >
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-[width] duration-200"
                    style={{ width: `${uploadProgressStatus}%` }}
                  />
                </div>

                <div className="flex flex-wrap justify-between gap-2 font-mono text-[10px] text-muted-foreground">
                  <span className="break-all">
                    Target: cloudinary://asset-manager/
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <LoaderCircle className="size-3 animate-spin" />
                    {uploadProgressStatus === 100
                      ? "Saving asset..."
                      : "Uploading..."}
                  </span>
                </div>
              </div>
            )}

            {/* Error feedback */}
            {uploadError && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {uploadError}
              </p>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:px-7">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => handleDialogChange(false)}
              className="w-full rounded-xl sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isUploading ||
                !formState.file ||
                !formState.title.trim() ||
                !formState.categoryId
              }
              className="w-full rounded-xl bg-emerald-600 text-white shadow-sm transition-colors hover:bg-emerald-500 sm:w-auto"
            >
              {isUploading ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 size-4" />
                  Upload Asset
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadAsset;
