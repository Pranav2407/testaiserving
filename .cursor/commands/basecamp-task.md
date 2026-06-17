# Basecamp Task (Basecamp → MR)

End-to-end workflow for a Basecamp lander task. The text after the command is the
**Basecamp task link** (and optionally extra notes). Example:

```
/basecamp-task https://basecamp.com/1757560/projects/19848927/todos/516887696#comment_973297051
```

Execute the steps below in order. Do not skip steps. Stop and ask the user only if a
step is genuinely blocked (e.g. Basecamp/Figma access fails or the task is ambiguous).

---

## 1. Read the Basecamp task

The link uses the **Basecamp 2** URL format. Parse it into parts:

```
https://basecamp.com/<account_id>/projects/<project_id>/todos/<todo_id>#comment_<comment_id>
```

Example: `https://basecamp.com/1757560/projects/19848927/todos/516887696#comment_973297051`
- `<account_id>` = `1757560`
- `<project_id>` = `19848927`
- `<todo_id>`    = `516887696`  → this is `<BC_ID>` (used for the branch + commit messages)
- `<comment_id>` = `973297051` → the **specific comment** that defines the task

Fetch the task via the **Basecamp 2 (BCX) REST API** using `curl` with credentials
sourced from `.cursor/basecamp.env`. Do NOT use the `ag-mcp` MCP — this curl approach
is the source of truth (see `.cursor/basecamp.env.example` for the required vars).

Run from the repo root (substitute the ids parsed from the link):

```bash
set -a && source .cursor/basecamp.env && set +a   # loads BASECAMP_TOKEN / _ACCOUNT_ID / _USER_AGENT

# If the call returns an auth error, the token likely expired — refresh and retry:
#   ./.cursor/refresh-basecamp-token.sh && set -a && source .cursor/basecamp.env && set +a

curl -s \
  -H "Authorization: Bearer $BASECAMP_TOKEN" \
  -H "User-Agent: $BASECAMP_USER_AGENT" \
  "https://basecamp.com/$BASECAMP_ACCOUNT_ID/api/v1/projects/<project_id>/todos/<todo_id>.json"
```

The response is a todo object with a `comments` array; each comment has `id` and
`content` (HTML).

**IMPORTANT — use only the matching comment, not the whole thread:**
- If the link has a `#comment_<comment_id>` fragment, the task is defined **only** by
  that single comment. Select the comment whose `id` equals `<comment_id>` and use
  **only its `content`**. Ignore the todo `content` and all other comments. Extract it
  precisely by piping the curl output to:

  ```bash
  python3 -c "import sys,json; d=json.load(sys.stdin); c=[x for x in d['comments'] if x['id']==<comment_id>]; print(c[0]['content'] if c else 'NO MATCH')"
  ```

- If there is **no** `#comment_...` fragment, use the todo's own `content` field.
- If the matching comment is `NO MATCH`, stop and ask the user — do not fall back to
  other comments.

The `content` is HTML (e.g. `<div>`, `<br>`, `&amp;`). Strip tags / decode entities to
get the plain task text before parsing. Then parse these fields from it:
- **Product** — the lander product (folder under `input_based_landers/<product>/`).
- **Clone** — the source path to copy from (e.g. `<product>/index.html`). This is the
  starting point; treat it as relative to `input_based_landers/`.
- **Figma link** — the design URL.
- **Scope** — e.g. "ATF only" (above-the-fold only), "full page", specific sections.

## 2. Read the Figma design

- Open the Figma link with the **Figma MCP** (`user-Figma`). Inspect its tool
  descriptors first, then call to pull frames / specs / assets.
- If the Figma MCP is errored, ask the user to enable it or attach exported design
  images. Do not invent the design.
- Note down: layout, copy, colors, fonts, spacing, and image assets to add under the
  product's `images/` folder.

## 3. Create the working branch

Use the repo convention (see existing branches):

```bash
TS=$(date +%y%m%d%H%M)            # e.g. 2605200920
BRANCH="feature/short-identifier/bc-<BC_ID>-$TS"
git checkout main && git pull --ff-only origin main
git checkout -b "$BRANCH"
```

## 4. Do the work (clone + implement)

- Copy the **Clone** source to the new variant. Match existing naming: the product
  variant is `input_based_landers/<product>/index_vN.html` + `index_vN.css`
  (increment `N` past the highest existing version), and the lander variant lives at
  `input_based_landers/<product>/lander/<short-id>/index_vN.html` +
  `index_vN-atf.css`.
- Implement the Figma design within the requested **Scope**. For "ATF only", change
  only the above-the-fold section; leave the rest of the cloned page intact.
- Preserve boilerplate from the source: GTM/analytics snippet, `<meta robots>`,
  font preconnects, and existing includes. Keep CSS class prefixes consistent with the
  source (e.g. the source page's BEM-style prefix).
- Add any new image assets referenced by the design into the product `images/` folder.

## 5. Commit (one commit per file, repo convention)

Commit message format: `feat: <create|modify> <path> (BC#<BC_ID>)`

```bash
git add <path> && git commit -m "feat: create <path> (BC#<BC_ID>)"
```

Use `create` for new files and `modify` for edits to existing files. Commit each file
separately, matching the history.

## 6. Push, create the PR, and open it in the browser

Push the branch, then **fully create** the PR via the GitHub API (reusing the token
already stored in the macOS keychain for `git push` — no `gh` CLI needed), and open the
actual PR page. Set `TITLE` (e.g. `feat: <product> <variant> (BC#<BC_ID>)`) and `BODY`
(summary + the Basecamp link) first.

```bash
git push -u origin "$BRANCH"

TITLE="feat: <product> <variant> (BC#<BC_ID>)"
BODY="Implements Basecamp task BC#<BC_ID> (<scope>).

Basecamp: <the full basecamp link>"

TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | sed -n 's/^password=//p')

PAYLOAD=$(python3 -c "import json,sys; print(json.dumps({'title':sys.argv[1],'head':sys.argv[2],'base':'main','body':sys.argv[3]}))" "$TITLE" "$BRANCH" "$BODY")

RESP=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/AI-browser/aiserving/pulls \
  -d "$PAYLOAD")

PR_URL=$(printf '%s' "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('html_url',''))")

if [ -n "$PR_URL" ]; then
  open "$PR_URL"           # opens the actual created PR page
else
  echo "PR creation failed: $RESP" >&2
  open "https://github.com/AI-browser/aiserving/compare/main...$BRANCH?expand=1"  # fallback: create-PR form
fi
```

The keychain token has the `repo` scope, so the PR is created directly. If creation
fails (e.g. a PR already exists for the branch, or the token lacks scope), it falls back
to opening the GitHub compare/create-PR form instead.

## 7. Report back

Summarize: the parsed task fields, files created/modified, the branch name, and the
created PR URL (`$PR_URL`) that was opened in the browser.
