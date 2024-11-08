import joplin from "../../api";
import getCssFromImportedNote from "./getCssFromImportedNote";

const fetchNoteCss = async (url: string) => {
	if (!url.startsWith(':/')) throw new Error('Invalid note URL');

	const id = url.substring(2);
	const note = await joplin.data.get(['notes', id], { fields: ['body'] });
	let body: string = note.body;
	return getCssFromImportedNote(body);
};

const fetchUrlText = async (url: string) => {
	// Remove trailing query parameters (if any):
	url = url.replace(/\.css\?.*?$/i, '.css');

	if (!url.toLowerCase().endsWith('.css')) {
		throw new Error(`Attempted to include non-CSS file: ${url}`);
	}

	const data = await fetch(url);
	if (!data.ok) {
		console.warn('Fetch failed for URL,', url);
		return '';
	}

	return await data.text();
};

const loadCssFromUrl = async (url: string) => {
	// Joplin URL:
	if (url.startsWith(':/')) {
		return fetchNoteCss(url);
	} else {
		return fetchUrlText(url);
	}
};

export default loadCssFromUrl;