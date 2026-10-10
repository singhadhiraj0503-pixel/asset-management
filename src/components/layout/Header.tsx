"use client";

import { LogOut, Moon, Package, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { signOut, useSession } from "@/lib/auth-client";

const Header = () => {
  const { setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";
  const { data: session, isPending } = useSession();

  const user = session?.user;
  const isAdminUser = user?.role === "admin";

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  if (isLoginPage) return null;

  const navItems = isAdminUser
    ? [
        {
          label: "Asset Approval",
          href: "/admin/asset-approval",
        },
        {
          label: "Settings",
          href: "/admin/settings",
        },
      ]
    : [
        {
          label: "Gallery",
          href: "/gallery",
        },
        ...(user
          ? [
              {
                label: "Assets",
                href: "/dashboard/assets",
              },
              {
                label: "My Purchases",
                href: "/dashboard/purchases",
              },
            ]
          : []),
      ];

  const displayName = user?.name?.trim() || "User";
  const userInitial = displayName.charAt(0).toUpperCase();
  const userRole = isAdminUser ? "Super Admin" : "Asset Contributor";

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[60px] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo and brand */}
        <div className="flex min-w-0 items-center gap-5 sm:gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="Asset Platform home"
          >
            <span className="flex size-9 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/5">
              <Package className="size-5 text-emerald-400" />
            </span>

            <span className="hidden whitespace-nowrap text-sm font-semibold tracking-tight text-foreground sm:inline">
              Asset Platform
            </span>

            <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] font-semibold tracking-wide text-emerald-400 md:inline-flex">
              PRO
            </span>
          </Link>

          {/* Navigation */}
          <nav
            aria-label="Main navigation"
            className="flex h-[60px] min-w-0 items-center gap-1 overflow-x-auto"
          >
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex h-full shrink-0 items-center px-3 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-emerald-500" />
                  )}

                  {isActive && (
                    <span className="absolute inset-x-1 top-1/2 -translate-y-1/2 rounded-md border border-border bg-muted/60 py-3" />
                  )}

                  <span className="relative z-10 whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Theme and account */}
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Change theme"
                className="size-9 rounded-lg border-border bg-muted/30 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8}>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 size-4" />
                Light
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 size-4" />
                Dark
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Vertical separator */}
          <div className="hidden h-7 w-px bg-border sm:block" />

          {/* User account */}
          {!isPending && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open user account menu"
                  className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Avatar className="size-9 shrink-0 border border-emerald-500/30">
                    {user.image && (
                      <AvatarImage
                        src={user.image}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                      />
                    )}

                    <AvatarFallback className="bg-emerald-500 text-xs font-semibold text-black">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>

                  {/* Hide account text on smaller screens */}
                  <span className="hidden min-w-0 text-left sm:block">
                    <span className="block max-w-32 truncate text-xs font-semibold text-foreground">
                      {displayName}
                    </span>
                    <span className="mt-0.5 block max-w-32 truncate text-[10px] text-muted-foreground">
                      {userRole}
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-10 shrink-0">
                        {user.image && (
                          <AvatarImage
                            src={user.image}
                            alt={displayName}
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <AvatarFallback className="bg-emerald-500 text-black">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {displayName}
                        </p>
                        <p className="truncate text-xs font-normal text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="mt-1 text-[10px] font-medium text-emerald-500">
                          {userRole}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !isPending ? (
            <Button
              asChild
              size="sm"
              className="bg-emerald-500 text-black hover:bg-emerald-400"
            >
              <Link href="/login">Login</Link>
            </Button>
          ) : (
            <div
              className="size-9 animate-pulse rounded-full bg-muted"
              aria-label="Loading account"
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
