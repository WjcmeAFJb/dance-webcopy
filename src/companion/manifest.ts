// Manifest for the small companion extension that adds a "Mode" tree view
// alongside Dance's built-in "Registers" view in the same activity-bar
// container.

import type { IExtensionManifest } from "@codingame/monaco-vscode-api/extensions";

export const COMPANION_EXTENSION_ID = "danceWeb.companion";

export const companionManifest: IExtensionManifest = {
  name: "companion",
  publisher: "danceWeb",
  version: "0.1.0",
  engines: { vscode: "*" },
  activationEvents: ["onStartupFinished"],
  contributes: {
    views: {
      // Inject into Dance's existing activity-bar container so users see
      // both views together under the same icon.
      dance: [
        { id: "danceMode", name: "Mode" },
      ],
    },
    viewsWelcome: [
      {
        view: "danceMode",
        contents: "Open a file to see the active Dance mode here.",
      },
    ],
  },
};
