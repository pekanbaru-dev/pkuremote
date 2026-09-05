import { describe, expect, it } from "vitest";
import {
	parseArticleTags,
	validateArticleForm,
	type ArticleFormValues
} from "./article-form-schema";

const completeForm: ArticleFormValues = {
	title: "Judul artikel",
	slug: "judul-artikel",
	excerpt: "Ringkasan artikel",
	body: "<p>Isi artikel</p>",
	categoryId: "category-id",
	coverImageUrl: "https://example.com/cover.webp",
	tags: ""
};

describe("article form schema", () => {
	it("requires review fields while keeping title and body in the shared contract", () => {
		const errors = validateArticleForm({
			...completeForm,
			slug: "",
			categoryId: "",
			coverImageUrl: ""
		});

		expect(errors).toEqual({
			slug: "Slug wajib diisi.",
			categoryId: "Kategori wajib dipilih.",
			coverImageUrl: "Gambar sampul wajib diisi."
		});
	});

	it("keeps tags optional and normalizes comma-separated values", () => {
		expect(validateArticleForm(completeForm)).toEqual({});
		expect(parseArticleTags("kuliner, komunitas, kuliner, ")).toEqual(["kuliner", "komunitas"]);
	});
});
