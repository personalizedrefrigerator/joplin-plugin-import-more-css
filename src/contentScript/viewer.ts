import { contentScriptId } from "../constants";
import canCustomImportCssUrl from "../utils/canCustomImportCssUrl";
import debounce from "../utils/debounce";

declare const webviewApi: {
	postMessage(contentScriptId: string, arg: unknown): Promise<any>;
};

const importedCssClassName = 'joplin-plugin-import-file-css--imported-css';

const extractIncompatibleImports = (style: HTMLStyleElement) => {
	const importsToUpdate: CSSImportRule[] = [];
	const collectIncompatibleImports = (styleSheet: CSSStyleSheet) => {
		const rules = styleSheet.cssRules;

		// 1. Find all incompatible @imports
		for (let i = 0; i < rules.length; i ++) {
			const rule = rules[i];

			// Note: For now, this only supports toplevel imports:
			if (rule instanceof CSSImportRule && canCustomImportCssUrl(rule.href)) {
				importsToUpdate.push(rule);
				styleSheet.deleteRule(i);
				i --;
			}
		}
	};
	collectIncompatibleImports(style.sheet);

	return importsToUpdate;
};

const removeAllInsertedCss = () => {
	const oldImportedCss = document.querySelectorAll(`.${importedCssClassName}`);
	for (const style of oldImportedCss) {
		style.remove();
	}
};

const addCss = (cssText: string) => {
	const preferredOutputArea = document.querySelector('#joplin-container-pluginAssetsContainer');
	const outputArea = preferredOutputArea ?? document.body;

	const style = document.createElement('style');
	style.appendChild(document.createTextNode(cssText));
	style.classList.add(importedCssClassName);
	outputArea.insertAdjacentElement('afterend', style);
};

let applyNoteCssCancelCounter = 0;
const applyNoteCss = debounce(async (urls: string[]) => {
	const cancelHandle = ++applyNoteCssCancelCounter;

	let cssData;
	try {
		cssData = await webviewApi.postMessage(contentScriptId, {
			kind: 'getCss',
			urls,
		});
	} catch (error) {
		console.error('CSS import error', error);
		cssData = [];
	}

	// Cancelled?
	if (cancelHandle !== applyNoteCssCancelCounter) {
		return;
	}

	removeAllInsertedCss();

	for (const { cssText, errors } of cssData) {
		if (errors.length) {
			console.warn('The following errors occurred while processing CSS imports:', errors);
		}

		addCss(cssText);
	}
});

let replaceCssTimeout: undefined|ReturnType<typeof setTimeout> = undefined;

const replaceCssUrls = () => {
	const userStyles = document.querySelectorAll('#rendered-md style');
	const cssUrls = [...userStyles]
		.filter(style => style.textContent.includes('@import'))
		.map(extractIncompatibleImports)
		.flat();

	if (replaceCssTimeout) {
		clearTimeout(replaceCssTimeout);
		replaceCssTimeout = undefined;
	}

	if (cssUrls.length) {
		replaceCssTimeout = setTimeout(() => {
			replaceCssTimeout = undefined;
			applyNoteCss(cssUrls.map(importStatement => importStatement.href));
		}, 150);
	} else {
		removeAllInsertedCss();
	}
};

const isMobileRichTextEditor = () => !!document.querySelector('body > .RichTextEditor');

const applyGlobalCss = debounce(async () => {
	// For now, explicitly don't support the mobile Rich Text Editor, which has "data-*"
	// attributes that include Markdown from the note. Not supporting the mobile RTE protects against
	// https://portswigger.net/research/blind-css-exfiltration, in the case where a user
	// @imports untrusted CSS from an http or https URL.
	if (isMobileRichTextEditor()) {
		return;
	}

	const globalCss = await webviewApi.postMessage(contentScriptId, {
		kind: 'getGlobalCss',
	});
	if (globalCss?.cssText) {
		addCss(globalCss.cssText);
	}
});

document.addEventListener('joplin-noteDidUpdate', () => {
	replaceCssUrls();
	applyGlobalCss();
});

replaceCssUrls();
applyGlobalCss();
