const PROJECT_PREFIX = 'floorscape_project_';
const PUBLIC_PREFIX = 'floorscape_public_';

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({  error: message, ...extra }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
}

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();

        return user?.uuid || null;
    } catch {
        return null;
    }
}

router.post('/api/projects/save', async ({ request, user }) => {
    try {
        const userPuter = user.puter
        const appPuter = me?.puter;
        console.log("save:", appPuter)
        if(!userPuter) return jsonError(401, 'Authentication failed');

        const body = await request.json();
        const project = body?.project;

        if(!project?.id || !project?.sourceImage) return jsonError(400, 'Project ID and source image are required');

        const payload = {
            ...project,
            updatedAt: new Date().toISOString(),
        }

        const userId = await getUserId(userPuter);
        if(!userId) return jsonError(401, 'Authentication failed');

        const projectKey = `${PROJECT_PREFIX}${project.id}`;
        const publicKey = `${PUBLIC_PREFIX}${project.id}`;
        await userPuter.kv.set(projectKey, payload);
        if(body.visibility === "public") {
            if(appPuter) {
                await appPuter.kv.set(publicKey, payload)
            }
        } else {
            if(appPuter) {
                await appPuter.kv.del(publicKey)
            }
        }

        return { saved: true, id: project.id, project: payload }
    } catch (e) {
        return jsonError(500, 'Failed to save project', { message: e.message || 'Unknown error' });
    }
})

router.get('/api/projects/list', async ({ user, me }) => {
    try {
        const userPuter = user.puter;
        const appPuter = me?.puter;

        const userId = await getUserId(userPuter);
        const userProjects = userPuter && userId
            ? (await userPuter.kv.list(PROJECT_PREFIX, true)).map(({ value }) => value)
            : [];

        const publicProjects = appPuter
            ? (await appPuter.kv.list(PUBLIC_PREFIX, true)).map(({ value }) => ({ ...value, isPublic: true }))
            : [];

        return { projects: [...publicProjects, ...userProjects] };
    } catch (e) {
        return jsonError(500, 'Failed to list projects', { message: e.message || 'Unknown error' });
    }
});

// Public-only listing endpoint so unauthenticated users (e.g., community page)
// can fetch the shared catalog without needing a user session.
router.get('/api/projects/public', async ({  }) => {
    try {
        console.log("me", me)

        const appPuter = me?.puter;

        if (!appPuter) return jsonError(500, 'Shared storage is not configured for this worker');

        const publicProjects = (await appPuter.kv.list(PUBLIC_PREFIX, true))
            .map(({ value }) => ({ ...value, isPublic: true })) ?? [];
        console.log("projects", publicProjects.length)

        return { projects: publicProjects };
    } catch (e) {
        return jsonError(500, 'Failed to list public projects', { message: e.message || 'Unknown error' });
    }
});

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return jsonError(400, 'Project ID is required');

        const key = `${PROJECT_PREFIX}${id}`;
        const project = await userPuter.kv.get(key);

        if (!project) return jsonError(404, 'Project not found');

        return { project };
    } catch (e) {
        return jsonError(500, 'Failed to get project', { message: e.message || 'Unknown error' });
    }
})

// This is an example application for Puter Workers

router.get('/', ({request}) => {
    return 'Hello World ...v3'; // returns a string
});
router.get('/api/hello', ({request}) => {
    return {'msg': 'hello'}; // returns a JSON object
});
router.get('/*page', ({request, params}) => {
    return new Response(`Page ${params.page} not found`, {status: 404});
});
