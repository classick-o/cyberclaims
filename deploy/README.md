# deploy/

Everything needed to ship this app to Hostinger, kept in the repo so it survives a
cleared temp folder.

```powershell
powershell -File deploy\stage.ps1 -Site net -Zip H:\tmp\cc_net.zip
powershell -File deploy\stage.ps1 -Site nl  -Zip H:\tmp\cc_nl.zip
```

Then deploy the zip (Hostinger MCP `hosting_deployJsApplication`), wait for the build to
report `completed`, and restart the app. Migrations run automatically on boot.

| File | What it is |
| --- | --- |
| `stage.ps1` | Copies source + the right `.env` into a staging dir and builds the archive |
| `make-zip.ps1` | Builds the archive with **forward-slash** paths |
| `env.nl` | `.env` for cyberclaims.nl (staging, `ALLOW_INDEXING=false`) |
| `env.net` | `.env` for cyberclaims.net (production, `ALLOW_INDEXING=true`) |

## Two things that will bite you

**Forward slashes are not optional.** PowerShell's `Compress-Archive` writes backslash
paths. Astro's content-collection glob then matches nothing on the Linux build, and you
get a *green* deploy where every legal page and the whole blog 404s. `make-zip.ps1`
exists solely to write POSIX paths.

**Exclusions are anchored to the repo root.** `robocopy /XD uploads` matches a directory
named `uploads` at *any* depth, which silently dropped `public/wp-content/uploads/` (the
BIMI logo) from an archive. Anything not meant to be excluded everywhere is passed as a
full path.

## Secrets

`env.nl` and `env.net` hold live credentials - database, JWT, SMTP, Turnstile, ScamInfo -
and are **git-ignored**, because this repo has a GitHub remote. They live here so they are
not lost again, not so they can be pushed. Keep a copy somewhere safe: nothing else has
them, and a lost `env.net` means reconstructing production by hand.
