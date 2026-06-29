import Root from "./drawer.svelte";
import Content from "./drawer-content.svelte";
import Header from "./drawer-header.svelte";
import Footer from "./drawer-footer.svelte";
import Title from "./drawer-title.svelte";
import Description from "./drawer-description.svelte";
import Trigger from "./drawer-trigger.svelte";
import Close from "./drawer-close.svelte";
import { drawerContentVariants, type DrawerSide } from "./drawer.svelte";

export {
	Root,
	Content,
	Header,
	Footer,
	Title,
	Description,
	Trigger,
	Close,
	drawerContentVariants,
	type DrawerSide
};

export const Drawer = {
	Root,
	Content,
	Header,
	Footer,
	Title,
	Description,
	Trigger,
	Close
};
