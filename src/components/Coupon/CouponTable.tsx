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
// import { CouponModal } from "@/components/Modals/CouponModal";
import { coupon_columns } from "@/helpers/utils";
interface CouponTableProps {
  coupons: any;
  onUpdate: () => void;
}

const CouponTable = (props: CouponTableProps) => {
  //   const [openCoupon, setOpenCoupon] = useState(false);
  const [coupon] = useState<any>({});
  const { coupons } = props;

  //   const handleCloseCouponModal = () => {
  //     setCoupon({});
  //     setOpenCoupon(false);
  //   };

  //   const handleOpenCoupon = (item: any) => {
  //     setCoupon(item);
  //     setOpenCoupon(true);
  //   };

  const renderTableCell = (item: any, columnKey: string) => {
    if (columnKey === "coupon_id") {
      return (
        <button
          onClick={() => {}}
          className="text-blue-500 hover:text-blue-700 cursor-pointer"
        >
          <div>{item.id}</div>
        </button>
      );
    } else {
      return getKeyValue(item, columnKey);
    }
  };

  const modals = (coupon: any) => {
    if (coupon) {
      return (
        <>
          {/* <CouponModal
            coupon={coupon}
            open={openCoupon}
            onClose={() => handleCloseCouponModal()}
            onUpdate={() => onUpdate()}
          /> */}
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
            // handleOpenCoupon(selectedCoupon);
          } else {
            console.error(`Coupon with id ${key} not found`);
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
