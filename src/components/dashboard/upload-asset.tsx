"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

type Category = {
  id: number;
  name: string;
  createdAt: Date;
};

interface UploadDialogProps {
  categories: Category[];
}

const UploadAsset = ({ categories }: UploadDialogProps) => {
  const [open, setOpen] = useState(false);

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
          <DialogDescription>Upload a new asset</DialogDescription>
        </DialogHeader>

        <form action="" className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="title" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="description"
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadAsset;
