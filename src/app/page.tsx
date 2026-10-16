import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  ArrowRight,
  Box,
  Package,
  Share2,
  Upload,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Organize",
    description: "Categorize and Tag your Assets",
    icon: Package,
  },
  {
    title: "Upload",
    description: "Upload your Assets",
    icon: Upload,
  },
  {
    title: "Share",
    description: "Share your Assets",
    icon: Share2,
  },
];

const Home = () => {
  return (
    <main className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-background text-foreground">
      {/* Subtle background texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(16,185,129,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 15%, black 80%, transparent)",
        }}
      />

      {/* Main hero and feature content */}
      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-5 pb-10 pt-20 sm:px-8 sm:pt-24 lg:justify-center lg:pb-16 lg:pt-16">
        {/* Hero */}
        <div className="flex w-full flex-col items-center text-center">
          <div className="mb-8 flex size-[66px] items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,0.12)]">
            <Box className="size-7 text-emerald-500" strokeWidth={2.2} />
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-[64px]">
            Asset Management
            <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Platform
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Upload, Manage and Share your digital assets with ease.
          </p>

          <Button
            asChild
            variant="outline"
            className="mt-8 h-14 rounded-xl border-emerald-500/50 bg-emerald-500/5 px-8 text-base font-medium text-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.06)] transition-all hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            <Link href="/gallery" className="flex items-center">
              <span>Browse gallery</span>
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>

        {/* Feature cards */}
        <div className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-5 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="group rounded-2xl border-border/80 bg-card/80 py-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_12px_40px_rgba(16,185,129,0.06)]"
              >
                <CardHeader className="items-center gap-3 pb-2 text-center">
                  <div className="flex size-14 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.06)] transition-colors group-hover:bg-emerald-500/10">
                    <Icon className="size-6 text-emerald-500" strokeWidth={2} />
                  </div>

                  <CardTitle className="text-lg font-semibold tracking-tight">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System status strip */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:mt-16 sm:gap-x-6 sm:text-[11px]">
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.65)]" />
            Vault v2.4 Ready
          </span>

          <span className="hidden text-muted-foreground/50 sm:inline">/</span>

          <span>Zero Latency Cluster</span>

          <span className="hidden text-muted-foreground/50 sm:inline">/</span>

          <span>End-to-End Replication</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/70">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-col items-center justify-between gap-3 px-5 py-4 text-center sm:flex-row sm:px-8 sm:text-left">
          <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
            © 2025 Asset Platform. All rights reserved.
          </p>

          <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wide text-muted-foreground">
            <Activity className="size-3.5 text-emerald-400" />
            <span>Systems Operational</span>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
