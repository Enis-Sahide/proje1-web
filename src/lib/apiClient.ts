let isRefreshing = false;
let refreshSubscribers: ((success: boolean) => void)[] = [];

function subscribeTokenRefresh(cb: (success: boolean) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

// Aynı-origin API çağrıları (httpOnly cookie tabanlı auth ile).
export async function apiFetch<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const makeRequest = () => fetch(path, {
    ...opts,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });

  let res = await makeRequest();

  // If unauthorized and it's not the login, register or refresh endpoints
  if (res.status === 401 && path !== '/api/auth/refresh' && path !== '/api/auth/login' && path !== '/api/auth/register') {
    if (!isRefreshing) {
      isRefreshing = true;
      let refreshSuccess = false;
      try {
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          credentials: 'include',
        });
        refreshSuccess = refreshRes.ok;
        onRefreshed(refreshSuccess);
      } catch {
        onRefreshed(false);
      } finally {
        isRefreshing = false;
      }

      if (refreshSuccess) {
        res = await makeRequest();
      }
    } else {
      const refreshSuccess = await new Promise<boolean>((resolve) => {
        subscribeTokenRefresh((success) => resolve(success));
      });

      if (refreshSuccess) {
        res = await makeRequest();
      }
    }
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error((data && data.error) || `İstek başarısız (${res.status})`);
  }
  return data as T;
}
