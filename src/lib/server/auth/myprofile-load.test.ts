import { describe, expect, it, vi } from 'vitest';

const limitMock = vi.hoisted(() => vi.fn());
const whereMock = vi.hoisted(() => vi.fn(() => ({ limit: limitMock })));
const fromMock = vi.hoisted(() => vi.fn(() => ({ where: whereMock })));
const selectMock = vi.hoisted(() => vi.fn(() => ({ from: fromMock })));

vi.mock('$lib/server/db/client', () => ({ db: { select: selectMock } }));

import { loadMyProfile } from './myprofile-load';

const USER_ID = 'a1b2c3d4-0000-0000-0000-000000000000';
const EMAIL = 'rina@example.com';

describe('loadMyProfile', () => {
	it('returns profile: null when the DB query returns no rows (no throw)', async () => {
		limitMock.mockResolvedValueOnce([]);
		const result = await loadMyProfile(USER_ID, EMAIL);
		expect(result.user.id).toBe(USER_ID);
		expect(result.user.email).toBe(EMAIL);
		expect(result.profile).toBeNull();
		expect(selectMock).toHaveBeenCalled();
		expect(fromMock).toHaveBeenCalled();
		expect(whereMock).toHaveBeenCalled();
		expect(limitMock).toHaveBeenCalledWith(1);
	});

	it('returns the profile row when the DB query returns a row', async () => {
		const row = {
			id: USER_ID,
			displayName: 'Rina Aulia',
			avatarUrl: 'https://example.com/a.jpg',
			createdAt: new Date()
		};
		limitMock.mockResolvedValueOnce([row]);
		const result = await loadMyProfile(USER_ID, EMAIL);
		expect(result.profile).toEqual(row);
	});

	it('coerces undefined email to null', async () => {
		limitMock.mockResolvedValueOnce([]);
		const result = await loadMyProfile(USER_ID, undefined);
		expect(result.user.email).toBeNull();
	});

	it('returns profile: null when the DB query throws (no throw)', async () => {
		limitMock.mockRejectedValueOnce(new Error('connection lost'));
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const result = await loadMyProfile(USER_ID, EMAIL);
		expect(result.profile).toBeNull();
		expect(errSpy).toHaveBeenCalled();
		errSpy.mockRestore();
	});
});
