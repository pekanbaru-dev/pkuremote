import { afterEach, describe, expect, it, vi } from "vitest";

const postgresMock = vi.fn();
const drizzleMock = vi.fn(() => ({ __drizzle: true }));

vi.mock("$env/dynamic/private", () => ({
	env: new Proxy(
		{},
		{
			get: (_target, prop: string) => process.env[prop]
		}
	)
}));
vi.mock("postgres", () => ({ default: postgresMock }));
vi.mock("drizzle-orm/postgres-js", () => ({ drizzle: drizzleMock }));

async function loadClient() {
	const mod = await import("./client");
	return mod;
}

const originalUrl = process.env.DATABASE_URL;

describe("db/client (lazy)", () => {
	afterEach(() => {
		vi.resetModules();
		postgresMock.mockClear();
		drizzleMock.mockClear();
		if (originalUrl === undefined) delete process.env.DATABASE_URL;
		else process.env.DATABASE_URL = originalUrl;
	});

	it("does not throw at import time when DATABASE_URL is missing", async () => {
		delete process.env.DATABASE_URL;
		await expect(loadClient()).resolves.toBeDefined();
		expect(postgresMock).not.toHaveBeenCalled();
		expect(drizzleMock).not.toHaveBeenCalled();
	});

	it("does not open a postgres connection at import time even when DATABASE_URL is set", async () => {
		process.env.DATABASE_URL = "postgresql://example.test/db";
		await loadClient();
		expect(postgresMock).not.toHaveBeenCalled();
		expect(drizzleMock).not.toHaveBeenCalled();
	});

	it("throws the documented error when a method is accessed and DATABASE_URL is missing", async () => {
		delete process.env.DATABASE_URL;
		const { db } = await loadClient();
		expect(() => db.select).toThrow(/DATABASE_URL is not set/);
		expect(postgresMock).not.toHaveBeenCalled();
		expect(drizzleMock).not.toHaveBeenCalled();
	});

	it("opens the connection lazily and caches it on first access", async () => {
		process.env.DATABASE_URL = "postgresql://example.test/db";
		const { db } = await loadClient();
		const first = db.select;
		const second = db.select;
		expect(first).toBe(second);
		expect(postgresMock).toHaveBeenCalledTimes(1);
		expect(postgresMock).toHaveBeenCalledWith("postgresql://example.test/db", { prepare: false });
		expect(drizzleMock).toHaveBeenCalledTimes(1);
	});
});
