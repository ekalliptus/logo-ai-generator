# Logo AI Generator

Web app that generates logo concepts from a brand description using GPT image models, accessed through AgentRouter.

## Features

- Describe a brand concept and pick a visual style
- Color customization
- Generated logo gallery
- Login with Firebase authentication
- Download generated logos as a ZIP archive (JSZip)

## Tech Stack

- Frontend: React 19 + Vite, Tailwind CSS
- Backend: Express (server/)
- Firebase (client SDK and firebase-admin)
- JSZip

## Getting Started

Copy `.env.example` to `.env` and fill in the Firebase and AgentRouter credentials.

```bash
npm install
npm run dev:all
```

`dev:all` starts the API server and the Vite dev server together.

Build:

```bash
npm run build
```

## License

MIT. See [LICENSE](LICENSE).
