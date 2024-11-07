import { contentScriptId } from "../constants";
import extractCssPluginHandledImports from "./utils/extractCssPluginHandledImports";

declare const webviewApi: {
	postMessage(contentScriptId: string, arg: unknown): Promise<any>;
};

const importedCssClassName = 'joplin-plugin-import-file-css--imported-css';

const fixStyleImports = (style: HTMLStyleElement) => {
	const styleContent = style.textContent;
	const { updatedCss, extractedUrls } = extractCssPluginHandledImports(styleContent);
	if (styleContent !== updatedCss) {
		style.textContent = updatedCss;
	}
	return extractedUrls;
};

const removeAllInsertedCss = () => {
	const oldImportedCss = document.head.querySelectorAll(`.${importedCssClassName}`);
	for (const style of oldImportedCss) {
		style.remove();
	}
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

	removeAllInsertedCss();

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
		}, 150);
	} else {
		removeAllInsertedCss();
	}
};

document.addEventListener('joplin-noteDidUpdate', () => {
	replaceCssUrls();
});
