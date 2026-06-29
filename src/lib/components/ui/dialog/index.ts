import Root from "./dialog.svelte";
import Overlay from "./dialog-overlay.svelte";
import Content from "./dialog-content.svelte";
import Header from "./dialog-header.svelte";
import Footer from "./dialog-footer.svelte";
import Title from "./dialog-title.svelte";
import Description from "./dialog-description.svelte";
import Trigger from "./dialog-trigger.svelte";
import Close from "./dialog-close.svelte";
import { dialogContentVariants, type DialogSize } from "./dialog.svelte";

export {
	Root,
	Overlay,
	Content,
	Header,
	Footer,
	Title,
	Description,
	Trigger,
	Close,
	dialogContentVariants,
	type DialogSize
};

export const Dialog = {
	Root,
	Overlay,
	Content,
	Header,
	Footer,
	Title,
	Description,
	Trigger,
	Close
};
