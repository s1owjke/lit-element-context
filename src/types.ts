export type PropertyCallback = (value: any, oldValue: any) => void;

export type ConnectEventDetail = {
  key: string;
  connected: boolean;
  callback: PropertyCallback;
  unsubscribe: () => void;
};
