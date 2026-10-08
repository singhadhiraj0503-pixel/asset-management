"use client";

import { LogOut, Moon, Package, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "../ui/avatar";

const Header = () => {
  const { setTheme } = useTheme();
  const pathName = usePathname();
  const isLoginPage: boolean = pathName === "/login";

  const { data: session, isPending } = useSession();
  const user = session?.user;
  const isAdminUser = user?.role === "admin";

  if (isLoginPage) return null;
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b">
      <div className="container h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href={"/"} className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-teal-500">
              <Package className="size-4 text-white" />
            </div>
            <span className="font-semibold text-lg text-teal-500">
              Asset Platform
            </span>
          </Link>

          <nav className="flex items-center gap-5 ">
            <Link
              href={"/gallery"}
              className="text-sm font-medium hover:text-teal-500"
            >
              Gallery
            </Link>
            {!isPending && user && !isAdminUser && (
              <>
                <Link
                  href={"/dashboard/assets"}
                  className="text-sm font-medium hover:text-teal-500"
                >
                  Assests
                </Link>

                <Link
                  href={"/dashboard/purchases"}
                  className="text-sm font-medium hover:text-teal-500"
                >
                  My Puchases
                </Link>
              </>
            )}

            {!isPending && user && isAdminUser && (
              <>
                <Link
                  href={"/admin/asset-approval"}
                  className="text-sm font-medium hover:text-teal-500"
                >
                  Assest Approval
                </Link>

                <Link
                  href={"/admin/settings"}
                  className="text-sm font-medium hover:text-teal-500"
                >
                  Settings
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle theme */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* {!isPending && user ? (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative size-8 rounded-full"
                  >
                    <Avatar className="size-8 border border-slate-300">
                      <AvatarFallback className="bg-teal-500 text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-500">
                    <LogOut className="mr-2 h-2 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link href={"/login"}>
              <Button className="bg-teal-500 hover:bg-teal-700 text-white">
                Login
              </Button>
            </Link>
          )} */}

          {!isPending && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="relative size-8 rounded-full p-0"
                >
                  <Avatar className="size-8 border border-slate-300">
                    <AvatarFallback className="bg-teal-500 text-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{user.name}</p>

                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  // onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                type="button"
                className="bg-teal-500 hover:bg-teal-700 text-white"
              >
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
