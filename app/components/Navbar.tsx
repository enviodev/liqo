import { ThemeToggle } from "./ThemeToggle";
import { WavesIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  return (
    <header className=" z-10 px-4 md:px-6">
      <div className="flex h-16 items-center justify-between max-w-4xl mx-auto gap-4">
        <div className="flex items-center gap-2">
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "flex gap-2 items-center text-xl font-semibold"
              )}
            >
              <WavesIcon className="size-5" />
              Liqo
            </Link>
            <Link
              href="/leaderboard"
              className={cn(buttonVariants({ variant: "ghost" }), "text-sm")}
            >
              Leaderboard
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
