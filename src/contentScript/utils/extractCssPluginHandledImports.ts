import { cssImportRegexes } from "../../constants";
import canCustomImportCssUrl from "../../utils/canCustomImportCssUrl";

/**
 * Removes certain CSS `@import`s from `cssText` and returns the extracted URLs.
 * 
 * At present, `file://`, `/`, and note (`:/`) imports are extracted.
 */
const extractCssPluginHandledImports = (cssText: string) => {
	const extractedUrls: string[] = [];

	for (const regex of cssImportRegexes) {
		cssText = cssText.replace(regex, (content, url: string) => {
			// File and note links:
			if (canCustomImportCssUrl(url)) {
				extractedUrls.push(url);
				// Remove: Imports are handled by the main script.
				return '';
			}
			return content;
		});
	}

	return { extractedUrls, updatedCss: cssText };
};

export default extractCssPluginHandledImports;
