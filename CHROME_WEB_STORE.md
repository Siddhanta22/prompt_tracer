# Publish Prompt Tracer on the Chrome Web Store

## Before you start

1. **Google account** — Use the account you want as the publisher.
2. **One-time $5 fee** — [Chrome Web Store Developer registration](https://chrome.google.com/webstore/devconsole) (lifetime for your account).
3. **Test the extension** — Load unpacked at `chrome://extensions`, try ChatGPT or Claude, confirm metrics + popup work.

---

## Step 1: Build the upload ZIP

From the project root:

```bash
chmod +x scripts/package-store.sh
./scripts/package-store.sh
```

This creates `prompt-tracer-v1.0.1.zip` in the repo root (extension code only — no `.env`, docs, or git files).

**Never include `.env` in the ZIP.**

---

## Step 2: Open the Developer Dashboard

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the registration fee if prompted
3. Click **New item**
4. Upload `prompt-tracer-v1.0.1.zip`

---

## Step 3: Store listing (copy-paste ready)

### Product details

| Field | Value |
|-------|--------|
| **Language** | English |
| **Title** | Prompt Tracer - AI Prompt Optimizer |
| **Summary** (max 132 chars) | Transform your AI interactions with intelligent prompt analysis and optimization. Privacy-first, educational, and completely free. |
| **Description** | Use the full text under "Detailed Description" in [STORE_LISTING.md](STORE_LISTING.md) |
| **Category** | Productivity |
| **Language** | English only |

### Graphic assets (you must create these)

| Asset | Size | What to capture |
|-------|------|-----------------|
| **Store icon** | 128×128 | Use `icons/icon128.png` |
| **Screenshots** | 1280×800 or 640×400 | At least 1, up to 5 (see below) |
| **Small promo tile** | 440×280 | Optional |
| **Marquee promo** | 1400×560 | Optional |

**Recommended screenshots:**

1. Floating analysis panel on ChatGPT with **6 metrics + score**
2. Optimized prompt with Copy / Use buttons
3. Extension popup — **Dashboard** tab
4. Extension popup — **Analytics** charts
5. Extension popup — **Settings** (privacy + optional API key)

**Pre-generated assets:** Run `python3 scripts/generate-store-assets.py` — outputs ready-to-upload files in `store-assets/` (screenshots 1280×800, promo tiles).

**Or capture live:** Install the extension → open ChatGPT → type a prompt → screenshot → crop to 1280×800.

### Privacy

| Field | Value |
|-------|--------|
| **Privacy policy URL** | `https://github.com/Siddhanta22/prompt_tracer/blob/main/PRIVACY_POLICY.md` |
| **Official URL** (optional) | `https://github.com/Siddhanta22/prompt_tracer` |

### Distribution

- **Visibility:** Public (or Unlisted for beta testers first)
- **Regions:** All regions (or your choice)
- **Pricing:** Free

---

## Step 4: Privacy practices (dashboard questionnaire)

Answer honestly based on how the extension works:

| Question | Answer |
|----------|--------|
| Collects personal data? | **No** for server-side collection (everything is local) |
| User-provided API key | **Yes** — stored locally only; user opts in; calls OpenAI only when they enable premium optimization |
| Purpose | App functionality |
| Sold to third parties? | **No** |
| Used for unrelated purposes? | **No** |
| Encrypted in transit? | **Yes** (HTTPS to OpenAI when user enables API features) |
| User can delete data? | **Yes** — "Clear Data" in popup |

---

## Step 5: Permission justifications

Chrome may ask why each permission is needed:

| Permission | Justification |
|------------|---------------|
| **activeTab** | Read the active tab when the user triggers analysis on an AI chat page. |
| **storage** | Save prompt history, settings, and optional API key locally on the device. |
| **scripting** | Inject the analysis UI on supported AI platforms when the user uses the extension. |
| **downloads** | Export prompt history as JSON when the user clicks Export. |
| **Host: chat.openai.com, chatgpt.com, claude.ai, x.ai, gemini.google.com** | Run content scripts only on supported AI chat sites. |
| **Host: api.openai.com** | Optional: call OpenAI only when the user saves their own API key for AI-powered optimization. |

---

## Step 6: Single purpose description

> Prompt Tracer helps users analyze and improve the prompts they write on AI chat websites (ChatGPT, Claude, Grok, Gemini) by showing quality metrics and suggested optimizations. All core analysis runs locally in the browser.

---

## Step 7: Submit for review

1. Complete **Privacy**, **Distribution**, and **Store listing** tabs until no errors remain
2. Click **Submit for review**
3. Review usually takes **1–3 business days** (sometimes longer for new developers)

You’ll get email when approved or if changes are requested.

---

## After approval

1. Copy your store URL and add it to README
2. For updates: bump `version` in `manifest.json` → run `./scripts/package-store.sh` → upload new ZIP in the dashboard

---

## Common rejection reasons (avoid these)

- Missing or broken privacy policy URL
- Screenshots that don’t match the actual extension
- Permissions broader than needed (we scoped hosts to AI sites + OpenAI API only)
- `.env` or API keys inside the ZIP
- Misleading claims (“we never send data”) while optional OpenAI calls exist — disclose optional API feature clearly

---

## Support contact

Use an email you control in the dashboard (e.g. your Gmail or GitHub noreply). Update [STORE_LISTING.md](STORE_LISTING.md) if you change it.

For issues, GitHub Issues works well: `https://github.com/Siddhanta22/prompt_tracer/issues`
