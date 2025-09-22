import joplin from "api"

let platform: string|null = null;
const isMobile = async () => {
    try {
        platform ??= (await joplin.versionInfo()).platform;
        return platform === 'mobile';
    } catch (error) {
        // Backwards compatibility with very old Joplin versions that do not
        // support .versionInfo:
        console.error(error);
        return false;
    }
};

export default isMobile;