import { Api, TelegramClient } from "telegram";
import crypto from "crypto";
import { StringSession } from "telegram/sessions/index.js";
import { getQuery, runQuery } from "./db.js";
import { cookies } from "next/headers";

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;

const globalForTelegram = global;
const clientPool = globalForTelegram.clientPool || new Map();
if (process.env.NODE_ENV !== 'production') globalForTelegram.clientPool = clientPool;

export async function createTempClient() {
  const sessionId = "temp_" + crypto.randomBytes(16).toString('hex');
  const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.connect();
  clientPool.set(sessionId, client);
  client.currentSessionId = sessionId;
  return client;
}

export async function getClient(allowTemp = false) {
  const cookieStore = cookies();
  let sessionId;
  if (cookieStore.get) {
    // Next.js synchronous or awaitable cookies depending on version, wait let's use it safely:
    const cookieObj = typeof cookieStore.get === 'function' ? cookieStore.get('teledrive_session') : null;
    sessionId = cookieObj ? cookieObj.value : null;
  } else if (cookieStore.then) {
    // Next.js 15+ async cookies
    const resolvedCookies = await cookieStore;
    const cookieObj = resolvedCookies.get('teledrive_session');
    sessionId = cookieObj ? cookieObj.value : null;
  } else {
    // fallback
    sessionId = cookieStore.teledrive_session; 
  }

  if (!sessionId) {
    if (!allowTemp) {
      throw new Error('No session cookie found');
    }
    return await createTempClient();
  }

  if (clientPool.has(sessionId)) {
    const client = clientPool.get(sessionId);
    if (!client.connected) {
      try { await client.connect(); } catch (e) {}
    }
    return client;
  }


  const sessionRow = await getQuery("SELECT sessionString FROM sessions WHERE id = ?", [sessionId]);
  if (!sessionRow) {
    throw new Error('Invalid session');
  }
  
  const stringSession = new StringSession(sessionRow.sessionString);
  
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  
  await client.connect();
  
  clientPool.set(sessionId, client);
  
  // Custom attach property for userId isolation
  client.currentSessionId = sessionId;
  
  return client;
}

export async function getUserId() {
  const cookieStore = cookies();
  let sessionId;
  if (cookieStore.get) {
    const cookieObj = typeof cookieStore.get === 'function' ? cookieStore.get('teledrive_session') : null;
    sessionId = cookieObj ? cookieObj.value : null;
  } else if (cookieStore.then) {
    const resolvedCookies = await cookieStore;
    const cookieObj = resolvedCookies.get('teledrive_session');
    sessionId = cookieObj ? cookieObj.value : null;
  }
  
  if (!sessionId) return null;

  const sessionRow = await getQuery("SELECT userId FROM sessions WHERE id = ?", [sessionId]);
  return sessionRow ? sessionRow.userId : null;
}

export async function saveSession(sessionId, userId, sessionStr) {
  const row = await getQuery("SELECT id FROM sessions WHERE id = ?", [sessionId]);
  if (row) {
    await runQuery("UPDATE sessions SET sessionString = ?, userId = ? WHERE id = ?", [sessionStr, userId, sessionId]);
  } else {
    await runQuery("INSERT INTO sessions (id, userId, sessionString) VALUES (?, ?, ?)", [sessionId, userId, sessionStr]);
  }
}

