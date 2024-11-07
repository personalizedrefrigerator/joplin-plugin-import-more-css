import { describe, it } from 'node:test';
import { strictEqual } from 'node:assert';
import loadAndProcessCss from './loadAndProcessCss';

const testCssProcess = (cssUrlToData: Record<string, string>, startUrl: string) => {
	return loadAndProcessCss(startUrl, async (url) => {
		if (!(url in cssUrlToData)) {
			throw new Error(`Failed to fetch from ${JSON.stringify(url)} -- not found in ${
				JSON.stringify(Object.keys(cssUrlToData))
			}`);
		}
		return cssUrlToData[url];
	});
};

const toCssUrl = (cssText: string) => {
	return `data:text/css;base64,${Buffer.from(cssText).toString('base64')}`;
};

const textToCssImportStatement = (text: string) => {
	return `@import url(${JSON.stringify(toCssUrl(text))});`;
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

	it('should resolve multiple same-line relative file imports', async () => {
		const importedFile = `/* Test! */`
		strictEqual(
			await testCssProcess({
				'/start.css': '@import "./test.css"; @import "./test.css";',
				'/test.css': importedFile,
			}, '/start.css'),
			`${textToCssImportStatement(importedFile)} ${textToCssImportStatement(importedFile)}`,
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