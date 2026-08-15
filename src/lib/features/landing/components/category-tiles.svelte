<script lang="ts">
	import CalendarDays from "@lucide/svelte/icons/calendar-days";
	import Users from "@lucide/svelte/icons/users";
	import Code2 from "@lucide/svelte/icons/code-2";
	import PenTool from "@lucide/svelte/icons/pen-tool";
	import Rocket from "@lucide/svelte/icons/rocket";
	import Camera from "@lucide/svelte/icons/camera";

	const categories = [
		["Semua Event", CalendarDays, "emerald"],
		["Teknologi", Code2, "violet"],
		["Bisnis", Rocket, "orange"],
		["Pendidikan", CalendarDays, "teal"],
		["Komunitas", Users, "purple"],
		["Seni & Budaya", PenTool, "amber"],
		["Hobi", Camera, "pink"]
	] as const;

	const categoryStyles = {
		emerald: "bg-[#073d3d] text-white group-hover:bg-[#0a5350]",
		violet: "bg-[#e6f2f0] text-[#0a5350] group-hover:bg-[#0a5350] group-hover:text-white",
		orange: "bg-[#e6f2f0] text-[#0a5350] group-hover:bg-[#0a5350] group-hover:text-white",
		teal: "bg-[#e6f2f0] text-[#0a5350] group-hover:bg-[#0a5350] group-hover:text-white",
		purple: "bg-[#e6f2f0] text-[#0a5350] group-hover:bg-[#0a5350] group-hover:text-white",
		amber: "bg-[#e6f2f0] text-[#0a5350] group-hover:bg-[#0a5350] group-hover:text-white",
		pink: "bg-[#e6f2f0] text-[#0a5350] group-hover:bg-[#0a5350] group-hover:text-white"
	} as const;
</script>

<div
	class="relative z-10 -mt-1 grid overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_16px_40px_rgba(7,61,61,0.14)] lg:-mt-11 sm:grid-cols-2 lg:grid-cols-7"
>
	{#each categories as [label, Icon, tone] (label)}
		<a
			href="#events"
			class={[
				"group grid min-h-[88px] place-items-center gap-1.5 border-b border-r border-slate-100 p-3 text-center text-xs font-semibold text-ink transition",
				tone === "emerald" ? "border-b-2 border-b-[#073d3d] bg-[#f7fbfa]" : "hover:bg-[#fffdf5]"
			]}
		>
			<span
				class={[
					"grid h-9 w-9 place-items-center rounded-xl transition duration-200 group-hover:scale-105",
					categoryStyles[tone]
				]}><Icon size={20} /></span
			>
			{label}
		</a>
	{/each}
</div>
