import puter from "@heyputer/puter.js";
import {getOrCreateHostingConfig, uploadImageToHosting} from "./puter.hosting";
import {isHostedUrl} from "./utils";

const signIn = async () => await puter.auth.signIn();

const signOut = () => puter.auth.signOut();

const getCurrentUser = async () => {
    try {
        return await puter.auth.getUser();
    } catch {
        return null
    }
}

const createProject = async ({ item }:CreateProjectParams): Promise<DesignItem | null | undefined> => {
    const projectId = item?.id;

    const hosting = await getOrCreateHostingConfig();

    const hostedSource = projectId ?
        await uploadImageToHosting( { hosting, url: item.sourceImage, projectId, label: "source"}) : null;

    const hostedRender = projectId && item?.renderedImage ?
        await uploadImageToHosting({ hosting, url: item.renderedImage, projectId, label: "rendered"}) : null;

    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage))
        ? item.sourceImage
        : "";

    if(!resolvedSource) {
        console.warn("failed to save source image ...");
        return null
    }

    const resolvedRender = hostedRender?.url
        ? hostedRender?.url
        : item.renderedImage && isHostedUrl(item.renderedImage)
            ? item.renderedImage
            : undefined;

    const {
        sourcePath: _sourcePath,
        renderedPath: _renderedPath,
        publicPath: _publicPath,
        ... rest
    } = item;

    const payload = {
        ... rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender
    }

    try {
        // call puter worker ...somethin
        return payload
    } catch (e) {
        console.log("Failed to save the project",e)
        return null
    }
}
export { signIn, signOut, getCurrentUser, createProject }