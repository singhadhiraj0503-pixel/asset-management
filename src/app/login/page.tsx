import LoginButton from "@/components/auth/login-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package } from "lucide-react";
import Link from "next/link";
import React from "react";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md shadow">
        <CardHeader className="text-center">
          <div className="mx-auto p-2 rounded-full bg-teal-500 w-fit">
            <Package className="size-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-teal-500">
            Welcome Back...
          </CardTitle>
          <CardDescription className="text-sm font-bold">
            Sign In to your Account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginButton />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            className="text-sm opacity-50 font-semibold hover:text-teal-500"
            href={`/`}
          >
            Back to Home-Page
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
