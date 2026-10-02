# Auto-updates — one-time setup

Momentum updates itself using **GitHub Releases** + electron-updater. Once this
is set up, you never reinstall again: the app checks GitHub on launch, downloads
any new version in the background, and offers to **Restart now** to apply.

You only do this setup **once**. After that, shipping an update is a single command.

---

## One-time setup (~5 minutes)

### 1. GitHub account + repository
- Sign in (or create a free account) at <https://github.com>.
- Click **New repository**. Name it exactly **`momentum`**. Set it **Public**.
  Leave everything else unchecked (no README, no .gitignore, no license).
- Tell Claude your GitHub **username** so it can wire it into `package.json`
  (the `build.publish.owner` field).

### 2. Connect this folder and push it up
Open a terminal in the `momentum` folder and run:

```bash
git remote add origin https://github.com/27eos/momentum.git
git push -u origin main
```

The first push will ask you to sign in to GitHub (a browser window or the
Windows credential prompt). **No token file needed** — just log in.

### 3. Cut the first release
```bash
npm run ship
```

This bumps the version, tags it, and pushes the tag. GitHub then **builds the
Windows installer for you in the cloud** and publishes it under the repo's
**Releases** page. Watch progress on the repo's **Actions** tab (~3–5 min).

### 4. Install it once
On the repo's **Releases** page, download `Momentum Setup x.y.z.exe` and run it.
That's the last time you install manually.

---

## Shipping an update later

Whenever we add a feature, just run:

```bash
npm run ship
```

GitHub rebuilds and republishes automatically. Your open app notices the new
version within a few hours (or on next launch), downloads it quietly, and pops a
**"Restart now / Later"** prompt. Done.

---

## Notes
- **Never commit tokens.** `.env` is gitignored. The cloud build uses GitHub's
  own automatic token — you don't manage one.
- Auto-update only runs in the **installed** app, not in `npm run dev`.
- Updates are **in-place**; your tasks are always preserved.
