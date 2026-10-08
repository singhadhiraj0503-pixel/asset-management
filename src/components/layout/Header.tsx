"use client";

import { usePathname } from "next/navigation";
import React from "react";

const Header = () => {
  const pathName = usePathname();
  const isLoginPage: boolean = pathName === "/login";

  if (isLoginPage) return null;
  return <div>Header</div>;
};

export default Header;
