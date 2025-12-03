import {
  API_ENDPOINTS,
  Region,
  GetPreferencesResponse,
  GetInAppNotificationsResult,
  InAppNotification,
  User,
  Preference,
  Channel,
  DeliveryOption,
  NotificationAPIException,
} from './models';

export class NotificationAPIService {
  private clientId: string;
  private userId: string;
  private hashedUserId?: string;
  private baseUrl: string;

  constructor(
    clientId: string,
    userId: string,
    hashedUserId: string | undefined,
    region: Region = 'us',
    baseUrl?: string
  ) {
    this.clientId = clientId;
    this.userId = userId;
    this.hashedUserId = hashedUserId;
    this.baseUrl = baseUrl || API_ENDPOINTS[region];
  }

  private generateBasicToken(): string {
    const token = this.hashedUserId
      ? `${this.clientId}:${this.userId}:${this.hashedUserId}`
      : `${this.clientId}:${this.userId}`;
    // Base64 encoding for React Native (btoa is not available)
    // For Basic Auth, tokens are ASCII, so we can use charCodeAt directly
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    while (i < token.length) {
      const byte1 = token.charCodeAt(i++);
      const byte2 = i < token.length ? token.charCodeAt(i++) : undefined;
      const byte3 = i < token.length ? token.charCodeAt(i++) : undefined;
      
      const bitmap = (byte1 << 16) | ((byte2 ?? 0) << 8) | (byte3 ?? 0);
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      
      if (byte2 !== undefined) {
        result += chars.charAt((bitmap >> 6) & 63);
      } else {
        result += '=';
      }
      
      if (byte3 !== undefined) {
        result += chars.charAt(bitmap & 63);
      } else {
        result += '=';
      }
    }
    
    return result;
  }

  private async apiRequest<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    resource: string,
    data?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}/${this.clientId}/users/${encodeURIComponent(this.userId)}/${resource}`;

    const headers: Record<string, string> = {
      'Authorization': `Basic ${this.generateBasicToken()}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (response.status >= 200 && response.status < 300) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return (await response.json()) as T;
      }
      return {} as T;
    } else {
      throw new NotificationAPIException(
        `API request failed: ${response.status}`,
        response.status
      );
    }
  }

  async getNotifications(before: string, count: number): Promise<{
    notifications: InAppNotification[];
    hasMore: boolean;
    oldestReceived: string;
  }> {
    return this.apiRequest(
      'GET',
      `notifications/INAPP_WEB?count=${count}&before=${encodeURIComponent(before)}`
    );
  }

  async patchNotifications(params: {
    trackingIds: string[];
    archived?: string | null;
    clicked?: string | null;
    opened?: string | null;
  }): Promise<unknown> {
    return this.apiRequest('PATCH', 'notifications/INAPP_WEB', params);
  }

  async getPreferences(): Promise<GetPreferencesResponse> {
    return this.apiRequest<GetPreferencesResponse>('GET', 'preferences');
  }

  async postPreferences(preferences: Preference[]): Promise<void> {
    await this.apiRequest('POST', 'preferences', { preferences });
  }

  async postUser(user: User): Promise<void> {
    await this.apiRequest('POST', '', user);
  }

  async getUserAccountMetadata(): Promise<{ userAccountMetadata: { logo: string; environmentVapidPublicKey: string; hasWebPushEnabled: boolean } }> {
    return this.apiRequest('GET', 'account_metadata');
  }

  async getInAppNotifications(params: {
    before: string;
    maxCount?: number;
    oldestNeeded?: string;
  }): Promise<GetInAppNotificationsResult> {
    const maxCount = params.maxCount || 100;
    const oldestNeeded = params.oldestNeeded || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const result: InAppNotification[] = [];
    let oldestReceived = params.before;
    let hasMore = true;
    let shouldLoadMore = true;

    while (shouldLoadMore) {
      const response = await this.getNotifications(oldestReceived, maxCount);
      const notifications = response.notifications || [];

      // Remove duplicates
      const notificationsWithoutDuplicates = notifications.filter(
        (n) => !result.find((existing) => existing.id === n.id)
      );

      if (notificationsWithoutDuplicates.length > 0) {
        oldestReceived = notificationsWithoutDuplicates.reduce((min, n) =>
          min < n.date ? min : n.date
        , oldestReceived);
      }

      result.push(...notificationsWithoutDuplicates);
      hasMore = notificationsWithoutDuplicates.length > 0;
      shouldLoadMore =
        hasMore &&
        result.length < maxCount &&
        oldestReceived > oldestNeeded;
    }

    return {
      items: result,
      hasMore,
      oldestReceived,
    };
  }

  async updateInAppNotifications(params: {
    ids: string[];
    archived?: boolean;
    clicked?: boolean;
    opened?: boolean;
  }): Promise<void> {
    const body: {
      trackingIds: string[];
      archived?: string | null;
      clicked?: string | null;
      opened?: string | null;
    } = {
      trackingIds: params.ids,
    };

    if (params.archived === true) {
      body.archived = new Date().toISOString();
    } else if (params.archived === false) {
      body.archived = null;
    }

    if (params.clicked === true) {
      body.clicked = new Date().toISOString();
    } else if (params.clicked === false) {
      body.clicked = null;
    }

    if (params.opened === true) {
      body.opened = new Date().toISOString();
    } else if (params.opened === false) {
      body.opened = null;
    }

    await this.patchNotifications(body);
  }

  async updateDeliveryOption(params: {
    notificationId: string;
    subNotificationId?: string;
    channel: Channel;
    delivery: DeliveryOption;
  }): Promise<void> {
    const preference: Preference = {
      notificationId: params.notificationId,
      channel: params.channel,
      delivery: params.delivery,
      subNotificationId: params.subNotificationId,
    };
    await this.postPreferences([preference]);
  }

  async identify(user: User): Promise<void> {
    if (user.id !== this.userId) {
      throw new NotificationAPIException(
        'The id in the parameters does not match the initialized userId.'
      );
    }
    await this.postUser(user);
  }
}

