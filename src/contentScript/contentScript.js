exports.default = () => {
	return {
		plugin: async (_markdownIt) => {
		},

		assets: () => ([
			{ name: 'viewer.js' },
		]),
	}
};