export const HOSTING_CONFIG_KEY = "floorscape_hosting_config";
export const HOSTING_DOMAIN_SUFFIX = ".puter.site";

export const isHostedUrl = (value: unknown): value is string =>
    typeof value === "string" && value.includes(HOSTING_DOMAIN_SUFFIX);

export const createHostingSlug = () =>
    `floorscape-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

const normalizeHost = (subdomain: string) =>
    subdomain.endsWith(HOSTING_DOMAIN_SUFFIX)
        ? subdomain
        : `${subdomain}${HOSTING_DOMAIN_SUFFIX}`;

export const getHostedUrl = (
    hosting: { subdomain: string },
    filePath: string,
): string | null => {
    if (!hosting?.subdomain) return null;
    const host = normalizeHost(hosting.subdomain);
    return `https://${host}/${filePath}`;
};

export const getImageExtension = (contentType: string, url: string): string => {
    const type = (contentType || "").toLowerCase();
    const typeMatch = type.match(/image\/(png|jpe?g|webp|gif|svg\+xml|svg)/);
    if (typeMatch?.[1]) {
        const ext = typeMatch[1].toLowerCase();
        return ext === "jpeg" || ext === "jpg"
            ? "jpg"
            : ext === "svg+xml"
                ? "svg"
                : ext;
    }

    const dataMatch = url.match(/^data:image\/([a-z0-9+.-]+);/i);
    if (dataMatch?.[1]) {
        const ext = dataMatch[1].toLowerCase();
        return ext === "jpeg" ? "jpg" : ext;
    }

    const extMatch = url.match(/\.([a-z0-9]+)(?:$|[?#])/i);
    if (extMatch?.[1]) return extMatch[1].toLowerCase();

    return "png";
};

export const dataUrlToBlob = (
    dataUrl: string,
): { blob: Blob; contentType: string } | null => {
    try {
        const match = dataUrl.match(/^data:([^;]+)?(;base64)?,([\s\S]*)$/i);
        if (!match) return null;
        const contentType = match[1] || "";
        const isBase64 = !!match[2];
        const data = match[3] || "";
        const raw = isBase64
            ? atob(data.replace(/\s/g, ""))
            : decodeURIComponent(data);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i += 1) {
            bytes[i] = raw.charCodeAt(i);
        }
        return { blob: new Blob([bytes], { type: contentType }), contentType };
    } catch {
        return null;
    }
};

export const fetchBlobFromUrl = async (
    url: string,
): Promise<{ blob: Blob; contentType: string } | null> => {
    if (url.startsWith("data:")) {
        return dataUrlToBlob(url);
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch image");
        return {
            blob: await response.blob(),
            contentType: response.headers.get("content-type") || "",
        };
    } catch {
        return null;
    }
};

export const imageUrlToPngBlob = async (url: string): Promise<Blob | null> => {
    if (typeof window === "undefined") return null;

    try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = url;
        });

        const width = loaded.naturalWidth || loaded.width;
        const height = loaded.naturalHeight || loaded.height;
        if (!width || !height) return null;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        ctx.drawImage(loaded, 0, 0, width, height);

        return await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((result) => resolve(result), "image/png");
        });
    } catch {
        return null;
    }
};

/**
 * Extract image dimensions from a data URL.
 * Returns `null` if the URL is invalid or cannot be loaded (e.g., missing DOM).
 */
export const getDimensionsFromDataURL = async (
    dataUrl: string,
): Promise<{ width: number; height: number } | null> => {
    if (!dataUrl || typeof window === "undefined") return null;

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const width = img.naturalWidth || img.width;
            const height = img.naturalHeight || img.height;
            resolve(width && height ? { width, height } : null);
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
    });
};

/**
 * Scale width/height so the largest dimension equals `max` while preserving aspect ratio.
 * If both dimensions are already within `max`, the original values are returned.
 */
export const fitWithinMaxDimension = (
    width: number,
    height: number,
    max: number,
): { width: number; height: number } => {
    if (max <= 0 || width <= 0 || height <= 0) {
        return { width, height };
    }

    const largest = Math.max(width, height);
    if (largest <= max) return { width, height };

    const scale = max / largest;
    return {
        width: width * scale,
        height: height * scale,
    };
};

/**
 * Resize an image File so its largest dimension equals `max` while preserving aspect ratio.
 * If both dimensions are already <= max (or environment lacks DOM), the original File is returned.
 */
export const resizeImageFileToMax = async (
    image: File | undefined,
    max: number,
): Promise<File> => {
    if (!image || max <= 0 || typeof window === "undefined") return image;
    if (!image.type.startsWith("image/")) return image;

    const objectUrl = URL.createObjectURL(image);

    try {
        const img = new Image();

        const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = objectUrl;
        });

        const originalWidth = loaded.naturalWidth || loaded.width;
        const originalHeight = loaded.naturalHeight || loaded.height;

        if (originalWidth <= max && originalHeight <= max) return image;

        const { width, height } = fitWithinMaxDimension(
            originalWidth,
            originalHeight,
            max,
        );

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);

        const ctx = canvas.getContext("2d");
        if (!ctx) return image;

        ctx.drawImage(loaded, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(
                (result) => resolve(result),
                image.type || "image/png",
            ),
        );

        if (!blob) return image;

        return new File([blob], image.name, {
            type: blob.type,
            lastModified: Date.now(),
        });
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
};

/**
 * Convert an image File to a 1024x1024 PNG while preserving aspect ratio.
 * The image is scaled to fit within the square and centered on a transparent background.
 */
export const convertImageFileTo1024Square = async (
    image: File | undefined,
): Promise<File | undefined> => {
    if (!image || typeof window === "undefined") return image;
    if (!image.type.startsWith("image/")) return image;

    const objectUrl = URL.createObjectURL(image);
    const TARGET_SIZE = 1024;

    try {
        const img = new Image();
        const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = objectUrl;
        });

        const originalWidth = loaded.naturalWidth || loaded.width;
        const originalHeight = loaded.naturalHeight || loaded.height;
        if (!originalWidth || !originalHeight) return image;

        // Scale to fit within 1024x1024 while preserving aspect ratio
        const { width, height } = fitWithinMaxDimension(
            originalWidth,
            originalHeight,
            TARGET_SIZE,
        );

        const canvas = document.createElement("canvas");
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return image;

        // Fill the padded area with white so transparent pixels don't become black
        // when models ignore the alpha channel.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

        // Center the scaled image in the square canvas
        const offsetX = (TARGET_SIZE - Math.round(width)) / 2;
        const offsetY = (TARGET_SIZE - Math.round(height)) / 2;
        ctx.drawImage(
            loaded,
            Math.round(offsetX),
            Math.round(offsetY),
            Math.round(width),
            Math.round(height),
        );

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((result) => resolve(result), "image/png"),
        );
        if (!blob) return image;

        return new File([blob], image.name.replace(/\.[^.]+$/, "") + ".png", {
            type: "image/png",
            lastModified: Date.now(),
        });
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
};
