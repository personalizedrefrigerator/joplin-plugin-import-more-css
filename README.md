# Joplin Local CSS `@import`s

This is a proof-of-concept plugin intended to address [this issue](https://discourse.joplinapp.org/t/local-imported-css-no-longer-accessible/41812).

At present, it works by finding `@import`s in `<style>` blocks, then manually fetching and inserting the corresponding CSS file.

# Example note

````markdown

<style>
	/* Import CSS from a file: */
	@import "/tmp/test.css";
	/* Import CSS from a note: */
	@import ":/50775d77690042ad92fdc7478b539afa";
</style>

This is a note

````

Above, the `@import ":/50775d77690042ad92fdc7478b539afa"` imports CSS from a note with ID `50775d77690042ad92fdc7478b539afa`. The note should contain a single `css` code block contianing the CSS to be imported. For example,
````markdown
Optionally, a comment can be included on the lines before the CSS block.
```css
/* CSS here! */
```
````

# How it works

Currently, this plugin:
1. Searches for `@import`s in `<style>` blocks using regular expressions.
   - Although find-replace with regular expressions simplifies the implementation, it may cause issues if, for example, there are commented-out `@import`s. In the future, it may make sense to use a library like [csstree](https://github.com/csstree/csstree) to parse CSS and extract the imports.
2. Fetches note/file imports and removes their `@import` statements from their parent style blocks.
3. Inserts the imported content using a new `<style>` element.


# Known issues

<div id="limitations"></div>

1. Using [CSS supports/layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@import) import options is unsupported.
2. Does not support the Rich Text Editor.
3. On mobile, does not allow importing CSS from files (only from other notes).
4. Import failure errors may be logged to Joplin's console as a result of the original `@import` statements (before replacement).
