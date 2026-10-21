# Admin auth (Firebase)

- Firebase email/password auth is for admins only. Sign-up is disabled in the console, and admins are an allowlist of UIDs.
  - The allowlist lives in `PUBLIC_ADMIN_UIDS` in `.env` and Netlify, and in `isAdmin()` in `firestore.rules`. Keep the two in sync.
  - Deploy rules with `firebase deploy --only firestore:rules`. The project is `madhu-wellness-collective`.
- Stay on the `firebase` 12.x SDK. 13.x needs Node 24, and this machine has Node 22.
- `src/lib/firebase/` holds the config, lazy `loadAuth()` / `loadDb()` dynamic imports and `adminWrite()`. `src/lib/auth/` holds `authStore` (`ready`, `isAdmin`), the actions and `LogoutButton`.
- Firebase is never loaded for ordinary visitors. A localStorage hint (`madhu-admin-session`) tells the layout to restore a returning admin's session.
- Admins log in through the footer's "Admin" link (it becomes "Log out" when signed in), or through `?admin` on any URL. The Firestore rules are the real protection; hiding the UI is cosmetic.
