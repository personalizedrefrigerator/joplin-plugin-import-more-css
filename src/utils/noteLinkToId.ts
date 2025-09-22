const noteLinkToId = (linkOrId: string) => {
	if (!linkOrId) {
		return null;
	}

    linkOrId = linkOrId.trim().toLowerCase();

	const idMatch = /^:\/([a-z0-9]{32})$/.exec(linkOrId);
	if (idMatch) {
		return idMatch[1];
	}

	const markdownLinkMatch = /^\[[^\]]*\]\(:\/([a-z0-9]{32})\)$/.exec(linkOrId);
	if (markdownLinkMatch) {
		return markdownLinkMatch[1];
	}

	const externalLinkMatch = /^joplin:\/\/.*\/opennote\?id=([a-z0-9]{32})$/.exec(linkOrId);
	if (externalLinkMatch) {
		return externalLinkMatch[1];
	}

    if (linkOrId.trim().match(/^[a-z0-9]{32}$/)) {
        return linkOrId;
    }

	return null;
};

export default noteLinkToId;