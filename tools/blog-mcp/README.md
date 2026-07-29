# Cyberclaims Blog — MCP server

An MCP (Model Context Protocol) server that lets an AI assistant — Claude Desktop, Claude
Code, or any MCP client — **create, edit and publish blog posts on the Cyberclaims
website** by talking to its admin API. Anything it does is exactly what the CMS admin
panel does: same validation, same HTML sanitisation, same login.

You just tell Claude what you want (“Write a 600-word post about romance-scam recovery,
tag it Recovery, and publish it”) and it uses these tools to do it.

---

## 1. What it can do

| Tool | What it does |
| --- | --- |
| `whoami` | Show which site + account it’s connected to (run this first to test) |
| `list_categories` / `list_authors` | See the ids/names to assign to a post |
| `list_posts` | List posts (filter by status, search titles) |
| `get_post` | Read one post in full |
| `create_post` | Create a post from Markdown (or HTML) — draft by default |
| `update_post` | Change an existing post |
| `publish_post` / `set_post_status` | Publish, unpublish (draft), or archive |
| `delete_post` | Permanently delete (prefer archiving) |
| `upload_image` | Upload an image from a URL or file → use as a cover or in the body |

`create_post` takes Markdown for the body, a title, and optional excerpt, category,
author, SEO fields, keywords and a cover image. It returns the new post’s id and public
URL. **Posts are created as drafts unless you pass `status: "published"`** (or call
`publish_post` afterwards) — so nothing goes live by accident.

---

## 2. One-time setup

### Prerequisites
- **Node.js 20 or newer** (`node --version`).
- A Cyberclaims **admin or editor** account (email + password). Ask the site owner to
  create you an editor account if you don’t have one:
  `npm run seed:admin -- --email you@cyberclaims.net --name "Your Name" --role editor`

### Install
```bash
cd cyberclaims-blog-mcp     # this folder
npm install
```

### Test your credentials
```bash
CYBERCLAIMS_BASE_URL="https://cyberclaims.net" \
CYBERCLAIMS_EMAIL="you@cyberclaims.net" \
CYBERCLAIMS_PASSWORD="your-password" \
npm run check
```
You should see `OK — connected to https://cyberclaims.net as you@… (editor)`.

> During the migration the live site is **https://cyberclaims.nl** — use that as
> `CYBERCLAIMS_BASE_URL` until cyberclaims.net goes live, then switch it. That’s the only
> thing that changes.

---

## 3. Connect it to your AI client

You need the **absolute path** to `index.mjs` in this folder. On this machine it is:

```
<full path>/cyberclaims-blog-mcp/index.mjs
```

### Claude Desktop
Edit the config file:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add (or merge) this `mcpServers` entry, then fully quit and reopen Claude Desktop:

```json
{
  "mcpServers": {
    "cyberclaims-blog": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/cyberclaims-blog-mcp/index.mjs"],
      "env": {
        "CYBERCLAIMS_BASE_URL": "https://cyberclaims.net",
        "CYBERCLAIMS_EMAIL": "you@cyberclaims.net",
        "CYBERCLAIMS_PASSWORD": "your-password"
      }
    }
  }
}
```

### Claude Code
From any project, add it once:
```bash
claude mcp add cyberclaims-blog \
  --env CYBERCLAIMS_BASE_URL=https://cyberclaims.net \
  --env CYBERCLAIMS_EMAIL=you@cyberclaims.net \
  --env CYBERCLAIMS_PASSWORD=your-password \
  -- node /ABSOLUTE/PATH/TO/cyberclaims-blog-mcp/index.mjs
```

(Windows paths: use the full path, e.g. `C:\\Users\\you\\cyberclaims-blog-mcp\\index.mjs`.)

---

## 4. Using it

Just ask, in plain language. Examples:

- “Using cyberclaims-blog, list the categories and authors.”
- “Draft a 700-word post titled *How to spot a fake crypto exchange*, category Crypto
  Scams, author ContentTeam, with an FAQ section. Keep it as a draft and give me the
  preview URL.”
- “Publish post 42.”
- “Set the cover of post 42 to this image: https://example.com/photo.jpg”
- “Archive the post about Streamex.”

Claude picks the right tools automatically. It writes the body in Markdown; the site turns
that into its allowed HTML and sanitises it, so nothing unsafe can be stored.

---

## 5. Notes & safety

- **Drafts by default.** Posts aren’t public until published — review the preview URL
  first.
- **Same permissions as your account.** An `editor` can manage posts and media; it can’t
  touch site settings. Use a dedicated editor account rather than the master admin.
- **Your password lives only in your MCP client config**, never sent anywhere except the
  Cyberclaims login endpoint over HTTPS. Treat the config file as a secret.
- **Headings:** Markdown `##`/`###` become the article’s `<h2>`/`<h3>`. A single `#` is
  auto-demoted to `<h2>` because the page title is already the top-level heading.
- To rotate access, change your account password (or have the owner delete the editor
  account) — the MCP stops working immediately.
