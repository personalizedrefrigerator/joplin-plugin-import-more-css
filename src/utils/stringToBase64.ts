
/** Converts `text` to a base64 string in a way that doesn't require NodeJS APIs. */
const stringToBase64 = (text: string) => {
	// See MDN: https://github.com/mdn/content/blob/3b8be0ad781b128b70ef0d208de84932755eb4d0/files/en-us/glossary/base64/index.md#the-unicode-problem
	const encodedText = new TextEncoder().encode(text);
	// Re-encode as ASCII -- btoa doesn't support Unicode.
	const reencodedText = Array.from(
		encodedText,
		byte => String.fromCodePoint(byte),
	).join('');
	return btoa(reencodedText);
};

export default stringToBase64;
