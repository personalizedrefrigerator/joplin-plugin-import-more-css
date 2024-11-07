import joplin from 'api';
import { ContentScriptType, ModelType } from 'api/types';
import { contentScriptId } from './constants';

const removeCssBlockWrapper = (noteText: string) => {
	// Remove any leading/trailing ```css ``` blocks (if added for syntax highlighting)
	const cssStartMatch = noteText.match(/(?:[\n]|^)(`{3,})css[\r]?[\n]/);
	if (cssStartMatch) {
		noteText = noteText.substring(cssStartMatch.index + cssStartMatch[0].length);

		const backticks = cssStartMatch[1];
		const cssEndIndex = noteText.indexOf(`\n${backticks}`);
		if (cssEndIndex !== -1) {
			noteText = noteText.substring(0, cssEndIndex);
		}
	}

	return noteText;
};

console.assert(removeCssBlockWrapper('test') === 'test', 'tests/removeCssBlockWrapper #1');
console.assert(removeCssBlockWrapper('```css\ntest\n```') === 'test', 'tests/removeCssBlockWrapper #2', removeCssBlockWrapper('```css\ntest\n```'));
console.assert(removeCssBlockWrapper('Test:\n```css\ntest\ntest\n```') === 'test\ntest', 'tests/removeCssBlockWrapper #3');


const fetchNoteCss = async (url: string) => {
	if (!url.startsWith(':/')) throw new Error('Invalid note URL');

	const id = url.substring(2);
	const note = await joplin.data.get(['notes', id], { fields: ['body'] });
	let body: string = note.body;
	return removeCssBlockWrapper(body);
};

const fetchUrlText = async (url: string) => {
	const data = await fetch(url);
	if (!data.ok) {
		console.warn('Fetch failed for URL,', url);
		return '';
	}

	return await data.text();
};

joplin.plugins.register({
	onStart: async function() {
		await joplin.contentScripts.register(ContentScriptType.MarkdownItPlugin, contentScriptId, './contentScript/contentScript.js');
		await joplin.contentScripts.onMessage(contentScriptId, async (message: any) => {
			if (message.kind === 'getCss') {
				const urls = message.urls as string[];
				if (!Array.isArray(urls)) throw new Error('Wrong urls[] type');

				const cssData = await Promise.all(urls.map(async url => {
					if (url.startsWith(':/')) {
						return fetchNoteCss(url);
					} else {
						return fetchUrlText(url);
					}
				}));

				return cssData;
			}
		});
	},
});
