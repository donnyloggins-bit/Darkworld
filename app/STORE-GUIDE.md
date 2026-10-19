# DARKWORLD in the App Store and Google Play

The game is still `../index.html`. This `app/` folder wraps it in a native shell (Capacitor) so it can ship as a real iOS and Android app. Every time you push, GitHub builds the Android app for you.

---

## Play it on an Android phone today (free)

1. On GitHub, open the repo → **Actions** → **Android app** → the newest green run.
2. Under **Artifacts**, download `darkworld-android-…` and unzip it.
3. Send `darkworld-debug.apk` to your phone (email it, Google Drive, USB…) and tap it.
4. Android asks to allow installing from that app → allow → **Install**.

> Each build is signed with a fresh test key, so to install a newer test build, uninstall the old one first.

To turn on accounts/raids in the app builds, add two repository secrets (**Settings → Secrets and variables → Actions → New repository secret**): `SUPABASE_URL` and `SUPABASE_ANON_KEY` (same values as on Netlify).

---

## Google Play

**Cost:** $25 one time. **Account:** https://play.google.com/console/signup

### 1. Make an upload key (once — keep it forever)
Google Play needs every upload signed with the same key. You can make one with Android Studio (**Build → Generate Signed Bundle → Create new key store**) or, if Java is installed:

```
keytool -genkeypair -v -keystore darkworld-upload.jks -alias darkworld -keyalg RSA -keysize 2048 -validity 10000
```

Back the `.jks` file and its passwords up somewhere safe (password manager + cloud drive). **Never commit it.** If you lose it, Google can reset it because you'll use Play App Signing, but it takes days.

### 2. Give GitHub the key (repository secrets)
| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | the `.jks` file as base64: `base64 -w0 darkworld-upload.jks` (Mac: `base64 -i darkworld-upload.jks`) |
| `ANDROID_KEYSTORE_PASSWORD` | the keystore password |
| `ANDROID_KEY_ALIAS` | `darkworld` (or whatever alias you chose) |
| `ANDROID_KEY_PASSWORD` | the key password |

The next build's `darkworld-release.aab` is signed and ready for Play.

### 3. Create the app in Play Console
- **App name:** DARKWORLD · **Default language:** English (US) · **Game** · **Free**
- **App access:** all features available without special access (accounts are optional)
- **Ads:** No
- **Content rating questionnaire:** Category *Game*. Violence: fantasy violence against non-human creatures, blood. No sexual content, drugs, gambling or user-to-user chat. Expect roughly *Teen / PEGI 12*.
- **Target audience:** 13+ (horror theme)
- **Privacy policy URL:** `https://YOUR-NETLIFY-SITE/privacy.html` (fill in **[CONTACT EMAIL]** in `privacy.html` first)
- **Data safety form:**
  - Location → *Approximate location*: collected, not shared, used for *App functionality*, optional (only when signed in). Precise location: **not collected** (it stays on the device).
  - Personal info → *Email address*: collected, not shared, *Account management*, optional.
  - App activity → *Other user-generated content / in-app actions* (game progress): collected, *App functionality*, optional.
  - Data is encrypted in transit: **Yes**. Users can request deletion: **Yes** (in-app Delete Account, plus the privacy page).
  - Account deletion URL: `https://YOUR-NETLIFY-SITE/privacy.html`
- **Store listing:** short description, full description, 512×512 icon (`app/resources/icon-only.png` scaled), a 1024×500 feature graphic, and at least 2 phone screenshots.

### 4. Upload
**Testing → Internal testing → Create release** → upload `darkworld-release.aab` → add testers by email. New personal developer accounts must run a **closed test with 12 testers for 14 days** before they can publish to production.

---

## Apple App Store

**Cost:** $99/year. **Account:** https://developer.apple.com/programs/enroll/
**You need a Mac** with Xcode (free from the Mac App Store), or a cloud Mac service such as Codemagic or a rented Mac. Apps for iPhone can't be built on Windows or Linux.

### On the Mac
```
git clone https://github.com/donnyloggins-bit/Darkworld.git
cd Darkworld/app
npm ci
npm run ios          # bundles the game, syncs, opens Xcode
```
In Xcode:
1. Select the **App** target → **Signing & Capabilities** → tick *Automatically manage signing* → pick your Team.
2. Plug in your iPhone, choose it at the top, press ▶ to test on your phone.
3. When ready: **Product → Archive → Distribute App → App Store Connect → Upload**.

### In App Store Connect (https://appstoreconnect.apple.com)
- **New app:** iOS, name *DARKWORLD*, bundle ID `com.darkworldgame.app`, SKU `darkworld`.
- **Privacy policy URL:** your `privacy.html`.
- **App Privacy (nutrition labels):** *Coarse Location* (App Functionality, linked to user, not tracking), *Email Address* (App Functionality, linked, not tracking), *Gameplay Content* (App Functionality, linked, not tracking). **Tracking: No.**
- **Age rating:** Infrequent/Mild *Cartoon or Fantasy Violence*, *Horror/Fear Themes* → about 12+.
- **Review notes:** "Location-based game. Monsters spawn around the player's real location; to review without walking, the game is fully playable at any location. Accounts are optional; a test account: [email/password]." Include a test account you created.
- Screenshots: 6.9" iPhone (1320×2868) and 6.5" (1284×2778) at minimum.

---

## What was changed for the stores
- **Delete Account** button (☁ Account panel). Both stores require in-app deletion when an app has accounts. Run the latest `supabase/schema.sql` to add the `delete_my_account()` function.
- **Privacy policy** page (`privacy.html`), linked from the Account panel.
- Location and camera permission messages, portrait lock, dark status bar, notch-safe layout.
- App ID `com.darkworldgame.app`. **This can never change once published.** If you want a different one, change it before your first upload (it's set in `capacitor.config.json`, the Android package and the Xcode project; easiest to regenerate the platforms).

## Updating the app later
Change `index.html` as usual. Android: push and download the new build. iOS: on the Mac, `git pull && npm run ios`, bump the version in Xcode, Archive, Upload.
