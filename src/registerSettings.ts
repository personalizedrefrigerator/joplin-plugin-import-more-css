import joplin from 'api';
import { SettingItemType, SettingStorage } from 'api/types';
import { SettingKey } from './constants';
import isMobile from './utils/isMobile';

const registerSettings = async () => {
	const sectionName = 'local-css';
	await joplin.settings.registerSection(sectionName, {
		label: 'Local CSS',
		iconName: 'fas fa-image',
	});

	await joplin.settings.registerSettings({
		[SettingKey.GlobalCssNote]: {
			public: true,
			section: sectionName,

			label: 'Global CSS note',
			description: 'A link to a note that contains CSS (in a Markdown ```css block). The CSS in this block only applies to the note viewer, when viewing a Markdown note. This can be a Joplin internal or external link.',
			storage: SettingStorage.File,

			type: SettingItemType.String,
			value: '',
		},
		[SettingKey.LogImportFailures]: {
			public: await isMobile(),
			section: sectionName,

			label: 'Log CSS import failures',
			description: 'Add CSS import failures to the plugin\'s log.',
			storage: SettingStorage.File,

			type: SettingItemType.Bool,
			value: false,
			advanced: true,
		},
	});


	const getSettings = async () => ({
		[SettingKey.GlobalCssNote]: await joplin.settings.value(SettingKey.GlobalCssNote),
		[SettingKey.LogImportFailures]: await joplin.settings.value(SettingKey.LogImportFailures),
	});

	let settings = await getSettings();
	await joplin.settings.onChange(async () => {
		settings = await getSettings();
	})

	return {
		get settings() {
			return settings;
		},
	};
};

export default registerSettings;
