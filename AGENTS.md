# AGENTS.md

General guidance for AI agents working in this repo. Most of this file is a **Basecamp
lander-task workflow** intended for Cursor **Cloud Agents** (triggered from mobile via
the cursor.com/agents PWA or Slack `@cursor`).

> Local IDE users can run the equivalent slash command in
> `.cursor/commands/basecamp-task.md`. The workflow below is the cloud-safe version: it
> reads Basecamp credentials from **environment secrets** (not the local
> `.cursor/basecamp.env`, which is gitignored and absent in cloud), refreshes the access
> token in-memory each run, and relies on the platform's GitHub integration to open the
> PR (no macOS `open`).

---

## Basecamp Lander Task (cloud workflow)

Trigger it with a prompt like: **"Do the Basecamp task: `<basecamp-link>`"**.

### Required environment secrets

Configure these in the Cloud Agent **Secrets** tab (dashboard). Do NOT commit them.

- `BASECAMP_ACCOUNT_ID` — e.g. `1757560`
- `BASECAMP_USER_AGENT` — e.g. `you@example.com` (Basecamp requires a UA)
- `BASECAMP_CLIENT_ID` — OAuth app client id
- `BASECAMP_CLIENT_SECRET` — OAuth app client secret
- `BASECAMP_REFRESH_TOKEN` — long-lived refresh token

The short-lived access token is **not** stored; it is minted at runtime from the
refresh token (so the ~2-week expiry never matters).

### 1. Mint a fresh Basecamp access token

```bash
BASECAMP_TOKEN=$(curl -s -X POST \
  "https://launchpad.37signals.com/authorization/token?type=refresh&refresh_token=$BASECAMP_REFRESH_TOKEN&client_id=$BASECAMP_CLIENT_ID&client_secret=$BASECAMP_CLIENT_SECRET" \
  -H "User-Agent: $BASECAMP_USER_AGENT" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
[ -n "$BASECAMP_TOKEN" ] || { echo "Failed to mint Basecamp token" >&2; exit 1; }
```

### 2. Read the task (only the matching comment)

Parse the Basecamp 2 link:
`https://basecamp.com/<account_id>/projects/<project_id>/todos/<todo_id>#comment_<comment_id>`
- `<todo_id>` → `<BC_ID>` (used for branch + commit messages)
- `<comment_id>` → the **specific comment** that defines the task

```bash
curl -s \
  -H "Authorization: Bearer $BASECAMP_TOKEN" \
  -H "User-Agent: $BASECAMP_USER_AGENT" \
  "https://basecamp.com/$BASECAMP_ACCOUNT_ID/api/v1/projects/<project_id>/todos/<todo_id>.json" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); c=[x for x in d['comments'] if x['id']==<comment_id>]; print(c[0]['content'] if c else 'NO MATCH')"
```

- Use **only** the comment whose `id` equals `<comment_id>`. Ignore the todo body and
  all other comments. If `NO MATCH`, stop and report — do not guess.
- If there is no `#comment_...` fragment, use the todo's own `content`.
- `content` is HTML; strip tags / decode entities before parsing.

Parse from the task text (fields vary per task; only some may be present):
- **Source / Clone** — the file or folder to edit or copy (relative to repo root).
- **Task** — the change to make (e.g. "Update H2 from X to Y").
- **Figma link** — design URL, if any.
- **Scope** — e.g. "ATF only", "full page".

### 3. Read the Figma design (only if a Figma link is present)

Use the **Figma MCP** (must be enabled for the cloud agent). If absent or no Figma
link, skip. Do not invent designs.

### 4. Create the working branch

```bash
TS=$(date +%y%m%d%H%M)
BRANCH="feature/short-identifier/bc-<BC_ID>-$TS"
git checkout main && git pull --ff-only origin main
git checkout -b "$BRANCH"
```

### 5. Do the work + commit (one commit per file)

- Make the edit / clone exactly as the task specifies. For a "Clone", match existing
  naming (`input_based_landers/<product>/index_vN.{html,css}`, increment `N`). For an
  in-place edit, modify the named Source file directly.
- Preserve boilerplate (GTM/analytics, `<meta robots>`, font preconnects, includes).
- Commit each changed file separately:

```bash
git add <path> && git commit -m "feat: <create|modify> <path> (BC#<BC_ID>)"
```

### 6. Push and open the PR

Push the branch and open a pull request into `main`. In Cloud Agents the Cursor GitHub
App handles auth (clone, push, signed commits) — never read a token or use macOS `open`.
Use the pre-authenticated `gh` CLI to create the PR, then **report the PR URL** in the
final summary (tap it on mobile).

```bash
git push -u origin "$BRANCH"

PR_URL=$(gh pr create \
  --base main \
  --head "$BRANCH" \
  --title "feat: <product> <variant> (BC#<BC_ID>)" \
  --body "Implements Basecamp task BC#<BC_ID> (<scope>).

Basecamp: <the full basecamp link>")

echo "PR: $PR_URL"
```

If `gh` is unavailable in the environment, fall back to the GitHub REST API using the
token from `gh auth token` (do not hardcode or echo it). Report the resulting PR URL.

### 7. Report back

Summarize: parsed task fields, files changed, branch name, and the **PR URL**.
