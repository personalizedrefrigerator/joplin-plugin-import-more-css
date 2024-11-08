import { cssImportRegexes } from "../constants";
import canCustomImportCssUrl from "./canCustomImportCssUrl";
import stringToBase64 from "./stringToBase64";
import { resolve, dirname } from "path";

type FetchCssCallback = (url: string)=>Promise<string>;
const loadAndProcessCssInternal = async (
	cssUrl: string,
	fetchCssFromUrl: FetchCssCallback,
	parentUrls: string[],
	errors: Error[],
	imports: Map<string, string>,
) => {
	// Base case: CSS already loaded (prevents infinite recursion).
	if (parentUrls.includes(cssUrl)) {
		errors.push(new Error('Warning: Cyclic import detected.'));
		return '';
	}

	// Handle relative path imports:
	if (cssUrl.startsWith('./') || cssUrl.startsWith('../')) {
		const parentDirs = parentUrls.map(dirname);
		cssUrl = resolve(...parentDirs, cssUrl);
	}

	if (imports.has(cssUrl)) {
		return imports.get(cssUrl);
	}

	let cssText;
	try {
		cssText = await fetchCssFromUrl(cssUrl);
	} catch (error) {
		errors.push(error);
		cssText = '';
	}

	const allUrls = new Set<string>();
	for (const regex of cssImportRegexes) {
		cssText.replace(regex, (fullMatch, url: string) => {
			if (!canCustomImportCssUrl(url)) {
				return fullMatch;
			}

			allUrls.add(url);
			return fullMatch;
		});
	}

	const processedUrls = new Set<string>();
	await Promise.all([...allUrls].map(async url => {
		processedUrls.add(url);
		await loadAndProcessCssInternal(
			url, fetchCssFromUrl, [...parentUrls, cssUrl], errors, imports,
		);
	}));

	for (const regex of cssImportRegexes) {
		cssText = cssText.replace(regex, (fullMatch, url: string) => {
			if (!processedUrls.has(url)) {
				return fullMatch;
			} else {
				return '';
			}
		});
	}

	imports.set(cssUrl, cssText.trim());
	return cssText;
}

const loadAndProcessCss = async (
	cssUrl: string,
	fetchCssFromUrl: FetchCssCallback,
) => {
	const imports = new Map<string, string>();
	const errors: Error[] = [];

	const processedCss = await loadAndProcessCssInternal(cssUrl, fetchCssFromUrl, [], errors, imports);
	imports.delete(cssUrl);

	const cssText = [
		...[...imports.values()].filter(data => !!data).map(cssData => {
			const base64Data = stringToBase64(cssData);
			const url = `data:text/css;base64,${base64Data}`;
			return `@import url(${JSON.stringify(url)});`;
		}),
		processedCss,
	].join('\n').trim();

	return { cssText, errors };
};

export default loadAndProcessCss;
