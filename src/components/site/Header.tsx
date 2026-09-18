import { Link } from "@tanstack/react-router";
import { LogOut, Menu, Package, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { FREE_SHIPPING_THRESHOLD, useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/skin-finder", label: "Skin Finder" },
  { to: "/about", label: "About" },
  { to: "/track", label: "Track Order" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { count } = useCart();
  const { user, ready, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    setMenuOpen(false);
    try {
      await signOut();
      toast.success("You've been logged out.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't log out. Please try again.");
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="bg-primary px-4 py-2 text-center text-xs tracking-wide text-primary-foreground">
        Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)} · 30-day happy-skin
        guarantee
      </div>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          className="-ml-2 flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-accent md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link
          to="/"
          className="font-display text-2xl font-semibold tracking-tight"
          onClick={() => setMenuOpen(false)}
        >
          Beauty <span className="italic text-primary">Glow</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:font-medium data-[status=active]:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="-mr-2 flex items-center gap-1">
          {!ready ? (
            <span className="size-10" aria-hidden="true" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-secondary text-sm font-semibold uppercase text-primary hover:bg-accent"
                aria-label="Account menu"
              >
                {user.email?.charAt(0) ?? <User className="size-5" />}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <span className="block text-xs text-muted-foreground">Logged in as</span>
                  <span className="block truncate text-sm font-medium">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/login">
                    <User className="size-4" />
                    My account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/track">
                    <Package className="size-4" />
                    My orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="flex h-10 items-center gap-2 rounded-full px-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              <User className="size-5" />
              <span className="hidden sm:inline">Log in</span>
            </Link>
          )}

          <Link
            to="/cart"
            className="relative flex size-10 items-center justify-center rounded-full hover:bg-accent"
            aria-label={`Shopping bag, ${count} ${count === 1 ? "item" : "items"}`}
            onClick={() => setMenuOpen(false)}
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4.5 text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-border/60 px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-3 text-base text-muted-foreground hover:bg-accent data-[status=active]:font-medium data-[status=active]:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {ready && user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-3 text-left text-base text-muted-foreground hover:bg-accent"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
