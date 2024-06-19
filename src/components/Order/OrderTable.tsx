import { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/react";
import { OrderModal } from "@/components/Modals/OrderModal";
import { order_columns } from "@/helpers/utils";
import { friendlyDate, getDeliveryDate } from "@/helpers/date";
import { renderOrderStatus } from "@/components/Renders";
interface OrderTableProps {
  orders: any;
  onUpdate: () => void;
}

const OrderTable = (props: OrderTableProps) => {
  const [openOrder, setOpenOrder] = useState(false);
  const [order, setOrder] = useState<any>({});
  const { orders, onUpdate } = props;

  const handleCloseOrderModal = () => {
    setOrder({});
    setOpenOrder(false);
  };

  const handleOpenOrder = (item: any) => {
    setOrder(item);
    setOpenOrder(true);
  };

  const renderTableCell = (item: any, columnKey: string) => {
    if (columnKey === "order_id") {
      return (
        <button
          onClick={() => handleOpenOrder(item)}
          className="text-blue-500 hover:text-blue-700 cursor-pointer"
        >
          <div>{item.id}</div>
        </button>
      );
    } else if (columnKey === "customer_name") {
      return (
        <div>
          {item.billing.first_name} {item.billing.last_name}
        </div>
      );
    } else if (columnKey === "order_date") {
      return <div>{friendlyDate(item.date_created, true) || "N/A"}</div>;
    } else if (columnKey === "delivery_date") {
      return <div>{friendlyDate(getDeliveryDate(item)) || "N/A"}</div>;
    } else if (columnKey === "status") {
      return <div>{renderOrderStatus(item)}</div>;
    } else {
      return getKeyValue(item, columnKey);
    }
  };

  const modals = (order: any) => {
    if (order) {
      return (
        <>
          <OrderModal
            order={order}
            open={openOrder}
            onClose={() => handleCloseOrderModal()}
            onUpdate={() => onUpdate()}
          />
        </>
      );
    }
  };

  return (
    <div className="mt-4 mr-4 ml-4">
      {modals(order)}
      <Table isHeaderSticky isStriped aria-label="Table of Orders">
        <TableHeader columns={order_columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No orders to display."} items={orders}>
          {(item: any) => (
            <TableRow key={item.key}>
              {(columnKey) => (
                <TableCell>
                  {renderTableCell(item, columnKey as string)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderTable;
