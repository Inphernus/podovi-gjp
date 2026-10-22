// Izvor: 21st.dev — Centered Nav Header (@olewandowski1), preuzeto 2026-10-22
// https://21st.dev/@olewandowski1/components/centered-nav-header
// Original, neprilagođen. Ovisi o shadcn Button/Separator/Sheet (Radix) i @remixicon/react.
// Prilagođena verzija: site/src/components/astro/Header.astro
"use client";

import { RiArrowRightLine, RiMenuLine } from "@remixicon/react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { label: "Products", href: "#" },
  { label: "Solutions", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Docs", href: "#" },
  { label: "Blog", href: "#" },
];

export default function HeaderBlock() {
  return (
    <header className="relative flex h-16 w-full items-center border-b border-border px-6">
      <a href="#" className="flex shrink-0 items-center gap-2.5">
        <div className="grid grid-cols-2 gap-0.5" aria-hidden="true">
          <div className="size-2.5 bg-primary" />
          <div className="size-2.5 bg-primary" />
          <div className="size-2.5 bg-primary" />
          <div className="size-2.5 bg-primary" />
        </div>
        <span className="text-base font-bold tracking-tight">Acme</span>
      </a>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
        {navLinks.map((link) => (
          <Button key={link.label} render={<a href={link.href} />} nativeButton={false} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            {link.label}
          </Button>
        ))}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <Button render={<a href="#" />} nativeButton={false} variant="ghost" size="sm" className="hidden text-muted-foreground hover:text-foreground sm:inline-flex">
          Sign In
        </Button>
        <Separator orientation="vertical" className="hidden h-5 sm:block" />
        <Button render={<a href="#" />} nativeButton={false} size="sm" className="hidden sm:inline-flex">
          Start Free Trial
          <RiArrowRightLine data-icon="inline-end" aria-hidden="true" />
        </Button>

        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="icon" className="md:hidden" />} aria-label="Open menu">
            <RiMenuLine aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-xs">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2.5">
                <div className="grid grid-cols-2 gap-0.5" aria-hidden="true">
                  <div className="size-2 bg-primary" />
                  <div className="size-2 bg-primary" />
                  <div className="size-2 bg-primary" />
                  <div className="size-2 bg-primary" />
                </div>
                Acme
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col px-2">
              {navLinks.map((link) => (
                <SheetClose key={link.label} render={<a href={link.href} />} nativeButton={false} className="px-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  {link.label}
                </SheetClose>
              ))}
            </nav>
            <SheetFooter>
              <Button render={<a href="#" />} nativeButton={false} variant="ghost" className="w-full">Sign In</Button>
              <Button render={<a href="#" />} nativeButton={false} className="w-full">
                Start Free Trial
                <RiArrowRightLine data-icon="inline-end" aria-hidden="true" />
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

/* shadcn ovisnosti (iz registra 21st.dev):
   Button base: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background
     transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
   default: "bg-primary text-primary-foreground hover:bg-primary/90"; ghost: "hover:bg-accent hover:text-accent-foreground";
   outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"; sm: "h-9 rounded-md px-3"; icon: "h-10 w-10"
   Sheet (right): "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
     slide-in-from-right 500ms / slide-out-to-right 300ms; overlay "fixed inset-0 z-50 bg-black/80" (fade);
     gumb za zatvaranje "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100" s X (h-4 w-4).
   SheetHeader "flex flex-col space-y-2 text-center sm:text-left"; SheetTitle "text-lg font-semibold text-foreground";
   SheetFooter "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"; Separator "shrink-0 bg-border w-[1px]". */
