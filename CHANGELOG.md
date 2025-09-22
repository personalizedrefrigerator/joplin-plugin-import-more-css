# 1.1.0

- New setting: "Global CSS note" (in 482747b9b7b375ac1a462143e61df662c729c620).
   - This is primarily to allow specifying global viewer CSS on mobile.
- Mobile: Add advanced setting to enable including import errors in the plugin log file (in ebe095842fded3e5400293b882b0bc2b147c0fbd).
- Allow importing CSS file paths that end in query parameters (in a4513c7c3dfb7ec47a37210245ed183405e5f0d2, fixes #3).

# 1.0.3

- Fix plugin fails to replace CSS on iOS (#2).

# 1.0.0, 1.0.2

- Publish to NPM.
- Ran `npm audit fix`: Upgrade `tsx`, `braces`, `@esbuild/*`, `fill-range`, `micromatch`

# 0.0.8

- Fix error on export to PDF.

# 0.0.7

- Don't include commented out `@import`s in imported files.
- Improve `@import` CSS precedence.

# 0.0.6

- Improve error handling &mdash; import working CSS files even if an error occurs loading others.
- Improve CSS parsing for in-note `<style>` elements.
   - Commented-out `@import`s should now be ignored.
   - This only applies to `<style>` blocks embedded directly within notes.

# 0.0.4, 0.0.5

- Support recursive CSS note/file `@import`s.

# 0.0.3

- Fix CSS not removed after switching notes.

# 0.0.2

- Fix mobile support.
- Fix imported CSS flashes when editing a note.
- Fix plugin name and description.

# 0.0.1

Initial release.
