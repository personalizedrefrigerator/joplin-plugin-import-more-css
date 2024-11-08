import { contentScriptId } from "../constants";
import canCustomImportCssUrl from "../utils/canCustomImportCssUrl";

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
	const oldImportedCss = document.head.querySelectorAll(`.${importedCssClassName}`);
	for (const style of oldImportedCss) {
		style.remove();
	}
};

let applyNoteCssCancelCounter = 0;
const applyNoteCss = async (urls: string[]) => {
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

	const outputArea = document.head;

	removeAllInsertedCss();

	for (const { cssText, errors } of cssData) {
		if (errors.length) {
			console.warn('The following errors occurred while processing CSS imports:', errors);
		}

		const style = document.createElement('style');
		style.appendChild(document.createTextNode(cssText));
		style.classList.add(importedCssClassName)
		outputArea.appendChild(style);
	}
};

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
			void applyNoteCss(cssUrls.map(importStatement => importStatement.href));
		}, 150);
	} else {
		removeAllInsertedCss();
	}
};

document.addEventListener('joplin-noteDidUpdate', () => {
	replaceCssUrls();
});
