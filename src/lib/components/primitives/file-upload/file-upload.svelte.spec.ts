import { describe, expect, it, vi, beforeEach } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import FileUpload from "./file-upload.svelte";

function makeFile(name: string, type: string, size: number): File {
	return new File([new Uint8Array(size).fill(1)], name, { type });
}

// Stub URL.createObjectURL so the preview path is harmless in tests.
beforeEach(() => {
	vi.stubGlobal("URL", {
		...URL,
		createObjectURL: vi.fn(() => "blob:fake-preview"),
		revokeObjectURL: vi.fn()
	});
});

describe("FileUpload validation", () => {
	it("shows an external `error` prop (e.g. from useForm/zod) without uploading", async () => {
		const onChange = vi.fn();
		render(FileUpload, { error: "File wajib diisi." });

		const alert = await page.getByRole("alert").element();
		expect(alert.textContent).toContain("File wajib diisi.");
		// No file interaction happened, so onChange must never fire.
		expect(onChange).not.toHaveBeenCalled();
	});

	it("rejects a file whose MIME type is not in the accept list", async () => {
		const onChange = vi.fn();
		render(FileUpload, { onChange });

		// text/plain is not in the default accept (images + pdf).
		await page.getByTestId("file-upload-input").upload(makeFile("notes.txt", "text/plain", 100));

		expect((await page.getByRole("alert").element()).textContent).toContain(
			"Format file tidak didukung."
		);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("rejects a file larger than maxBytes", async () => {
		render(FileUpload, { maxBytes: 100 });
		await page.getByTestId("file-upload-input").upload(makeFile("big.png", "image/png", 500));

		expect((await page.getByRole("alert").element()).textContent).toContain("Ukuran file melebihi");
	});
});

describe("FileUpload presigned upload", () => {
	it("shows an existing image when the controlled value arrives after mount", async () => {
		const view = render(FileUpload, {
			accept: "image/png,image/jpeg,image/webp,image/avif",
			value: ""
		});
		const existingUrl = "https://cdn.example.com/banners/articles/old-cover.webp";

		await view.rerender({
			accept: "image/png,image/jpeg,image/webp,image/avif",
			value: existingUrl
		});

		const thumbnail = await page.getByRole("button", { name: "Perbesar file" }).element();
		expect(thumbnail.querySelector("img")?.getAttribute("src")).toBe(existingUrl);
	});

	it("uploads via presigned PUT and calls onChange with publicUrl on success", async () => {
		const getPresignedUrl = vi.fn().mockResolvedValue({
			presignedUrl: "https://r2.example.com/put",
			publicUrl: "https://cdn.example.com/test/abc.png"
		});
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
		const onChange = vi.fn();

		render(FileUpload, { getPresignedUrl, onChange });

		await page.getByTestId("file-upload-input").upload(makeFile("photo.png", "image/png", 500));

		await vi.waitFor(() =>
			expect(onChange).toHaveBeenCalledWith("https://cdn.example.com/test/abc.png")
		);

		expect(getPresignedUrl).toHaveBeenCalledWith({
			filename: "photo.png",
			contentType: "image/png"
		});
		expect(vi.mocked(fetch)).toHaveBeenCalledWith(
			"https://r2.example.com/put",
			expect.objectContaining({ method: "PUT" })
		);
	});

	it("shows an error and does not call onChange when the upload fails", async () => {
		const getPresignedUrl = vi.fn().mockResolvedValue({
			presignedUrl: "https://r2.example.com/put",
			publicUrl: "https://cdn.example.com/test/abc.png"
		});
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
		const onChange = vi.fn();

		render(FileUpload, { getPresignedUrl, onChange });

		await page.getByTestId("file-upload-input").upload(makeFile("photo.png", "image/png", 500));

		await vi.waitFor(() => expect(onChange).not.toHaveBeenCalled());
		expect((await page.getByRole("alert").element()).textContent).toContain("Upload gagal");
	});

	it("renders a file icon + name for non-image uploads", async () => {
		const getPresignedUrl = vi.fn().mockResolvedValue({
			presignedUrl: "https://r2.example.com/put",
			publicUrl: "https://cdn.example.com/docs/report.pdf"
		});
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
		render(FileUpload, { getPresignedUrl, value: "https://cdn.example.com/docs/report.pdf" });

		// A .pdf value is non-image → show file name (exact), not an <img>.
		const name = await page.getByText("report.pdf", { exact: true }).element();
		expect(name.textContent).toBe("report.pdf");
	});
});
