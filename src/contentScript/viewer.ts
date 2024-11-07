import { contentScriptId } from "../constants";

declare const webviewApi: {
	postMessage(contentScriptId: string, arg: unknown): Promise<any>;
};

const importedCssClassName = 'joplin-plugin-import-file-css--imported-css';

const fixStyleImports = (style: HTMLStyleElement) => {
	const importRegexes = [
		/(?:^|[\n])\s*@import\s+"(.*)";/g,
		/(?:^|[\n])\s*@import\s+'(.*)';/g,
		/(?:^|[\n])\s*@import\s+url\("(.*)"\);/g,
		/(?:^|[\n])\s*@import\s+url\('(.*)'\);/g,
	];

	const removedUrls: string[] = [];

	let styleContent = style.textContent;
	for (const regex of importRegexes) {
		styleContent = styleContent.replace(regex, (content, url: string) => {
			// File and note links:
			if (url.startsWith('file://') || url.startsWith('/') || url.startsWith(':/')) {
				removedUrls.push(url);
				// Remove: Imports are handled by the main script.
				return '';
			}
			return content;
		});
	}
	style.textContent = styleContent;

	return removedUrls;
};

let applyNoteCssCancelCounter = 0;
const applyNoteCss = async (urls: string[]) => {
	const cancelHandle = ++applyNoteCssCancelCounter;
	const cssData = await webviewApi.postMessage(contentScriptId, {
		kind: 'getCss',
		urls,
	});

	// Cancelled?
	if (cancelHandle !== applyNoteCssCancelCounter) {
		return;
	}

	const outputArea = document.head;

	// Remove old CSS
	const oldImportedCss = outputArea.querySelectorAll(`.${importedCssClassName}`);
	for (const style of oldImportedCss) {
		style.remove();
	}

	for (const css of cssData) {
		const style = document.createElement('style');
		style.appendChild(document.createTextNode(css));
		style.classList.add(importedCssClassName)
		outputArea.appendChild(style);
	}
};

let replaceCssTimeout: undefined|ReturnType<typeof setTimeout> = undefined;

const replaceCssUrls = () => {
	const userStyles = document.querySelectorAll('#rendered-md style');
	const cssUrls = [...userStyles]
		.filter(style => style.textContent.includes('@import'))
		.map(fixStyleImports)
		.flat();

	if (replaceCssTimeout) {
		clearTimeout(replaceCssTimeout);
		replaceCssTimeout = undefined;
	}

	if (cssUrls.length) {
		replaceCssTimeout = setTimeout(() => {
			replaceCssTimeout = undefined;
			void applyNoteCss(cssUrls);
		}, 70);
	}
};

document.addEventListener('joplin-noteDidUpdate', () => {
	replaceCssUrls();
});
