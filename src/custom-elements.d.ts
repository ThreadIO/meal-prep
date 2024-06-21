// eslint-disable-next-line no-unused-vars
declare namespace JSX {
  // eslint-disable-next-line no-unused-vars
  interface IntrinsicElements {
    "rainforest-payment": {
      "session-key": string;
      "payin-config-id": string;
      "allowed-methods"?: string;
    };
    "rainforest-payin-receipt": {
      "session-key": string;
      "payin-id": string;
    };
    "rainforest-deposit-report": {
      "session-key": string;
      columns?: string; // JSON Column array
      "display-header": string;
      "data-filters": string; // JSON w/ merchantId
    };
  }
}
