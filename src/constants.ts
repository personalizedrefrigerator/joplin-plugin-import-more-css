
export const contentScriptId = 'personalizedrefrigerator-local-css-imports-content-script';

export const cssImportRegexes = [
	/@import\s+"(.*?)";/g,
	/@import\s+'(.*?)';/g,
	/@import\s+url\("(.*?)"\);/g,
	/@import\s+url\('(.*?)'\);/g,
	/@import\s+url\(\s*(.*?)\s*\);/g,
];
