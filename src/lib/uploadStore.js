// Global store for upload progress and status
// In a production server, you might use Redis. For local Next.js, a global Map is fine.
const globalStore = globalThis;

if (!globalStore.uploadProgressMap) {
  globalStore.uploadProgressMap = new Map();
}

export const uploadStore = {
  get(uploadId) {
    return globalStore.uploadProgressMap.get(uploadId);
  },
  set(uploadId, data) {
    globalStore.uploadProgressMap.set(uploadId, {
      ...this.get(uploadId),
      ...data,
      lastUpdated: Date.now()
    });
  },
  delete(uploadId) {
    globalStore.uploadProgressMap.delete(uploadId);
  },
  cancel(uploadId) {
    const data = this.get(uploadId);
    if (data) {
      this.set(uploadId, { status: 'cancelled' });
    }
  }
};
