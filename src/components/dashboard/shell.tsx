"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Settings,
  CreditCard,
  Command,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  LifeBuoy,
  ShieldCheck,
  Plus,
  Store,
  Check,
  ArrowRightLeft,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";
import { useWorkspaceStore } from "@/stores/workspace";
import { useAdminStore } from "@/stores/admin";
import { usePlatformCapabilities } from "@/hooks/use-queries";
import { useT } from "@/lib/i18n";
import {
  PRODUCT_AREAS,
  NAV_MAP,
  getProductAreaFromPath,
  type NavSection,
  type NavItem,
  type ProductArea,
  type ProductConfig,
} from "@/config";
import { cn, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { XSymbol } from "@/components/shared/x-symbol";
import { XpIAChat } from "@/components/shared/xpia-chat";
import { toast } from "sonner";
import { APP_NAME } from "@/config";

// ---- Logo ----

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <XSymbol className="h-8 w-8" />
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {APP_NAME}
          </span>
          <span className="text-[10px] text-muted-foreground">Payments OS</span>
        </div>
      )}
    </div>
  );
}

// ---- Product Switcher ----

function ProductSwitcher({
  activeProduct,
  onSelect,
  compact,
}: {
  activeProduct: ProductArea;
  onSelect: (area: ProductArea) => void;
  compact?: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const isPlatformAdmin = useAdminStore((s) => s.isPlatformAdmin);
  const { data: platformCap } = usePlatformCapabilities();
  const capabilities = (platformCap as Record<string, unknown> | undefined)?.capabilities as Record<string, unknown> | undefined;

  function isCapabilityEnabled(key: string): boolean {
    const val = capabilities?.[key];
    return val === true || val === "enabled";
  }

  // Filter product areas: show admin only if user is admin
  const visibleAreas = React.useMemo(() => {
    if (isPlatformAdmin) return PRODUCT_AREAS;
    return PRODUCT_AREAS.filter((a) => a.id !== "admin");
  }, [isPlatformAdmin]);

  const activeConfig = PRODUCT_AREAS.find((p) => p.id === activeProduct);

  const handleSelect = (area: ProductConfig) => {
    // Check capabilities for banking and advisory
    if (area.id === "banking" && !isCapabilityEnabled("banking")) {
      toast.info("Banking em preparacao. Sera ativado em breve.");
      return;
    }
    if (area.id === "advisory" && !isCapabilityEnabled("advisory")) {
      toast.info("Advisory em preparacao. Sera ativado em breve.");
      return;
    }
    // Admin check
    if (area.id === "admin" && !isPlatformAdmin) return;

    onSelect(area.id);
    // Navigate to the default route for that product
    const defaultRoute = area.id === "admin" ? "/admin" : `/${area.id}/overview`;
    router.push(defaultRoute);
  };

  // Track disabled areas for badge rendering
  const disabledAreas = React.useMemo(() => {
    const disabled = new Set<string>();
    if (!isCapabilityEnabled("banking")) disabled.add("banking");
    if (!isCapabilityEnabled("advisory")) disabled.add("advisory");
    return disabled;
  }, [capabilities]);

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "grid h-9 w-9 place-items-center rounded-lg transition",
              "bg-gradient-to-br text-white",
              activeConfig?.accentFrom,
              activeConfig?.accentTo
            )}
            aria-label="Switch product"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {visibleAreas.map((area) => (
            <DropdownMenuItem
              key={area.id}
              onClick={() => handleSelect(area)}
              className="gap-2"
            >
              <div
                className={cn(
                  "grid h-5 w-5 place-items-center rounded text-[10px] font-bold text-white bg-gradient-to-br",
                  area.accentFrom,
                  area.accentTo
                )}
              >
                {area.label[0]}
              </div>
              <span className="flex-1">{area.tKey ? t(area.tKey) : area.label}</span>
              {disabledAreas.has(area.id) && (
                <span className="text-[10px] text-amber-400">Em breve</span>
              )}
              {activeProduct === area.id && (
                <Check className="ml-auto h-3.5 w-3.5" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg border border-border/60 bg-card/40 px-2.5 py-2 text-left transition hover:bg-card/70"
          )}
        >
          <div
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-md bg-gradient-to-br text-[11px] font-semibold text-white",
              activeConfig?.accentFrom,
              activeConfig?.accentTo
            )}
          >
            {activeConfig?.label[0] ?? "X"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">
              {activeConfig?.tKey ? t(activeConfig.tKey) : activeConfig?.label}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {t("shell.productArea")}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t("shell.switchProduct")}
        </DropdownMenuLabel>
        {visibleAreas.map((area) => (
          <DropdownMenuItem
            key={area.id}
            onClick={() => handleSelect(area)}
            className="gap-2"
          >
            <div
              className={cn(
                "grid h-6 w-6 place-items-center rounded bg-gradient-to-br text-[10px] font-semibold text-white",
                area.accentFrom,
                area.accentTo
              )}
            >
              {area.label[0]}
            </div>
            <span className="flex-1">{area.tKey ? t(area.tKey) : area.label}</span>
            {disabledAreas.has(area.id) && (
              <span className="text-[10px] text-amber-400">Em breve</span>
            )}
            {activeProduct === area.id && (
              <Check className="ml-auto h-3.5 w-3.5" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---- Workspace Switcher ----

function WorkspaceSwitcher({ compact }: { compact?: boolean }) {
  const user = useAuth((s) => s.user);
  const stores = useWorkspaceStore((s) => s.stores);
  const selectedStoreId = useWorkspaceStore((s) => s.selectedStoreId);
  const setSelectedStoreId = useWorkspaceStore((s) => s.setSelectedStoreId);
  const t = useT();

  const companyName = user?.company ?? user?.name ?? "";

  const selectedStore = React.useMemo(
    () => stores.find((s) => s.id === selectedStoreId) ?? null,
    [stores, selectedStoreId]
  );

  const displayName = selectedStore?.name ?? companyName;

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1 px-1 py-1">
        <button
          className={cn(
            "grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-muted to-muted/40 text-[11px] font-semibold text-muted-foreground transition hover:bg-muted/80"
          )}
          title={displayName}
        >
          {displayName?.[0] ?? "W"}
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full items-center gap-2.5 rounded-lg border border-border/60 bg-card/40 px-2.5 py-2 text-left transition hover:bg-card/70"
        >
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-gradient-to-br from-muted to-muted/40 text-[11px] font-semibold text-foreground">
            {displayName?.[0] ?? "W"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">
              {displayName}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {t("shell.workspace")}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t("shell.workspace")}
        </DropdownMenuLabel>
        {/* "All Stores" option */}
        <DropdownMenuItem
          onClick={() => setSelectedStoreId(null)}
          className="gap-2"
        >
          <div className="mr-1 grid h-6 w-6 place-items-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
            <Store className="h-3.5 w-3.5" />
          </div>
          <span className="flex-1">{t("shell.allStores")}</span>
          {!selectedStoreId && <Check className="ml-auto h-3.5 w-3.5" />}
        </DropdownMenuItem>
        {stores.length > 0 && <DropdownMenuSeparator />}
        {stores.map((store) => (
          <DropdownMenuItem
            key={store.id}
            onClick={() => setSelectedStoreId(store.id)}
            className="gap-2"
          >
            <div className="mr-1 grid h-6 w-6 place-items-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
              {store.name[0]}
            </div>
            <span className="flex-1 truncate">{store.name}</span>
            {selectedStoreId === store.id && (
              <Check className="ml-auto h-3.5 w-3.5" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---- Navigation ----

function NavList({
  sections,
  pathname,
  productConfig,
  onSelect,
}: {
  sections: NavSection[];
  pathname: string;
  productConfig: ProductConfig;
  onSelect: (route: string) => void;
}) {
  const t = useT();

  const getIsActive = (item: NavItem) => {
    if (item.route === "/admin" && pathname === "/admin") return true;
    if (item.route === "/admin" && pathname.startsWith("/admin/")) return false;
    return pathname === item.route;
  };

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {sections.map((section) => (
        <div key={section.id}>
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {section.tKey ? t(section.tKey) : section.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const isActive = getIsActive(item);
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.route)}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition",
                    isActive
                      ? cn(
                          "bg-primary/12",
                          productConfig.accentText
                        )
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className={cn(
                        "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full",
                        productConfig.accentText === "text-emerald-400"
                          ? "bg-emerald-400"
                          : productConfig.accentText === "text-amber-400"
                            ? "bg-amber-400"
                            : productConfig.accentText === "text-rose-400"
                              ? "bg-rose-400"
                              : "bg-primary"
                      )}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive && productConfig.accentText
                    )}
                  />
                  <span className="flex-1 text-left font-medium">
                    {item.tKey ? t(item.tKey) : item.label}
                  </span>
                  {item.badge && (
                    <Badge
                      className="h-[18px] min-w-[18px] px-1 text-[10px] font-semibold"
                      variant="default"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

// ---- Sidebar Body ----

function SidebarBody({
  sections,
  pathname,
  productConfig,
  activeProduct,
  collapsed,
  onNavSelect,
  onProductSelect,
}: {
  sections: NavSection[];
  pathname: string;
  productConfig: ProductConfig;
  activeProduct: ProductArea;
  collapsed?: boolean;
  onNavSelect: (route: string) => void;
  onProductSelect: (area: ProductArea) => void;
}) {
  const user = useAuth((s) => s.user);
  const t = useT();

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center gap-2 py-3">
        <XSymbol className="h-7 w-7 mb-1" />
        <ProductSwitcher
          activeProduct={activeProduct}
          onSelect={onProductSelect}
          compact
        />
        <WorkspaceSwitcher compact />
        <div className="mx-2 my-1 h-px w-6 bg-border/60" />
        <div className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="flex flex-col items-center gap-1 px-1">
            {sections.flatMap((s) => s.items).map((item) => {
              const isActive =
                item.route === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.route;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavSelect(item.route)}
                  title={item.tKey ? t(item.tKey) : item.label}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-lg transition",
                    isActive
                      ? cn(
                          "bg-primary/15",
                          productConfig.accentText
                        )
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
        {user && (
          <Avatar className="h-8 w-8 border border-border/60">
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-xs font-semibold text-white">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-border/60 px-4">
        <Logo />
      </div>
      <div className="px-3 pt-3 space-y-2">
        <ProductSwitcher
          activeProduct={activeProduct}
          onSelect={onProductSelect}
        />
        <WorkspaceSwitcher />
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        <NavList
          sections={sections}
          pathname={pathname}
          productConfig={productConfig}
          onSelect={onNavSelect}
        />
      </div>
      {user && (
        <div className="border-t border-border/60 p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <Avatar className="h-8 w-8 border border-border/60">
              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-xs font-semibold text-white">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                {user.name}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Top Bar ----

function TopBar({
  productConfig,
  onMenu,
}: {
  productConfig: ProductConfig;
  onMenu: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const setCommandOpen = useUi((s) => s.setCommandOpen);
  const setNotificationsOpen = useUi((s) => s.setNotificationsOpen);
  const toggleSidebar = useUi((s) => s.toggleSidebar);
  const t = useT();
  const [xpiaOpen, setXpiaOpen] = React.useState(false);

  return (
    <header className="safe-top sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur-xl sm:px-5">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenu}
        aria-label={t("nav.toggleMenu")}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="h-[18px] w-[18px]" />
      </Button>

      <button
        onClick={() => setCommandOpen(true)}
        className="group flex h-9 flex-1 items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 text-sm text-muted-foreground transition hover:bg-card/70 sm:max-w-md"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">{t("common.search")}</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] sm:flex">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="hidden h-9 px-2 sm:flex"
          onClick={() =>
            toast.info(t("shell.liveMode"), {
              description: t("shell.liveModeDesc"),
            })
          }
        >
          <span className="flex items-center gap-1 rounded-md bg-emerald-500/12 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />{" "}
            {t("common.live")}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setXpiaOpen(true)}
          aria-label="XpIA Assistant"
          title="Chat with XpIA"
        >
          <Sparkles className="h-[18px] w-[18px] text-primary" />
        </Button>
        <LanguageSwitcher />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotificationsOpen(true)}
          aria-label={t("shell.notifications")}
        >
          <Bell className="h-[18px] w-[18px]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-1 flex items-center gap-2 rounded-lg p-0.5 transition hover:bg-muted/60"
              aria-label="Profile menu"
            >
              <Avatar className="h-8 w-8 border border-border/60">
                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-xs font-semibold text-white">
                  {user ? initials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" /> {t("shell.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" /> {t("nav.settings")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" /> {t("shell.billing")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ShieldCheck className="mr-2 h-4 w-4" /> {t("shell.security")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" /> {t("nav.support")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-rose-400 focus:text-rose-400"
              onClick={() => {
                logout();
                toast.success(t("shell.signedOut"));
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> {t("shell.signout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <XpIAChat open={xpiaOpen} onClose={() => setXpiaOpen(false)} />
    </header>
  );
}

// ---- Command Palette ----

function CommandPalette({
  sections,
  pathname,
  productConfig,
  onNavSelect,
}: {
  sections: NavSection[];
  pathname: string;
  productConfig: ProductConfig;
  onNavSelect: (route: string) => void;
}) {
  const commandOpen = useUi((s) => s.commandOpen);
  const setCommandOpen = useUi((s) => s.setCommandOpen);
  const t = useT();

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandOpen]);

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder={t("cmd.placeholder")} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {sections.map((section) => (
          <CommandGroup
            key={section.id}
            heading={section.tKey ? t(section.tKey) : section.label}
          >
            {section.items.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => {
                  onNavSelect(item.route);
                  setCommandOpen(false);
                }}
                className={cn(pathname === item.route && "bg-primary/10")}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.tKey ? t(item.tKey) : item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

// ---- Notifications Panel (empty state) ----

function NotificationsPanel() {
  const notificationsOpen = useUi((s) => s.notificationsOpen);
  const setNotificationsOpen = useUi((s) => s.setNotificationsOpen);
  const t = useT();

  return (
    <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
      <SheetContent className="w-full border-border/60 bg-background/95 sm:max-w-md">
        <SheetTitle className="sr-only">Notifications</SheetTitle>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <h3 className="text-sm font-semibold">
                {t("shell.notifications")}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="scrollbar-thin flex-1 overflow-y-auto">
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
                <Bell className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("shell.noNotifications")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {t("shell.noNotificationsDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---- Main Dashboard Shell ----

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen } = useUi();

  // Derive product area from pathname
  const activeProduct = getProductAreaFromPath(pathname);

  const productConfig = PRODUCT_AREAS.find((p) => p.id === activeProduct) ?? PRODUCT_AREAS[0];
  const sections = NAV_MAP[activeProduct];

  const handleNavSelect = React.useCallback(
    (route: string) => {
      router.push(route);
      setSidebarOpen(false);
    },
    [router, setSidebarOpen]
  );

  const handleProductSelect = React.useCallback(
    (_area: ProductArea) => {
      setSidebarOpen(false);
      // Navigation is handled inside ProductSwitcher
    },
    [setSidebarOpen]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border/60 bg-sidebar/50 backdrop-blur-xl transition-[width] duration-200 lg:block",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarBody
          sections={sections}
          pathname={pathname}
          productConfig={productConfig}
          activeProduct={activeProduct}
          collapsed={sidebarCollapsed}
          onNavSelect={handleNavSelect}
          onProductSelect={handleProductSelect}
        />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-72 border-border/60 bg-sidebar p-0"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody
            sections={sections}
            pathname={pathname}
            productConfig={productConfig}
            activeProduct={activeProduct}
            onNavSelect={handleNavSelect}
            onProductSelect={handleProductSelect}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar productConfig={productConfig} onMenu={() => setSidebarOpen(true)} />
        <main className="scrollbar-thin flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette
        sections={sections}
        pathname={pathname}
        productConfig={productConfig}
        onNavSelect={handleNavSelect}
      />
      <NotificationsPanel />
    </div>
  );
}