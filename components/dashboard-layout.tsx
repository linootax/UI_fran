"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarCheck,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Package,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/alumnos",
      label: "Alumnos",
      icon: User,
      active: pathname === "/alumnos",
    },
    {
      href: "/asistencias",
      label: "Asistencias",
      icon: CalendarCheck,
      active: pathname === "/asistencias",
    },
    {
      href: "/pagos",
      label: "Pagos",
      icon: CreditCard,
      active: pathname === "/pagos",
    },
    {
      href: "/inventario",
      label: "Inventario",
      icon: Package,
      active: pathname === "/inventario",
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0">
          <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="dark:invert"
                />
                <span className="font-bold text-sm">
                  Escuela de Formacion Artistica Miss Dabetza
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid gap-1 px-2">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                      route.active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="border-t p-4">
              <Button variant="outline" className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col h-full border-r bg-background">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={50}
                height={50}
                className="dark:invert"
              />
              <span className="font-bold text-sm">
                Escuela de Formacion Artistica Miss Dabetza
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                    route.active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t p-4">
            <Button variant="outline" className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm">
              Mi Perfil
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
