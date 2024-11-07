import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import extractCssPluginHandledImports from '../contentScript/utils/extractCssPluginHandledImports';
import getCssFromImportedNote from './getCssFromImportedNote';

describe('getCssFromImportedNote', () => {
	it('should return the note\'s content if no CSS block', () => {
		assert.strictEqual(
			getCssFromImportedNote('test'),
			'test',
		);
	});

	it('should remove a full-note CSS block', () => {
		assert.strictEqual(
			getCssFromImportedNote('```css\ntest\n```'),
			'test',
		);
	});

	it('should extract just the content within a css block', () => {
		assert.strictEqual(
			getCssFromImportedNote('Test:\n```css\ntest\ntest\n```\nafter'),
			'test\ntest',
		);
	});
})