import { describe, it } from 'node:test';
import { strictEqual } from 'node:assert';
import removeCssComments from './removeCssComments';

describe('replaceImportsRecursive', () => {
	[
		'* { color: red; }',
		'*:before { content: "🕳️"; }',
		'*:before { content: "/* Test */"; }',
		'*:before { content: "/* Test"; }',
		'*:before { content: \'/* Test */\'; }',
	].forEach((testCase, index) => {
		it(`should preserve content when there are no comments (case ${index})`, () => {
			strictEqual(
				removeCssComments(testCase),
				testCase,
			);
		});
	});

	[
		['/** { color: red; }*/', ''],
		['/** { color: red; }*/ * { color: blue; } /* test */', ' * { color: blue; } '],
		[
			'*[id*=/] { color: orange; &:before { /* content: ""; */ content: "/* Test */"; } }',
			'*[id*=/] { color: orange; &:before {  content: "/* Test */"; } }'
		],
		['body { color: orange; } /* Multi-line\n\ttest\n*/ body { color: red; }', 'body { color: orange; }  body { color: red; }'],
	].forEach(([before, after], index) => {
		it(`should completely remove CSS comments (case ${index})`, () => {
			strictEqual(
				removeCssComments(before),
				after,
			);
		});
	});
});