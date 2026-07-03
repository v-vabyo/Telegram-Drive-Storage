# TeleDrive 🚀

TeleDrive is a modern, fast, and multi-user Software-as-a-Service (SaaS) cloud storage application that leverages the **Telegram MTProto API** as its underlying storage backend. 

By turning Telegram into a free, unlimited cloud storage drive, users can securely upload, organize, and download their files without worrying about local server disk space.

---

## ✨ Features

- **Multi-User (SaaS) Architecture**: Any user can log in with their own Telegram phone number. The system completely isolates data; your files are stored on *your* Telegram account, and other users' files are stored on *theirs*.
- **Unlimited Storage**: Leverages Telegram's generous file storage limits (up to 2GB per file on standard, 4GB on Premium).
- **Virtual File System**: Create folders, rename files, and organize data just like Google Drive or Dropbox.
- **Real-Time Upload Progress**: Smooth, chunk-based uploading with real-time UI progress indicators and cancellation support.
- **End-to-End Privacy**: Files are sent to your own `Saved Messages` (or dedicated private channels). Only you can access them.
- **Modern UI**: Built with Next.js 14 (App Router) and vanilla CSS, providing a glassmorphism and premium aesthetic.

## 🏗️ Architecture

TeleDrive acts as a middleman between the User's Browser and Telegram's MTProto API.

1. **Frontend**: Next.js React Server Components & Client Components.
2. **Backend**: Next.js Route Handlers (`/api/*`).
3. **Database**: Local SQLite database (`database.sqlite`) to store file and folder metadata, mapping local virtual IDs to Telegram's actual Message/Channel IDs.
4. **MTProto Client**: GramJS is used to communicate directly with Telegram's core servers.

### How Data Isolation Works
When a user logs in, TeleDrive generates a unique `StringSession` and saves it in the database alongside their Telegram `userId` (`ownerId`). When uploading files or creating folders, TeleDrive tags the metadata in SQLite with this `ownerId`. 
- **Folders** are implemented as private Telegram Channels (automatically archived to keep your chat list clean).
- **Files** are uploaded as documents to either `Saved Messages` (root directory) or the specific private Channel (if inside a folder).

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- A Telegram Account

### 1. Clone the repository

```bash
git clone https://github.com/v-vabyo/Telegram-Drive-Storage.git
cd Telegram-Drive-Storage
```

### 2. Environment Variables

Create a `.env.local` file in the root of the project and add your Telegram API credentials. You can obtain these from [my.telegram.org](https://my.telegram.org/apps).

```env
TELEGRAM_API_ID=your_api_id_here
TELEGRAM_API_HASH=your_api_hash_here
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📂 Project Structure

```text
src/
├── app/                  # Next.js App Router UI & API Routes
│   ├── api/              # Backend Endpoints (Auth, Files, Folders, Upload, Download)
│   ├── globals.css       # Global design tokens and utilities
│   ├── layout.js         # Root layout
│   └── page.js           # Main dashboard and UI components
├── lib/                  # Core Utilities
│   ├── db.js             # SQLite initialization and wrapper functions
│   ├── telegram.js       # GramJS MTProto client pooling and session management
│   └── uploadStore.js    # In-memory store for upload progress tracking
```

## 🔒 Security

- **Session Handling**: Telegram sessions are stored safely in SQLite and are tied to an HTTP-Only cookie (`teledrive_session`) sent to the browser.
- **No Data Leaks**: API routes rigidly enforce `ownerId` checks for all SQL queries. A user cannot query, delete, rename, or download a file that belongs to a different `ownerId`.
- **Git Ignore**: `database.sqlite` is explicitly ignored to ensure user sessions are never committed to version control.

## 📜 License
This project is open-source and available under the MIT License. Feel free to fork, modify, and deploy your own instance!
