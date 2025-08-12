export interface WorkerCredentials {
  email: string;
  password: string;
}

export interface WorkerProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  fileUrl?: string;
  isSubscription?: boolean;
  interval?: 'month' | 'year';
}

export interface WorkerPublishResult {
  success: boolean;
  productUrl?: string;
  message: string;
  error?: string;
  instructions?: string[];
}

export async function publishViaWorker(
  product: WorkerProductData,
  credentials: WorkerCredentials | undefined
): Promise<WorkerPublishResult> {
  const baseUrl = process.env.GUMROAD_WORKER_URL;
  const token = process.env.GUMROAD_WORKER_TOKEN;

  if (!baseUrl) {
    return {
      success: false,
      message: 'Worker URL not configured',
      error: 'Missing GUMROAD_WORKER_URL'
    };
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ product, credentials })
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        success: false,
        message: `Worker request failed (${res.status})`,
        error: text || 'Worker error'
      };
    }

    const data = await res.json();
    return data as WorkerPublishResult;
  } catch (err: any) {
    return {
      success: false,
      message: 'Worker request error',
      error: err?.message || 'Unknown error'
    };
  }
}



