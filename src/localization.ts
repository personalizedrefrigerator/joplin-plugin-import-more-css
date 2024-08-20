interface AppLocalization {
	setting__maximumWidth: string;
	setting__maximumWidth__description: string;
	setting__paginate: string;
	setting__paginate__description: string;
	setting__fontSize: string;
	setting__fontSize__description: string;
	setting__fontFamily: string;
	settings__appName: string;
	settings__description: string;

	setting__textAlign: string;
	setting__textAlign__unset: string;
	setting__textAlign__start: string;
	setting__textAlign__end: string;
	setting__textAlign__center: string;
	setting__textAlign__justify: string;
}

const defaultStrings: AppLocalization = {
	settings__appName: 'Extra viewer settings',
	settings__description: 'Additional settings for Joplin\'s Markdown viewer.',

	setting__textAlign: 'Text alignment',
	setting__textAlign__unset: 'Unset',
	setting__textAlign__start: 'Start',
	setting__textAlign__end: 'End',
	setting__textAlign__center: 'Center',
	setting__textAlign__justify: 'Justify',

	setting__maximumWidth: 'Maximum width',
	setting__maximumWidth__description: 'Maximum width of rendered content in the note viewer. Set this to 0 to use the default.',
	setting__paginate: 'Paginate',
	setting__paginate__description:
		'If enabled, Markdown notes are shown in a paged reading mode. In this mode, reading progress is saved and synced across devices.',
	setting__fontSize: 'Font size',
	setting__fontSize__description: 'Text size in points.',
	setting__fontFamily: 'Font family',
};

const localizations: Record<string, AppLocalization> = {
	en: defaultStrings,

	es: {
		...defaultStrings,
	},
};

let localization: AppLocalization | undefined;

const languages = [...navigator.languages];
for (const language of navigator.languages) {
	const localeSep = language.indexOf('-');

	if (localeSep !== -1) {
		languages.push(language.substring(0, localeSep));
	}
}

for (const locale of languages) {
	if (locale in localizations) {
		localization = localizations[locale];
		break;
	}
}

if (!localization) {
	console.log('No supported localization found. Falling back to default.');
	localization = defaultStrings;
}

export default localization!;
