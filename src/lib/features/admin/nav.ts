import type { Component } from "svelte";
import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
import CalendarDays from "@lucide/svelte/icons/calendar-days";
import Tags from "@lucide/svelte/icons/tags";
import FileText from "@lucide/svelte/icons/file-text";

/**
 * A single admin navigation entry. `icon` is a Lucide icon component.
 */
export type NavItem = {
	label: string;
	href: string;
	icon: Component;
};

/**
 * The single source of truth for the admin sidebar navigation. Both the
 * persistent desktop sidebar and the mobile sheet render from this list, so
 * they never drift. Add a section here (one line) as its route lands.
 */
export const NAV_ITEMS: NavItem[] = [
	{ label: "Dashboard", href: "/admin", icon: LayoutDashboard },
	{ label: "Events", href: "/admin/events", icon: CalendarDays },
	{ label: "Kategori", href: "/admin/categories", icon: Tags },
	{ label: "Artikel", href: "/admin/articles", icon: FileText }
];

/**
 * Whether `href` is the active nav section for the current `pathname`.
 *
 * The root item (`/admin`) matches only on an exact path so it isn't lit up on
 * every admin page; other items match the exact path OR any nested child
 * (`/admin/events` stays active on `/admin/events/new`).
 */
export function isNavItemActive(pathname: string, href: string): boolean {
	if (href === "/admin") return pathname === "/admin";
	return pathname === href || pathname.startsWith(`${href}/`);
}
