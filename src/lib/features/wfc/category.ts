export const WFC_CATEGORY_OPTIONS = [
	{
		value: "wfc-friendly",
		label: "WFC-friendly",
		description: "Memang nyaman untuk duduk lama, ada colokan/Wi-Fi, dan cafe tidak keberatan."
	},
	{
		value: "meetup-friendly",
		label: "Meetup-friendly",
		description: "Cocok untuk ngobrol 1–2 jam, tapi bukan kerja seharian."
	},
	{
		value: "quick-visit",
		label: "Quick visit",
		description: "Bagus, tetapi lebih cocok untuk ngopi singkat karena mengandalkan turnover meja."
	}
] as const;

export type WfcCategory = (typeof WFC_CATEGORY_OPTIONS)[number]["value"];
export const WFC_CATEGORY_VALUES = WFC_CATEGORY_OPTIONS.map(({ value }) => value) as WfcCategory[];

export function isWfcCategory(value: string): value is WfcCategory {
	return WFC_CATEGORY_VALUES.includes(value as WfcCategory);
}

export function getWfcCategory(value: WfcCategory) {
	return WFC_CATEGORY_OPTIONS.find((option) => option.value === value) ?? WFC_CATEGORY_OPTIONS[0];
}
