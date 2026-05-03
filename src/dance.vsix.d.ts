// The rollup-vsix-plugin replaces `.vsix` imports with auto-generated modules
// that side-effect-register the extension and export `whenReady`.
declare module "*.vsix" {
  export const whenReady: Promise<void>;
}
