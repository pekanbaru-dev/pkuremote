declare module "toastify-js" {
	interface ToastifyOptions {
		text?: string;
		duration?: number;
		destination?: string;
		newWindow?: boolean;
		close?: boolean;
		gravity?: "top" | "bottom";
		position?: "left" | "center" | "right";
		backgroundColor?: string;
		stopOnFocus?: boolean;
		onClick?: () => void;
		offset?: { x: number | string; y: number | string };
		escapeMarkup?: boolean;
		className?: string;
		style?: Record<string, string>;
		node?: HTMLElement;
		selector?: string | HTMLElement;
	}

	interface ToastifyInstance {
		showToast(): void;
		hideToast(): void;
	}

	function Toastify(options: ToastifyOptions): ToastifyInstance;
	export default Toastify;
}

declare module "toastify-js/src/toastify.css" {}
