<script lang="ts" module>
	import { getContext, setContext } from "svelte";

	export type PanelContextValue = {
		isSidebarCollapsed: boolean;
		toggleSidebar: () => void;
		setSidebarCollapsed: (collapsed: boolean) => void;
		sidebarTitle: string;
		setSidebarTitle: (title: string) => void;
	};

	const PANEL_CONTEXT_KEY = Symbol("panel-context");

	export type PanelProviderProps = {
		children: Snippet;
	};

	export function setPanelContext(value: PanelContextValue): void {
		setContext(PANEL_CONTEXT_KEY, value);
	}

	export function usePanel(): PanelContextValue {
		const ctx = getContext<PanelContextValue | undefined>(PANEL_CONTEXT_KEY);
		if (!ctx) {
			throw new Error("usePanel must be used within a PanelProvider");
		}
		return ctx;
	}
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	let { children }: PanelProviderProps = $props();

	let isSidebarCollapsed = $state(false);
	let sidebarTitle = $state("Dashboard");

	function toggleSidebar() {
		isSidebarCollapsed = !isSidebarCollapsed;
	}

	function setSidebarCollapsed(collapsed: boolean) {
		isSidebarCollapsed = collapsed;
	}

	function setSidebarTitle(title: string) {
		sidebarTitle = title;
	}

	setPanelContext({
		get isSidebarCollapsed() {
			return isSidebarCollapsed;
		},
		toggleSidebar,
		setSidebarCollapsed,
		get sidebarTitle() {
			return sidebarTitle;
		},
		setSidebarTitle
	});
</script>

{@render children()}
