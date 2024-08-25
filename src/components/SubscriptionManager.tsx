import React from "react";
import { Card, Button } from "@nextui-org/react";

interface Subscription {
  _id: string;
  paymentMethodId: string;
  status: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  billingFrequency: string;
}

interface SubscriptionManagerProps {
  subscription: Subscription;
  // eslint-disable-next-line no-unused-vars
  onManage: (id: string) => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  subscription,
  onManage,
}) => {
  const formattedAmount = (subscription.amount / 100).toFixed(2);

  return (
    <Card className="p-4 mb-4">
      <p>Status: {subscription.status}</p>
      <p>
        Next Billing Date:{" "}
        {subscription.nextBillingDate
          ? new Date(subscription.nextBillingDate).toLocaleDateString()
          : "Not set"}
      </p>
      <p>
        Amount: {formattedAmount} {subscription.currency}
      </p>
      <p>Billing Frequency: {subscription.billingFrequency}</p>
      <Button
        size="sm"
        color="primary"
        onClick={() => onManage(subscription._id)}
      >
        Manage Subscription
      </Button>
    </Card>
  );
};

export default SubscriptionManager;
