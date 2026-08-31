#!/usr/bin/env bash
#
# Post-deploy smoke test. Verifies a live deployment actually serves, rather
# than only that the container started.
#
# This exists because of the 2026-08-31 outage (issues #60 / #61): production
# ran against a database missing migrations 0001/0002, and the deploy reported
# success. `/` and `/events` stayed 200 the whole time because they only touch
# tables from 0000 — so any check that pings the homepage anonymously would
# have passed while login, /blog and every logged-in page returned 500.
#
# The two checks that matter are therefore /healthz (schema drift) and the
# bogus-session-cookie probe (exercises the `profiles` join that anonymous
# requests skip).
#
# Usage:
#   scripts/smoke-test.sh [base-url]
#
#   scripts/smoke-test.sh                          # defaults to production
#   scripts/smoke-test.sh http://localhost:4173    # against a local preview
#
# Exits non-zero if any check fails.

set -uo pipefail

SITE="${1:-${SITE:-https://pkubersua.com}}"
SITE="${SITE%/}"
BOOT_ATTEMPTS="${BOOT_ATTEMPTS:-30}"
BOOT_DELAY="${BOOT_DELAY:-5}"

echo "Smoke testing $SITE"

# Give a just-replaced container time to answer before judging it.
for attempt in $(seq 1 "$BOOT_ATTEMPTS"); do
	code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SITE/" || echo 000)
	[ "$code" = "200" ] && break
	echo "  waiting for app to come up… (attempt $attempt/$BOOT_ATTEMPTS, last=$code)"
	sleep "$BOOT_DELAY"
done

fail=0

# check <name> <expected-status> <url> [extra curl args…]
check() {
	local name=$1 expected=$2 url=$3
	shift 3
	local code
	code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$@" "$url" || echo 000)
	if [ "$code" = "$expected" ]; then
		echo "  ok    $name ($code)"
	else
		echo "  FAIL  $name — expected $expected, got $code"
		fail=1
	fi
}

echo "== schema / migration health =="
check "/healthz" 200 "$SITE/healthz"

echo "== public routes =="
check "/" 200 "$SITE/"
check "/events" 200 "$SITE/events"
check "/blog" 200 "$SITE/blog"
check "/login" 200 "$SITE/login"
check "/sitemap.xml" 200 "$SITE/sitemap.xml"

echo "== session path (regression probe for issues #60 / #61) =="
# A garbage token must resolve to "no session", never a 500.
check "/ with session cookie" 200 "$SITE/" -H 'Cookie: session=smoke-test-probe'
check "/login with session cookie" 200 "$SITE/login" -H 'Cookie: session=smoke-test-probe'

echo "== auth guards =="
# Guarded route, no session -> redirect to login (302), not 500.
check "/myprofile redirects" 302 "$SITE/myprofile"
# Callback with no code/state -> redirect to the login error page, not 500.
check "/auth/callback guards" 303 "$SITE/auth/callback"

if [ "$fail" -ne 0 ]; then
	echo "Smoke test FAILED against $SITE."
	echo "Check $SITE/healthz and the container logs. If migrations are pending,"
	echo "apply them — see DEPLOY.md, \"Database migrations\"."
	exit 1
fi

echo "All smoke checks passed."
