import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const GalleryPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session && session?.user?.role === "admin") redirect("/");
  return <div>GalleryPage</div>;
};

export default GalleryPage;
