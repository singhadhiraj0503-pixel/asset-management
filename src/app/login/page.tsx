import { Card, CardHeader } from "@/components/ui/card";
import { Package } from "lucide-react";
import React from "react";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md shadow">
        <CardHeader className="text-center">
          <div className="mx-auto p-2 rounded-full bg-teal-500 w-fit">
            <Package className="size-6 text-white" />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default LoginPage;
