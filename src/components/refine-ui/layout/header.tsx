import { UserAvatar } from "@/components/refine-ui/layout/user-avatar";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {cn} from "@/lib/utils";
import { useGetIdentity, useLogout, useRefineOptions } from "@refinedev/core";
import { ActivityIcon, LogOutIcon } from "lucide-react";
import type { User } from "@/types";
import {triggerManualServiceCheck} from "@/lib/infrastructure.ts";

export const Header = () => {
  const { isMobile } = useSidebar();

  return <>{isMobile ? <MobileHeader /> : <DesktopHeader />}</>;
};

function DesktopHeader() {
  return (
    <header
      className={cn(
        "sticky",
        "top-0",
        "flex",
        "h-16",
        "shrink-0",
        "items-center",
        "gap-4",
        "border-b",
        "border-border",
        "bg-sidebar",
        "pr-3",
        "justify-end",
        "z-40"
      )}
    >
      <ThemeToggle />
      <UserDropdown />
    </header>
  );
}

function MobileHeader() {
  const { open, isMobile } = useSidebar();

  const { title } = useRefineOptions();

  return (
    <header
      className={cn(
        "sticky",
        "top-0",
        "flex",
        "h-12",
        "shrink-0",
        "items-center",
        "gap-2",
        "border-b",
        "border-border",
        "bg-sidebar",
        "pr-3",
        "justify-between",
        "z-40"
      )}
    >
      <SidebarTrigger
        className={cn("text-muted-foreground", "rotate-180", "ml-1", {
          "opacity-0": open,
          "opacity-100": !open || isMobile,
          "pointer-events-auto": !open || isMobile,
          "pointer-events-none": open && !isMobile,
        })}
      />

      <div
        className={cn(
          "whitespace-nowrap",
          "flex",
          "flex-row",
          "h-full",
          "items-center",
          "justify-start",
          "gap-2",
          "transition-discrete",
          "duration-200",
          "max-sm:hidden",
          {
            "pl-3": !open,
            "pl-5": open,
          }
        )}
      >
        <div>{title.icon}</div>
        <h2
          className={cn(
            "text-sm",
            "font-bold",
            "transition-opacity",
            "duration-200",
            "max-sm:hidden",
            {
              "opacity-0": !open,
              "opacity-100": open,
            }
          )}
        >
          {title.text}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserDropdown />
      </div>
    </header>
  );
}

const UserDropdown = () => {
    const { data: user } = useGetIdentity<User>();
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <UserAvatar />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <div className="px-3 py-2">
                    <p className="text-sm font-semibold">
                        {user?.name ?? "Signed in user"}
                    </p>
                    {user?.email && (
                        <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                        </p>
                    )}
                    {user?.role && (
                        <span className="mt-2 inline-flex items-center rounded-sm bg-muted px-2 py-0.5 text-xs font-semibold uppercase text-muted-foreground">
                    {user.role}
                </span>
                    )}
                </div>
                <DropdownMenuSeparator />

                {/* ========================================== */}
                {/* 🚀 1. UPDATED "CHECK SITE SERVICES" ITEM   */}
                {/* ========================================== */}
                <DropdownMenuItem
                    onClick={() => {
                        triggerManualServiceCheck();
                    }}
                    className="cursor-pointer flex items-center"
                >
                    {/* Standardised lucide icon scale and right margin spacing */}
                    <ActivityIcon className="text-muted-foreground w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Check Site Services</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* ========================================== */}
                {/* ⚙️ 2. PERFECTLY ALIGNED LOGOUT ITEM       */}
                {/* ========================================== */}
                <DropdownMenuItem
                    onClick={() => {
                        logout();
                    }}
                    className="cursor-pointer flex items-center"
                >
                    {/* Added explicit w-4 h-4 mr-2 classes to line up exactly with row 1 */}
                    <LogOutIcon
                        className={cn("w-4 h-4 mr-2 text-destructive", "hover:text-destructive")}
                    />
                    <span className={cn("text-sm font-medium text-destructive", "hover:text-destructive")}>
                {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    );
};

Header.displayName = "Header";
MobileHeader.displayName = "MobileHeader";
DesktopHeader.displayName = "DesktopHeader";
