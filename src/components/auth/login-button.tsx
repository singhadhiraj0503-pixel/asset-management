"use client";

import React from "react";
import { Button } from "../ui/button";
import { signIn } from "@/lib/auth-client";

const LoginButton = () => {
  const handleLogin = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <Button
      onClick={handleLogin}
      className="w-full bg-teal-500 hover:bg-teal-700 text-white py-5 text-base font-medium cursor-pointer"
    >
      <span>Sign in with Google</span>
    </Button>
  );
};

export default LoginButton;
