import { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Button,
} from "@nextui-org/react";
import { CouponModal } from "@/components/Modals/CouponModal";
import { coupon_columns } from "@/helpers/utils";
import { Trash } from "lucide-react";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";
import { deleteCoupon } from "@/helpers/request";
interface CouponTableProps {
  coupons: any;
  onUpdate: () => void;
  userId: any;
}

const CouponTable = (props: CouponTableProps) => {
  const [openCoupon, setOpenCoupon] = useState(false);
  const [coupon, setCoupon] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const { coupons, userId, onUpdate } = props;

  const handleCloseCouponModal = () => {
    setCoupon({});
    setOpenCoupon(false);
  };

  const handleCloseDeleteModal = () => {
    setCoupon({});
    setOpenDelete(false);
  };

  const handleOpenCoupon = (item: any) => {
    setCoupon(item);
    setOpenCoupon(true);
  };

  const handleDelete = async (coupon: any) => {
    setLoading(true);
    console.log("Coupon: ", coupon);
    await deleteCoupon(coupon.id, { userid: userId });
    onUpdate();
    setLoading(false);
    setOpenDelete(false);
  };

  const handleOpenDelete = (item: any) => {
    setCoupon(item);
    setOpenDelete(true);
  };

  const renderTableCell = (item: any, columnKey: string) => {
    if (columnKey === "coupon_id") {
      return (
        <button className="text-blue-500 hover:text-blue-700 cursor-pointer">
          <div>{item.id}</div>
        </button>
      );
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

  const modals = (coupon: any) => {
    if (coupon && Object.keys(coupon).length > 0) {
      return (
        <>
          <CouponModal
            coupon={coupon}
            open={openCoupon}
            onClose={() => handleCloseCouponModal()}
            onUpdate={() => onUpdate()}
            mode={"patch"}
          />
          <ConfirmationModal
            object={{ ...coupon, name: coupon.code }}
            open={openDelete}
            onClose={() => handleCloseDeleteModal()}
            onConfirm={() => handleDelete(coupon)}
            loading={loading}
          />
        </>
      );
    }
  };

  return (
    <div className="mt-4 mr-4 ml-4">
      {modals(coupon)}
      <Table
        isHeaderSticky
        isStriped
        aria-label="Table of Coupons"
        selectionBehavior="toggle"
        onRowAction={(key) => {
          const selectedCoupon = coupons.find(
            (coupon: any) => coupon.id === key
          );
          if (selectedCoupon) {
            handleOpenCoupon(selectedCoupon);
          } else {
            console.error(`Order with id ${key} not found`);
          }
        }}
      >
        <TableHeader columns={coupon_columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No coupons to display."} items={coupons}>
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

export default CouponTable;
