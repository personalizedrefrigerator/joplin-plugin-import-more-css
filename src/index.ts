import joplin from 'api';
import { ContentScriptType } from 'api/types';
import { contentScriptId } from './constants';
import loadCssFromUrl from './utils/loadCssFromUrl';
import loadAndProcessCss from './utils/loadAndProcessCss';


joplin.plugins.register({
	onStart: async function() {
		await joplin.contentScripts.register(ContentScriptType.MarkdownItPlugin, contentScriptId, './contentScript/contentScript.js');
		await joplin.contentScripts.onMessage(contentScriptId, async (message: any) => {
			if (message.kind === 'getCss') {
				const urls = message.urls as string[];
				if (!Array.isArray(urls)) throw new Error('Wrong urls[] type');

				const cssData = await Promise.all(urls.map(url => {
					return loadAndProcessCss(url, loadCssFromUrl);
				}));

				return cssData;
			}
		});
	},
});
