
const removeCssComments = (css: string) => {
	let inSingleQuote = false;
	let inDoubleQuote = false;
	let escaped = false;

	const result: string[] = [];

	for (let i = 0; i < css.length; i++) {
		const currentChar = css.charAt(i);
		const nextChar = i + 1 < css.length ? css.charAt(i + 1) : null;
		const inQuote = inSingleQuote || inDoubleQuote;
		let addChar = true;

		if (escaped) {
			escaped = !escaped;	
		} else if (currentChar === '"') {
			inDoubleQuote = !inDoubleQuote;
		} else if (currentChar === "'") {
			inSingleQuote = !inSingleQuote;
		} else if (currentChar === '/' && nextChar === '*' && !inQuote) {
			i += 2;
			// Skip the comment's content
			for (; i < css.length - 1; i++) {
				if (css.charAt(i) === '*' && css.charAt(i + 1) === '/') {
					i += 1;
					break;
				}
			}
			addChar = false;
		}

		if (addChar) {
			result.push(currentChar);
		}
	}

	return result.join('');
};

export default removeCssComments;