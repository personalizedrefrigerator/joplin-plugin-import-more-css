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