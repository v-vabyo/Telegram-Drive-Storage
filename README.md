# Telegram Drive Storage 🚀☁️

Telegram Drive Storage is a modern, fast, and multi-user Software-as-a-Service (SaaS) cloud storage application that leverages the **Telegram MTProto API** as its underlying storage backend. 

By turning Telegram into a free, unlimited cloud storage drive, users can securely upload, organize, and download their files without worrying about local server disk space, all wrapped in a stunning glassmorphism UI.

---

## ✨ Features for End Users

- **Multi-User (SaaS) Architecture**: Anyone can log in using their Telegram phone number. The system completely isolates data; your files are stored on *your* Telegram account, and other users' files are stored on *theirs*.
- **Unlimited Storage Space**: Leverages Telegram's generous file storage limits (up to 2GB per file on standard, 4GB on Premium). You will never run out of disk space.
- **Virtual File System**: Create folders, navigate hierarchies, rename files, and organize data just like Google Drive or Dropbox.
- **Real-Time Upload Progress**: Smooth, chunk-based uploading with real-time UI progress indicators and cancellation support.
- **End-to-End Privacy**: Files are sent directly to your own `Saved Messages` (or dedicated private channels). Only you have access to them. The application does not read or moderate your content.

---

## 👨‍💻 For Developers

Telegram Drive Storage acts as a secure intermediary between the User's Browser and Telegram's MTProto API, using modern web technologies.

### 🏗️ Architecture Stack

1. **Frontend**: Next.js 14 (App Router), React Server & Client Components, Vanilla CSS (Glassmorphism).
2. **Backend**: Next.js Route Handlers (`/api/*`).
3. **Database**: **Turso (libSQL)** Edge Database for storing file and folder metadata, mapping local virtual IDs to Telegram's actual Message/Channel IDs.
4. **MTProto Client**: `telegram` (GramJS) is used to communicate directly with Telegram's core servers.

### 🔒 Security Implementations
- **Session Handling**: Telegram sessions are stored safely in Turso and are tied to a cryptographically secure (`crypto.randomBytes(16)`) HTTP-Only cookie (`teledrive_session`) sent to the browser.
- **CSRF Protection**: Cookies are strictly protected using the `SameSite: 'strict'` policy.
- **No Data Leaks**: API routes rigidly enforce `ownerId` checks for all SQL queries. A user cannot query, delete, rename, or download a file that belongs to a different `ownerId`.
- **Database Safety**: Local `database.sqlite` (if used during legacy testing) and `.env` files are ignored by git to ensure no credentials or user metadata leak into version control.

### How Data Isolation Works
When a user logs in, Telegram Drive Storage generates a unique `StringSession` and saves it in the Turso database alongside their Telegram `userId` (`ownerId`). When uploading files or creating folders, Telegram Drive Storage tags the metadata with this `ownerId`. 
- **Folders** are implemented as private Telegram Channels (automatically archived to keep your chat list clean).
- **Files** are uploaded as documents to either `Saved Messages` (root directory) or the specific private Channel (if inside a folder).

---

## 🚀 Getting Started (Deployment & Local Setup)

### Prerequisites
- **Node.js 18+** installed.
- **Telegram Account**: To get API credentials from [my.telegram.org](https://my.telegram.org/apps).
- **Turso Account**: For the serverless SQLite database ([turso.tech](https://turso.tech)).

### 1. Clone the repository

```bash
git clone https://github.com/v-vabyo/Telegram-Drive-Storage.git
cd Telegram-Drive-Storage
```

### 2. Setup Turso Database

1. Create a free account at [Turso](https://turso.tech).
2. Click **New Database** and give it a name (e.g., `teledrive-db`).
3. Click **Create Database**. (The app will automatically run auto-migration `CREATE TABLE IF NOT EXISTS` upon first launch, so a blank database is perfect).
4. Get your **Database URL** (`libsql://...`) and generate a new **Auth Token**.

### 3. Environment Variables

Create a `.env.local` file in the root of the project and add your credentials:

```env
# Telegram Credentials
TELEGRAM_API_ID=your_api_id_here
TELEGRAM_API_HASH=your_api_hash_here

# Turso Database Credentials
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token_here
```

### 4. Install Dependencies

```bash
npm install
# or yarn install
```

### 5. Run Locally

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### 6. Deploying to Vercel (Recommended)

This application is fully optimized for Vercel Serverless deployment.
1. Push this repository to your own GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add all 4 variables from your `.env.local` file.
5. Click **Deploy**.

---

## 📂 Project Structure

```text
src/
├── app/                  # Next.js App Router UI & API Routes
│   ├── api/              # Backend Endpoints (Auth, Files, Folders, Upload, Download)
│   ├── globals.css       # Global design tokens and utilities
│   ├── layout.js         # Root layout
│   └── page.js           # Main dashboard and UI components
├── lib/                  # Core Utilities
│   ├── db.js             # Turso libSQL client initialization and wrapper functions
│   ├── telegram.js       # GramJS MTProto client pooling and session management
│   └── uploadStore.js    # In-memory store for upload progress tracking
```

## 📜 License
This project is open-source and available under the MIT License. Feel free to fork, modify, and deploy your own instance!
