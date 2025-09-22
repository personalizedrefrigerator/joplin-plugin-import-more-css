import joplin from 'api';
import { ContentScriptType } from 'api/types';
import { contentScriptId, SettingKey } from './constants';
import loadCssFromUrl from './utils/loadCssFromUrl';
import loadAndProcessCss, { CssResult } from './utils/loadAndProcessCss';
import registerSettings from './registerSettings';
import noteLinkToId from './utils/noteLinkToId';

joplin.plugins.register({
	onStart: async function() {
		const settings = await registerSettings();
		const logImportErrors = (result: CssResult[]) => {
			if (settings.settings[SettingKey.LogImportFailures]) {
				for (const { errors } of result) {
					for (const error of errors) {
						console.error('Import error', error);
					}
				}
			}
		};

		await joplin.contentScripts.register(ContentScriptType.MarkdownItPlugin, contentScriptId, './contentScript/contentScript.js');
		await joplin.contentScripts.onMessage(contentScriptId, async (message: any) => {
			if (message.kind === 'getCss') {
				const urls = message.urls as string[];
				if (!Array.isArray(urls)) throw new Error('Wrong urls[] type');

				const cssData = await Promise.all(urls.map(url => {
					return loadAndProcessCss(url, loadCssFromUrl);
				}));

				logImportErrors(cssData);

				return cssData;
			} else if (message.kind === 'getGlobalCss') {
				const globalCssUrl = settings.settings[SettingKey.GlobalCssNote];
				const noteId = globalCssUrl && noteLinkToId(globalCssUrl);
				if (noteId) {
					const result = await loadAndProcessCss(`:/${noteId}`, loadCssFromUrl);

					logImportErrors([result]);

					return result;
				} else {
					return null;
				}
			}
		});
	},
});
