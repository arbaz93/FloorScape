import puter from "@heyputer/puter.js";

const signIn = async () => await puter.auth.signIn();

const signOut = () => puter.auth.signOut();

const getCurrentUser = async () => {
    try {
        return await puter.auth.getUser();
    } catch {
        return null
    }
}

export { signIn, signOut, getCurrentUser }