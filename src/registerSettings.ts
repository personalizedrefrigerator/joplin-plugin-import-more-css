import joplin from 'api';
import { SettingItemType, SettingStorage } from 'api/types';
import { SettingKey } from './constants';

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
	});
};

export default registerSettings;
