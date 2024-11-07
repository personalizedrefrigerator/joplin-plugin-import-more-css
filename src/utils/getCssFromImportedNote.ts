
const cssFromImportedNote = (noteText: string) => {
	// Remove any leading/trailing ```css ``` blocks (if added for syntax highlighting)
	const cssStartMatch = noteText.match(/(?:[\n]|^)(`{3,})css[\r]?[\n]/);
	if (cssStartMatch) {
		noteText = noteText.substring(cssStartMatch.index + cssStartMatch[0].length);

		const backticks = cssStartMatch[1];
		const cssEndIndex = noteText.indexOf(`\n${backticks}`);
		if (cssEndIndex !== -1) {
			noteText = noteText.substring(0, cssEndIndex);
		}
	}

	return noteText;
};

export default cssFromImportedNote;
