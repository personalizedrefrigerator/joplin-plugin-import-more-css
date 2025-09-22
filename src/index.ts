import joplin from 'api';
import { ContentScriptType } from 'api/types';
import { contentScriptId, SettingKey } from './constants';
import loadCssFromUrl from './utils/loadCssFromUrl';
import loadAndProcessCss from './utils/loadAndProcessCss';
import registerSettings from './registerSettings';
import noteLinkToId from './utils/noteLinkToId';

joplin.plugins.register({
	onStart: async function() {
		await registerSettings();
		await joplin.contentScripts.register(ContentScriptType.MarkdownItPlugin, contentScriptId, './contentScript/contentScript.js');
		await joplin.contentScripts.onMessage(contentScriptId, async (message: any) => {
			if (message.kind === 'getCss') {
				const urls = message.urls as string[];
				if (!Array.isArray(urls)) throw new Error('Wrong urls[] type');

				const cssData = await Promise.all(urls.map(url => {
					return loadAndProcessCss(url, loadCssFromUrl);
				}));

				return cssData;
			} else if (message.kind === 'getGlobalCss') {
				const globalCssUrl = await joplin.settings.value(SettingKey.GlobalCssNote);
				const noteId = globalCssUrl && noteLinkToId(globalCssUrl);
				if (noteId) {
					return await loadAndProcessCss(`:/${noteId}`, loadCssFromUrl);
				} else {
					return null;
				}
			}
		});
	},
});
