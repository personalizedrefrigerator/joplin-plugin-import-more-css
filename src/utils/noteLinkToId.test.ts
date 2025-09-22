import { describe, it } from 'node:test';
import noteLinkToId from './noteLinkToId';
import { strictEqual } from 'assert';

describe('noteLinkToId', () => {
	for (const [link, id] of [
		[
			'joplin://x-callback-url/openNote?id=a34fd126bed94bf3bb923169b57695f0',
			'a34fd126bed94bf3bb923169b57695f0',
		],
		[':/a34fd126bed94bf3bb923169b57695f0', 'a34fd126bed94bf3bb923169b57695f0'],
		['[Some note here](:/a34fd126bed94bf3bb923169b57695f0)', 'a34fd126bed94bf3bb923169b57695f0'],
	]) {
        it(`should extract ${id} from ${link}`, () => {
		    strictEqual(noteLinkToId(link), id);
        });
	}
});
