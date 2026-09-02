import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Building2, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { label: "หน้าหลัก", path: "/" },
  { label: "จองหอพัก", path: "/booking" },
  { label: "แจ้งปัญหา", path: "/report" },
  { label: "แจ้งเตือน", path: "/notifications" },
  { label: "ติดต่อเรา", path: "/contact" },
] as const;

const Navbar = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    void navigate({ to: "/", replace: true });
  };

  const dashPath = isAdmin ? "/admin" : "/dashboard";
  const dashLabel = isAdmin ? "ผู้ดูแล" : "บัญชีของฉัน";

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/90 shadow-sm backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-prompt text-xl font-bold text-primary">
          <Building2 className="h-7 w-7" />
          <span>DORMITORYNAME</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to={dashPath}
                className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                <LayoutDashboard className="h-4 w-4" />
                {dashLabel}
              </Link>
              <button
                onClick={handleSignOut}
                className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                ออกจากระบบ
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="ml-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>

        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="เมนู"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`mt-2 block rounded-lg px-4 py-2 text-sm font-medium ${
                pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to={dashPath}
                onClick={() => setMobileOpen(false)}
                className="mt-2 block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
              >
                {dashLabel}
              </Link>
              <button
                onClick={handleSignOut}
                className="mt-2 block w-full rounded-lg border border-border px-4 py-2 text-left text-sm font-medium text-foreground"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="mt-2 block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
