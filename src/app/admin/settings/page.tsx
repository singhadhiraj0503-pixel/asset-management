import {
  getAllCategoriesAction,
  getTotalUsersCountAction,
} from "@/actions/admin-actions";
import CategoryManager from "@/components/admin/category-manager";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Package,
  Tags,
  Cloud,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const SettingsPage = async () => {
  const [categories, userCount] = await Promise.all([
    getAllCategoriesAction(),
    getTotalUsersCountAction(),
  ]);

  const stats = [
    {
      label: "TOTAL USERS",
      value: userCount,
      description: "All registered system operators",
      icon: Users,
      accent: true,
      badge: "+ Users",
    },
    {
      label: "TOTAL ASSETS",
      value: "500",
      description: "All published assets across repos",
      icon: Package,
      badge: "Verified",
    },
    {
      label: "CATEGORIES",
      value: categories.length,
      description: "Structured classification groups",
      icon: Tags,
      badge: "Healthy",
    },
    {
      label: "CLOUD STORAGE",
      value: "18.4",
      suffix: "GB",
      description: "AWS S3 storage pool",
      icon: Cloud,
      badge: "32% used",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-24">
        {/* Page heading */}
        <section className="mb-9">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link
              href="/admin"
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <ChevronRight className="size-3" />
            <span className="font-medium text-emerald-500">Admin Settings</span>
          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Admin Settings
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Configure system classifications, monitor active contributors,
                and manage platform-wide asset parameters.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-fit gap-2 border-border bg-card"
              disabled
              title="Audit logs are not implemented yet"
            >
              <BookOpen className="size-4" />
              Audit Logs
            </Button>
          </div>
        </section>

        {/* Statistics */}
        <section
          aria-label="Platform statistics"
          className="mb-9 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.label}
                className="gap-4 rounded-xl border-border bg-card py-5 shadow-none"
              >
                <CardContent className="px-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>

                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-4 text-foreground" />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`text-3xl font-bold tracking-tight ${
                        stat.accent ? "text-emerald-400" : "text-foreground"
                      }`}
                    >
                      {stat.value}
                    </span>

                    {stat.suffix && (
                      <span className="text-sm text-muted-foreground">
                        {stat.suffix}
                      </span>
                    )}

                    <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                      {stat.badge}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Category management */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card/30">
          <div className="flex flex-col justify-between gap-4 border-b border-border px-5 py-6 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="text-base font-semibold">Category Management</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Create, view, and organize classification tags for digital
                assets across the platform.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Synchronized
            </span>
          </div>

          <div className="p-4 sm:p-6">
            <CategoryManager categories={categories} />
          </div>
        </section>
      </div>
    </main>
  );
};

export default SettingsPage;
