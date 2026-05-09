// Service overrides for monaco-vscode-api. We pick a minimal but Dance-friendly
// set: configuration + keybindings (for keymap upload), files + model + storage
// (for the in-memory workspace + IndexedDB persistence), extensions (to host
// Dance), themes + textmate + languages (so the buffer looks like an editor),
// notifications + dialogs + preferences (Dance prompts/menus), views +
// status-bar (so the activity bar, sidebar and mode segment all show up).

import getConfigurationServiceOverride from "@codingame/monaco-vscode-configuration-service-override";
import getKeybindingsServiceOverride from "@codingame/monaco-vscode-keybindings-service-override";
import getModelServiceOverride from "@codingame/monaco-vscode-model-service-override";
import getNotificationServiceOverride from "@codingame/monaco-vscode-notifications-service-override";
import getDialogsServiceOverride from "@codingame/monaco-vscode-dialogs-service-override";
import getTextmateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import getLanguageDetectionWorkerServiceOverride from "@codingame/monaco-vscode-language-detection-worker-service-override";
import getStorageServiceOverride from "@codingame/monaco-vscode-storage-service-override";
import getExtensionServiceOverride from "@codingame/monaco-vscode-extensions-service-override";
import getEnvironmentServiceOverride from "@codingame/monaco-vscode-environment-service-override";
import getLifecycleServiceOverride from "@codingame/monaco-vscode-lifecycle-service-override";
import getLogServiceOverride from "@codingame/monaco-vscode-log-service-override";
import getQuickAccessServiceOverride from "@codingame/monaco-vscode-quickaccess-service-override";
import getPreferencesServiceOverride from "@codingame/monaco-vscode-preferences-service-override";
import getLayoutServiceOverride from "@codingame/monaco-vscode-layout-service-override";
import getViewsServiceOverride, {
  isEditorPartVisible,
} from "@codingame/monaco-vscode-views-service-override";
import getStatusBarServiceOverride from "@codingame/monaco-vscode-view-status-bar-service-override";
import getTitleBarServiceOverride from "@codingame/monaco-vscode-view-title-bar-service-override";
import getLocalizationServiceOverride from "@codingame/monaco-vscode-localization-service-override";
import getSearchServiceOverride from "@codingame/monaco-vscode-search-service-override";
import getOutputServiceOverride from "@codingame/monaco-vscode-output-service-override";
import getMarkersServiceOverride from "@codingame/monaco-vscode-markers-service-override";
import getSnippetServiceOverride from "@codingame/monaco-vscode-snippets-service-override";
import getSecretStorageServiceOverride from "@codingame/monaco-vscode-secret-storage-service-override";
import getWorkspaceTrustOverride from "@codingame/monaco-vscode-workspace-trust-service-override";
// Built-in extensions are registered eagerly from main.tsx so the
// extension contributions reach the registry before the workbench scans for
// them.

import type { IEditorOverrideServices } from "@codingame/monaco-vscode-api";

export function buildServiceOverrides(openEditor: (modelRef: any) => Promise<any>): IEditorOverrideServices {
  return {
    ...getLogServiceOverride(),
    ...getEnvironmentServiceOverride(),
    ...getLifecycleServiceOverride(),
    // Force all extensions to the LocalProcess host (main thread). The web-
    // worker host requires a same-origin iframe whose window picks up our
    // MonacoEnvironment registration; that handshake is fragile in dev/build
    // and Dance has no need to run in a worker — it touches the editor
    // synchronously and is already a small bundle.
    ...getExtensionServiceOverride({ enableWorkerExtensionHost: false }),
    ...getModelServiceOverride(),
    ...getNotificationServiceOverride(),
    ...getDialogsServiceOverride(),
    ...getConfigurationServiceOverride(),
    ...getKeybindingsServiceOverride(),
    ...getTextmateServiceOverride(),
    ...getThemeServiceOverride(),
    ...getLanguagesServiceOverride(),
    ...getLanguageDetectionWorkerServiceOverride(),
    ...getStorageServiceOverride(),
    ...getPreferencesServiceOverride(),
    ...getSnippetServiceOverride(),
    ...getOutputServiceOverride(),
    ...getMarkersServiceOverride(),
    ...getSearchServiceOverride(),
    ...getSecretStorageServiceOverride(),
    ...getWorkspaceTrustOverride(),
    ...getStatusBarServiceOverride(),
    ...getTitleBarServiceOverride(),
    ...getLocalizationServiceOverride({
      async clearLocale() {},
      async setLocale() {},
      availableLanguages: [{ locale: "en", languageName: "English" }],
    }),
    // Pin the layout service to <html> instead of <body> so getClientArea
    // takes the non-body branch (returning element.clientWidth/Height) and
    // never hits the body fallback that throws "Unable to figure out
    // browser width and height" when the body hasn't been measured yet.
    ...getLayoutServiceOverride(document.documentElement),
    ...getViewsServiceOverride(openEditor, undefined),
    ...getQuickAccessServiceOverride({
      isKeybindingConfigurationVisible: isEditorPartVisible,
      shouldUseGlobalPicker: (_editor, isStandalone) => !isStandalone && isEditorPartVisible(),
    }),
  };
}
