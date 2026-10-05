## Running the Application

The application consists of both a **frontend** and **backend**, so both servers must be running simultaneously.

### 1. Install dependencies

If you have not already installed the project dependencies, run:

```bash
npm install
```

Run this separately inside both the `frontend` and `backend` directories if they each have their own `package.json`.

### 2. Start the backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm install
npm run dev
```

Keep this terminal running.

### 3. Start the frontend

Open a **second terminal** and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Keep this terminal running as well.

### 4. Open the application

Once the frontend development server has started, open the URL shown in the terminal. By default, this will be:

```text
http://localhost:5173/
```

The frontend communicates with the backend while both development servers are running.
