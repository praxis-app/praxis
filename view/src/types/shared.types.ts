import { type Options } from 'react-use-websocket';

export interface PubSubRequest<T = unknown> {
  type: 'REQUEST';
  request: 'PUBLISH' | 'SUBSCRIBE' | 'UNSUBSCRIBE';
  channel: string;
  token: string;
  body?: T;
}

export interface PubSubResponse<T = unknown> {
  type: 'RESPONSE';
  channel: string;
  request?: 'SUBSCRIBE';
  error?: {
    code: string;
    message: string;
  };
  body?: T;
}

export type PubSubMessage<T = unknown> = PubSubRequest<T> | PubSubResponse<T>;

export interface SubscriptionOptions extends Options {
  enabled?: boolean;
  onSubscribed?: () => void;
}
