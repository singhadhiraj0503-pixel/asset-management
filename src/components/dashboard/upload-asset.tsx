"use client";

import React, { useState } from "react";
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
import { Plus, Upload } from "lucide-react";
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

const UploadAsset = ({ categories }: UploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressStatus, setUploadProgressStatus] = useState(0);
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
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    console.log(value);
    setFormState((prev) => ({ ...prev, categoryId: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormState((prev) => ({ ...prev, file }));
    }
  };

  const getCloudinarySignature = async (): Promise<CloudinarySignature> => {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const response = await fetch("/api/cloudinary/signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ timestamp }),
    });

    if (!response.ok) {
      throw new Error("Failed to create Cloudinary Signature");
    }

    return response.json();
  };

  const handleAssetUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsUploading(true);
    setUploadProgressStatus(0);
    try {
      const { signature, timestamp, apiKey } = await getCloudinarySignature();
      // console.log(signature, timestamp, apiKey);

      const cloudinaryData = new FormData();
      cloudinaryData.append("file", formState.file as File);
      cloudinaryData.append("api_key", apiKey);
      cloudinaryData.append("timestamp", timestamp.toString());
      cloudinaryData.append("signature", signature);
      cloudinaryData.append("folder", "asset-manager");

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
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
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error("Upload to Cloudinary failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Upload to Cloudinary failed"));
      });

      xhr.send(cloudinaryData);

      const cloudinaryResponse = await cloudinaryPromise;
      console.log(cloudinaryResponse, "Cloudinary Response");

      const formData = new FormData();
      formData.append("title", formState.title);
      formData.append("description", formState.description);
      formData.append("categoryId", formState.categoryId);
      formData.append("fileUrl", cloudinaryResponse.secure_url);
      formData.append("thumbnailUrl", cloudinaryResponse.secure_url);
    } catch (error) {}
  };

  // console.log(formState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={"bg-green-800 text-white hover:bg-emerald-600"}>
          <Plus className="size-4 mr-2" />
          Upload Asset
        </Button>
      </DialogTrigger>
      <DialogContent className={"sm:max-w-[600px]"}>
        <DialogHeader>
          <DialogTitle>Upload New Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAssetUpload} action="" className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formState.title}
              onChange={handleInputChange}
              placeholder="title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              value={formState.description}
              onChange={handleInputChange}
              id="description"
              name="description"
              placeholder="description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formState.categoryId}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => {
                  return (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              onChange={handleFileChange}
              id="file"
              type="file"
              accept="image/*"
            />
          </div>
          <DialogFooter>
            <Button type="submit">
              <Upload className="size-5 mr-2" />
              Upload Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadAsset;
