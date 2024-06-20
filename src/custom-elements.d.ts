declare namespace JSX {
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
  }
}
