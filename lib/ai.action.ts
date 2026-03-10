import puter from "@heyputer/puter.js";
import {FLOORSCAPE_RENDER_PROMPT} from "./constants";

const fetchAsDataUrl = async (url:string):Promise<string> => {
    const response = await fetch(url);

    if(!response?.ok) {
        throw new Error(`failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);

        reader.onerror = () => reject;
        reader.readAsDataURL(blob)
    })
}

export const generate3DView = async ({ sourceImage }:Generate3DViewParams) => {
    const dataUrl = sourceImage.startsWith("data:")
        ? sourceImage
        : await fetchAsDataUrl(sourceImage);

    const base64Data = dataUrl.split(",")[1];
    const mimeType = dataUrl.split(";")[0].split(":")[1];

    if(!mimeType || !base64Data) {
        throw new Error("failed to fetch image payload ...")
    }

    const geminiOptions = {
        provider: "gemini",
        model: "gemini-2.5-flash-image-preview",
        input_image: base64Data,
        input_image_mime_type: mimeType,
        ratio: { w: 1024, h: 1024}
    }

    const response = await puter.ai.txt2img(FLOORSCAPE_RENDER_PROMPT, geminiOptions);

    const renderedImageUrl = (response as HTMLImageElement).src ?? null;

    if(!renderedImageUrl) return { renderedImage: null, renderedPath: undefined }

    const renderedImage = renderedImageUrl.startsWith("data:")
        ? renderedImageUrl
        : await fetchAsDataUrl(renderedImageUrl)

    return { renderedImage, renderedPath: undefined }
}