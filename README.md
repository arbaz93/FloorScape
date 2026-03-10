# Floorscape

Floorscape is an AI-assisted architectural visualization app that converts uploaded 2D floor plans into rendered top-down 3D interiors. The frontend is built with React Router 7, React 19, Vite, and Tailwind CSS v4, while authentication, file hosting, AI image generation, and project persistence are handled through Puter services.

## Project Overview

The application is designed around a simple workflow:

1. Sign in with Puter.
2. Upload a floor plan image.
3. Generate a photorealistic 3D render from the plan.
4. Review the result in a visualizer with before/after comparison.
5. Export the generated image and revisit saved projects.

The codebase includes both:

- A React Router frontend for the user interface
- A Puter worker script that exposes project persistence endpoints

## Features

- Puter-based authentication
- Drag-and-drop floor plan upload
- AI-powered 2D-to-3D floor plan rendering
- Automatic project creation and persistence
- Hosted asset upload for source and rendered images
- Project listing on the home page
- Project detail route at `visualizer/:id`
- Before/after image comparison with `react-compare-slider`
- Render export as a local PNG download
- Docker support for containerized builds

## Tech Stack

### Frontend

- React 19
- React Router 7
- TypeScript
- Vite 7
- Tailwind CSS 4
- `lucide-react`
- `react-compare-slider`

### Backend / Platform Services

- Puter SDK (`@heyputer/puter.js`)
- Puter Auth
- Puter KV
- Puter Hosting
- Puter Workers
- Puter AI image generation

### Tooling

- Node.js 20+
- npm
- Docker

## Installation

### Prerequisites

- Node.js 20 or newer
- npm
- A Puter account
- A deployed Puter worker URL for project persistence

### Clone and install

```bash
git clone <your-repo-url>
cd roomify
npm install
```

### Environment variables

Create `.env.local` in the project root with:

```env
VITE_PUTER_WORKER_URL=https://your-worker.puter.work
```

`VITE_PUTER_WORKER_URL` is required for saving, listing, and fetching projects.

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Run the production build

```bash
npm run start
```

## Usage Examples

### Typical user flow

1. Open the app.
2. Click `Log In` and authenticate with Puter.
3. Upload a `.jpg`, `.jpeg`, `.png`, or `.webp` floor plan image.
4. Wait for the visualizer route to generate the 3D render.
5. Compare the original plan and generated render.
6. Export the final image.

### Local development

```bash
npm install
npm run dev
```

Then open the local Vite/React Router dev URL shown in the terminal.

### Docker

Build the container:

```bash
docker build -t floorscape .
```

Run the container:

```bash
docker run -p 3000:3000 floorscape
```

## Available Scripts

- `npm run dev` starts the development server
- `npm run build` builds the React Router app
- `npm run start` serves the built app from `./build/server/index.js`
- `npm run typecheck` runs route type generation and TypeScript checks

## Folder Structure

```text
roomify/
├── app/
│   ├── app.css
│   ├── root.tsx
│   ├── routes.ts
│   └── routes/
│       ├── home.tsx
│       └── visualizer.$id.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Upload.tsx
│   └── ui/
│       └── Button.tsx
├── lib/
│   ├── ai.action.ts
│   ├── constants.ts
│   ├── puter.action.ts
│   ├── puter.hosting.tsx
│   ├── puter.worker.js
│   └── utils.tsx
├── public/
├── build/
├── Dockerfile
├── package.json
├── react-router.config.ts
├── tsconfig.json
├── type.d.ts
└── vite.config.ts
```

## Routing

Detected routes:

- `/` renders the home page with upload and project listing
- `/visualizer/:id` renders the project visualizer and generation workflow

## API Documentation

The repository contains a Puter worker implementation in `lib/puter.worker.js`. The frontend calls these endpoints through `puter.workers.exec(...)`.

### Base URL

```text
${VITE_PUTER_WORKER_URL}
```

### `POST /api/projects/save`

Saves or updates a project.

Request body:

```json
{
  "project": {
    "id": "1741330123456",
    "name": "Floorscape plan 1741330123456",
    "sourceImage": "data:image/png;base64,...",
    "renderedImage": "data:image/png;base64,...",
    "timestamp": 1741330123456
  },
  "visibility": "private"
}
```

Success response:

```json
{
  "saved": true,
  "id": "1741330123456",
  "project": {
    "id": "1741330123456",
    "name": "Floorscape plan 1741330123456",
    "sourceImage": "https://...",
    "renderedImage": "https://...",
    "timestamp": 1741330123456,
    "updatedAt": "2026-03-10T00:00:00.000Z"
  }
}
```

### `GET /api/projects/list`

Returns saved projects for the authenticated user context.

Success response:

```json
{
  "projects": [
    {
      "id": "1741330123456",
      "name": "Floorscape plan 1741330123456",
      "sourceImage": "https://...",
      "renderedImage": "https://...",
      "timestamp": 1741330123456,
      "isPublic": true
    }
  ]
}
```

### `GET /api/projects/get?id=<projectId>`

Fetches one project by ID.

Success response:

```json
{
  "project": {
    "id": "1741330123456",
    "name": "Floorscape plan 1741330123456",
    "sourceImage": "https://...",
    "renderedImage": "https://...",
    "timestamp": 1741330123456
  }
}
```

### Authentication behavior

All detected worker endpoints require a valid Puter-authenticated user. The worker returns `401` when authentication fails.

## AI Rendering Flow

The render pipeline is implemented in `lib/ai.action.ts`:

- Accepts a source image as a data URL or hosted URL
- Converts it to base64
- Sends it to Puter AI using the Gemini image model
- Returns a rendered image for display and persistence

The prompt in `lib/constants.ts` instructs the model to:

- preserve the original floor-plan geometry
- remove labels and plan text
- keep a strict top-down perspective
- produce a realistic architectural visualization

## Contribution Guidelines

Contributions should stay consistent with the current architecture:

1. Fork the repository and create a feature branch.
2. Keep changes scoped and focused.
3. Update documentation when behavior or setup changes.
4. Run `npm run typecheck` before opening a pull request.
5. Include screenshots or short notes for UI changes.
6. Describe any Puter worker or environment variable changes in the PR.

Example workflow:

```bash
git checkout -b feat/improve-visualizer
npm run typecheck
git commit -m "Improve visualizer render handling"
```

## License

No license file was detected in this repository at the time of writing. If you intend to distribute or open-source the project, add a license file such as `LICENSE` and update this section accordingly.
