import { describe, it } from 'node:test';
import { strictEqual } from 'node:assert';
import stringToBase64 from './stringToBase64';

describe('stringToBase64', () => {
	it('should convert ASCII to base64', () => {
		strictEqual(
			stringToBase64('test'),
			Buffer.from('test').toString('base64'),
		);
	});

	it('should convert unicode to base64', () => {
		const testString = 'This is an emoji: ☺️';
		strictEqual(
			stringToBase64(testString),
			Buffer.from(testString).toString('base64'),
		);
	});
});