export type PropertyCallback = (value: unknown, oldValue: unknown) => void;

export type ConnectEventDetail = {
  key: string;
  connected: boolean;
  callback: PropertyCallback;
  unsubscribe: () => void;
};
