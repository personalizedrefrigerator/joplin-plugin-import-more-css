import { cssImportRegexes } from "../constants";
import canCustomImportCssUrl from "./canCustomImportCssUrl";
import stringToBase64 from "./stringToBase64";
import { resolve, dirname } from "path";

type FetchCssCallback = (url: string)=>Promise<string>;
const loadAndProcessCss = async (
	cssUrl: string,
	fetchCssFromUrl: FetchCssCallback,

	// @internal
	parentUrls: string[] = [],
) => {
	// Base case: CSS already loaded (prevents infinite recursion).
	if (parentUrls.includes(cssUrl)) {
		return '';
	}

	// Handle relative path imports:
	if (cssUrl.startsWith('./')) {
		const parentDirs = parentUrls.map(dirname);
		cssUrl = resolve(...parentDirs, cssUrl);
	}
	let cssText = await fetchCssFromUrl(cssUrl);

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

	const originalUrlToUpdated: Map<string, string> = new Map();

	await Promise.all([...allUrls].map(async url => {
		const base64Url = stringToBase64(
			await loadAndProcessCss(url, fetchCssFromUrl, [...parentUrls, cssUrl])
		);

		originalUrlToUpdated.set(url, `data:text/css;base64,${base64Url}`);
	}));


	for (const regex of cssImportRegexes) {
		cssText = cssText.replace(regex, (fullMatch, url: string) => {
			if (!originalUrlToUpdated.has(url)) return fullMatch;

			const updatedUrl = originalUrlToUpdated.get(url);
			return `@import url(${JSON.stringify(updatedUrl)});`;
		});
	}

	return cssText;
};

export default loadAndProcessCss;
