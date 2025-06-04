** Project Structure **
ERAv3-Capstone/
├── .git/                     # Git version control directory
├── .gitignore                # Files and directories to ignore in Git
├── frontend/                 # Frontend application directory
│   ├── public/               # Public static assets
│   │   └── index.html        # Main HTML file
│   ├── src/                  # Source code for the frontend
│   │   ├── components/       # React components
│   │   │   └── index.tsx     # Component file
│   │   ├── pages/            # Page components
│   │   │   └── index.tsx     # Page file
│   │   ├── styles/           # Stylesheets
│   │   │   └── index.css      # CSS file
│   │   ├── types/            # TypeScript type definitions
│   │   │   └── index.ts      # Type definitions file
│   │   ├── App.tsx           # Main application component
│   │   ├── index.tsx         # Entry point for the React application
│   │   └── react-app-env.d.ts # TypeScript reference file
│   ├── package.json          # Project metadata and dependencies
│   ├── package-lock.json     # Dependency lock file
│   └── tsconfig.json         # TypeScript configuration file
└── backend/                  # Backend application directory
    ├── coding_agent/         # Coding agent module
    │   └── main.py           # Main Python file
    ├── rag_agent/            # RAG agent module
    │   └── main.py           # Main Python file
    └── socratic_agent/       # Socratic agent module
        └── main.py           # Main Python file