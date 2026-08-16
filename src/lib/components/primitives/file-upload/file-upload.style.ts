import { cn } from "$lib/utils.js";
import { tv, type VariantProps } from "tailwind-variants";
import type { HTMLInputAttributes } from "svelte/elements";

export const dropZoneVariants = tv({
	base: cn(
		"group relative flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
		"hover:border-primary hover:bg-primary/5",
		"disabled:cursor-not-allowed disabled:opacity-50"
	),
	variants: {
		dragging: {
			false: undefined,
			true: "border-primary bg-primary/10 scale-[1.01]"
		},
		error: {
			false: "border-outline-variant",
			true: "border-danger bg-danger/5"
		}
	},
	defaultVariants: {
		dragging: false,
		error: false
	}
});

export type DropZoneProps = VariantProps<typeof dropZoneVariants>;

export type PresignedResult = { presignedUrl: string; publicUrl: string };

export type FileUploadProps = Omit<DropZoneProps, "error"> &
	Omit<HTMLInputAttributes, "accept" | "value" | "name" | "disabled"> & {
		value?: string;
		onChange?: (url: string) => void;
		getPresignedUrl?: (file: { filename: string; contentType: string }) => Promise<PresignedResult>;
		onRemove?: () => void;
		accept?: string;
		maxBytes?: number;
		disabled?: boolean;
		name?: string;
		label?: string;
		class?: string;
		/** External validation error (e.g. from useForm/zod). Shown alongside
		 * internal validation/upload errors. Cleared when a new file is selected. */
		error?: string | null;
	};
