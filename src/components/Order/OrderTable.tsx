import { useState } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/react";
import { OrderModal } from "@/components/Modals/OrderModal";
import { DeleteModal } from "@/components/Modals/DeleteModal";
// import { deleteOrder } from "@/helpers/request";
import { Trash } from "lucide-react";
import { order_columns } from "@/helpers/utils";
import { friendlyDate, getDeliveryDate } from "@/helpers/date";
import { renderOrderStatus } from "@/components/Renders";
interface OrderTableProps {
  orders: any;
  onUpdate: () => void;
}

const OrderTable = (props: OrderTableProps) => {
  const [openOrder, setOpenOrder] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [order, setOrder] = useState<any>({});
  const { orders, onUpdate } = props;

  const handleCloseDeleteModal = () => {
    setOrder({});
    setOpenDelete(false);
  };

  const handleCloseOrderModal = () => {
    setOrder({});
    setOpenOrder(false);
  };

  const handleDelete = async (order: any) => {
    // await deleteOrder(order.id, { userid: userId });
    console.log("Deleting order: ", order);
    onUpdate();
    setOpenDelete(false);
  };

  const handleOpenDelete = (item: any) => {
    setOrder(item);
    setOpenDelete(true);
  };

  const handleOpenOrder = (item: any) => {
    setOrder(item);
    setOpenOrder(true);
    console.log("Opening order: ", openOrder);
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
    } else if (columnKey === "actions") {
      return (
        <div className="flex justify-center space-x-4">
          <Button
            color="danger"
            size="sm"
            onClick={() => handleOpenDelete(item)}
            isIconOnly
          >
            <Trash />
          </Button>
        </div>
      );
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
          <DeleteModal
            object={order}
            open={openDelete}
            onClose={() => handleCloseDeleteModal()}
            onDelete={() => handleDelete(order)}
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
