# Site Owner Guide

This guide explains how to maintain the Seattle Wiffleball League site without touching code. All steps use the GitHub website and Vercel dashboard — no terminal required.

---

## 1. Adding a News Article

News articles live in the `content/news/` folder as plain text files.

1. Go to your repository on GitHub (github.com)
2. Click the `content/news/` folder
3. Click **Add file** → **Create new file**
4. Name the file with a short slug, e.g., `2026-season-opener.md` (lowercase, hyphens, ends with `.md`)
5. Paste this template at the top, then fill it in:

```
---
title: "Your Article Title"
date: "YYYY-MM-DD"
excerpt: "One sentence summary shown on the news listing page."
image: "/images/news/optional-image.jpg"
tag: "Announcement"
---

Write your article here. Plain text works fine.

You can use **bold**, *italic*, and [links](https://example.com).
```

6. Replace the date (e.g., `"2026-04-15"`). The `image` line is optional — remove it if you have no image.
7. Common tags: `Announcement`, `Recap`, `Standings`, `Schedule`
8. Click **Commit changes** — Vercel auto-deploys and the article goes live within 1-2 minutes.

To include an image, upload it to `public/images/news/` first (see Section 4).

---

## 2. Changing the Google Sheet

The site pulls all stats from a Google Spreadsheet. If you move the data to a new sheet, update the ID in Vercel.

**How to find the Spreadsheet ID:**

Your sheet URL looks like:
`https://docs.google.com/spreadsheets/d/THIS-IS-THE-ID/edit`

Copy everything between `/d/` and `/edit`.

**Steps to update:**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project
3. Click **Settings** → **Environment Variables**
4. Find `SPREADSHEET_ID` and click the pencil (edit) icon
5. Paste the new ID and save
6. Go to the **Deployments** tab
7. Click the three-dot menu on the latest deployment → **Redeploy**

The site will reconnect to the new spreadsheet within 1-2 minutes.

---

## 3. Adding a Team Logo

Team logos live in `public/images/teams/`. The filename must match the team's `logoPath` in the config.

**Correct filenames for each team:**

| Team | Expected filename |
|------|-------------------|
| 100% Real Juice | `100-percent-real-juice.png` |
| American Dreams | `american-dreams-logo.png` |
| Berzerkers | `berzerkers-logo.png` |
| Bilabial Stops | `bilabial-stops-logo.png` |
| Caught Cooking | `caught-cooking-logo.png` |
| Chicken n' Wiffles | `chicken-n-wiffles-logo.png` |
| Sheryl Crows | `sheryl-crows-logo.png` |
| Swingdome | `swingdome-logo.png` |
| West Coast Washout | `west-coast-washout-logo.png` |
| Wiffle House | `wiffle-house-logo.png` |

**Steps:**

1. Go to your repository on GitHub
2. Click `public/images/teams/`
3. Click **Add file** → **Upload files**
4. Drag and drop your image, or click to browse
5. Make sure the filename exactly matches the table above
6. Click **Commit changes**

Use PNG format. Recommended size: 200x200 pixels or larger.

---

## 4. Adding Player or News Images

**Player photos** go in `public/images/players/`.

**News article images** go in `public/images/news/`.

**Steps for both:**

1. Go to your repository on GitHub
2. Navigate to the correct folder (`public/images/players/` or `public/images/news/`)
3. Click **Add file** → **Upload files**
4. Upload your image and commit

For news images, reference them in the article frontmatter:
```
image: "/images/news/your-filename.jpg"
```

For player photos, use the player's name in lowercase with hyphens (e.g., `jane-smith.jpg`).

---

## 5. Triggering a Redeploy

Every commit to GitHub triggers an automatic deploy. No extra steps needed after uploading or editing a file.

To force a manual redeploy (e.g., after updating an environment variable):

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) → your project → **Deployments**
2. Click the three-dot menu on the most recent deployment → **Redeploy**

---

## 6. Troubleshooting

**All pages show errors or no data:**
- The spreadsheet ID is probably missing or wrong
- Go to Vercel → Settings → Environment Variables and verify `SPREADSHEET_ID` is set
- Make sure the Google Sheet is set to "Anyone with the link can view"

**A new article is not showing up:**
- Check that the file is in `content/news/` and ends with `.md`
- Check the frontmatter: the `---` lines must appear exactly as shown, with no extra spaces
- Check the date format: it must be `"YYYY-MM-DD"` with quotes and dashes

**Images are not loading:**
- Verify the file is in the correct folder under `public/images/`
- Check that the path in the frontmatter or config starts with `/images/` (not `public/images/`)
- Filenames are case-sensitive — `Logo.png` and `logo.png` are different files

**Build failed:**
- Go to [vercel.com/dashboard](https://vercel.com/dashboard) → Deployments
- Click the failed deployment to see the error log
- The error message usually tells you exactly what went wrong
- If unsure, contact your developer and share the error log link
