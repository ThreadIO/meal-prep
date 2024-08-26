import React from "react";
import { Card, CardBody, CardHeader, Chip, Divider } from "@nextui-org/react";
import { Info } from "lucide-react";

interface EnhancedDropdownProps {
  org: any;
  merchant: any;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "PROCESSING":
      return "primary";
    case "NEEDS_INFORMATION":
      return "warning";
    case "DECLINED":
      return "danger";
    default:
      return "default";
  }
};

const getStatusDescription = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "Your application has been approved. You can now process payments.";
    case "PROCESSING":
      return "We are currently reviewing your application. This usually takes 1-2 business days.";
    case "NEEDS_INFORMATION":
      return "We need some additional information to process your application. Please check your email for details.";
    case "DECLINED":
      return "Unfortunately, your application has been declined. Please contact support for more information.";
    default:
      return "Application status is unknown. Please contact support for assistance.";
  }
};

const renderApplicationStatus = (props: EnhancedDropdownProps) => {
  const { org, merchant } = props;
  if (org?.rainforest?.merchantid && merchant) {
    const status = merchant.latest_merchant_application.status;
    return (
      <Card className="max-w-[400px]">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">Payment Processing Application</p>
            <p className="text-small text-default-500">Status Update</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="flex justify-between items-center">
            <p>Current Status:</p>
            <Chip color={getStatusColor(status)} variant="flat">
              {status}
            </Chip>
          </div>
          <p className="text-small text-default-500 mt-2">
            {getStatusDescription(status)}
          </p>
        </CardBody>
        <Divider />
        <CardBody>
          <div className="flex items-center">
            <Info className="mr-2" size={18} />
            <p className="text-tiny text-default-500">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }
  return null;
};

export default renderApplicationStatus;
