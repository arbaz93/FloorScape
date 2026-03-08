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