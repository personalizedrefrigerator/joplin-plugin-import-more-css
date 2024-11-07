
// For now, require the .css extension:
const cssFilePathExpression = /^(file:[/])?[.]?[/].*\.css$/i;

/** Returns `true` iff `url` should be imported by this plugin (rather than by Joplin). */
const canCustomImportCssUrl = (url: string) => {
	return url.match(cssFilePathExpression) || url.startsWith(':/');
};

export default canCustomImportCssUrl;