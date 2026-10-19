import { getApp, getApps, initializeApp } from "firebase/app";
import { firebaseConfig } from "./config";

// One app instance, reused on HMR and re-import. Never deleteApp() and re-init.
// Only reached through the loaders in ./load, so Firebase stays out of SSR and out of the initial bundle.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
