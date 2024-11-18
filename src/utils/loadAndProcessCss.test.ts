import { describe, it } from 'node:test';
import { strictEqual } from 'node:assert';
import loadAndProcessCss from './loadAndProcessCss';

const testCssProcess = async(cssUrlToData: Record<string, string>, startUrl: string) => {
	const processed = await loadAndProcessCss(startUrl, async (url) => {
		if (!(url in cssUrlToData)) {
			throw new Error(`Failed to fetch from ${JSON.stringify(url)} -- not found in ${
				JSON.stringify(Object.keys(cssUrlToData))
			}`);
		}
		return cssUrlToData[url];
	});
	return processed.cssText;
};

const toCssUrl = (cssText: string) => {
	return `data:text/css;base64,${Buffer.from(cssText).toString('base64')}`;
};

const textToCssImportStatement = (text: string) => {
	return `@import url(${JSON.stringify(toCssUrl(text.trim()))});`;
};

describe('replaceImportsRecursive', () => {
	it('should load CSS from provided URLs/data', async () => {
		strictEqual(
			await testCssProcess({
				'/test/example.css': '* { color: red; }',
			}, '/test/example.css'),
			'* { color: red; }',
		);

		strictEqual(
			await testCssProcess({
				':/somenoteidurlhere': '* { color: red; }\nbutton { filter: blur(1px); }',
			}, ':/somenoteidurlhere'),
			'* { color: red; }\nbutton { filter: blur(1px); }',
		);
	});

	it('should resolve relative file imports', async () => {
		const importedFile = `
			h1 {
				color: orange;
			}
		`;

		strictEqual(
			await testCssProcess({
				'/start.css': '@import "./test.css";',
				'/test.css': importedFile,
			}, '/start.css'),
			textToCssImportStatement(importedFile),
		);

		strictEqual(
			await testCssProcess({
				'/test/start.css': '@import "../test.css";',
				'/test.css': importedFile,
			}, '/test/start.css'),
			textToCssImportStatement(importedFile),
		);
	});

	it('should resolve file imports relative to the current directory', async () => {
		const importedFile = `* { color: orange; }`;
		strictEqual(
			await testCssProcess({
				'/start.css': '@import "./test.css"; @import "./test.css";',
				'/test.css': importedFile,
			}, '/start.css'),
			`${textToCssImportStatement(importedFile)}`,
		);
	});

	it('should allow multiple same-url relative imports that import different files', async () => {
		const importedFile1 = `* { background: red; }`;
		const importedFile2 = `* { color: red; }`;
		strictEqual(
			await testCssProcess({
				'/start.css': '@import "./test.css"; @import "./example/index.css";',
				'/example/index.css': '@import "./test.css";',
				'/example/test.css': importedFile2,
				'/test.css': importedFile1,
			}, '/start.css'),
			`${textToCssImportStatement(importedFile1)}\n${textToCssImportStatement(importedFile2)}`,
		);
	});

	it('should not re-import duplicate imports', async () => {
		const importedFile = `body { text-decoration: underline; }`;
		strictEqual(
			await testCssProcess({
				'/start.css': '@import "./test.css"; @import "./test.css";',
				'/test.css': importedFile,
			}, '/start.css'),
			`${textToCssImportStatement(importedFile)}`,
		);
	});

	it('should leave non-file imports unresolved', async () => {
		strictEqual(
			await testCssProcess({
				'/start.css': '@import "http://example.com/test.css";',
			}, '/start.css'),
			'@import "http://example.com/test.css";',
		);
	});
});