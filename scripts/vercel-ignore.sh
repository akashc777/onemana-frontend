#!/usr/bin/env bash
# Vercel's Ignored Build Step (vercel.json ignoreCommand): exit 0 skips the
# build, exit 1 builds. A push that changes only tests, e2e, design, scripts,
# GitHub workflows or Markdown since the last deploy is skipped, to stay inside
# the free plan.
#
# Whenever this can't tell, it builds. Vercel clones shallow, so after a long
# push the last deploy's commit may not be in the clone at all; `git diff`
# against it then fails with "bad object", and Vercel counts any exit other
# than 0 or 1 as a failed deployment.
#
# The logic lives here, not in vercel.json, because Vercel refuses an
# ignoreCommand longer than 256 characters as an invalid project config.
prev="${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}"
git cat-file -e "${prev}^{commit}" 2>/dev/null || exit 1
# The legal pages' words are Markdown the site builds in (lib/legalPages.ts):
# a change to them always builds.
git diff --quiet "$prev" HEAD -- content/legal || exit 1
if git diff --quiet "$prev" HEAD -- . \
  ':(exclude)*.test.ts' ':(exclude)*.test.tsx' ':(exclude)*.test.mjs' \
  ':(exclude)e2e' ':(exclude)design' ':(exclude)scripts' ':(exclude).github' ':(exclude)*.md'; then
  exit 0
fi
exit 1
