// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}

		/**
		 * The authenticated user, resolved from the `sessions` table in
		 * `hooks.server.ts` (joined to `users` + `profiles`). App-owned type.
		 */
		interface User {
			id: string;
			email: string;
			displayName: string | null;
			avatarUrl: string | null;
		}

		interface Locals {
			user: App.User | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
