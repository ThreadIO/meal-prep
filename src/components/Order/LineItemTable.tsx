import { useState } from "react";
import {
  Button,
  Image,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/react";
import { DeleteModal } from "@/components/Modals/DeleteModal";
import { Trash } from "lucide-react";
import { line_item_columns } from "@/helpers/utils";

interface LineItemTableProps {
  line_items: any;
  onUpdate: () => void;
}

const LineItemTable = (props: LineItemTableProps) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [line_item, setLineItem] = useState<any>({});
  const { line_items, onUpdate } = props;

  const getLineItemImage = (lineItem: any) => {
    const isValidUrl = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch (error) {
        return false;
      }
    };
    if (!lineItem || !lineItem.image) {
      return null;
    }
    let lineItemImage = lineItem.image;
    if (lineItemImage && !isValidUrl(lineItemImage.src)) {
      lineItemImage = {
        src: "https://t3.ftcdn.net/jpg/04/60/01/36/360_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa.jpg",
      };
    }
    return lineItemImage;
  };

  const handleCloseDeleteModal = () => {
    setLineItem({});
    setOpenDelete(false);
  };

  const handleDelete = async (lineItem: any) => {
    // await deleteLineItem(lineItem.id, { userid: userId });
    console.log("Deleting line item: ", lineItem);
    onUpdate();
    setOpenDelete(false);
  };

  const handleOpenDelete = (item: any) => {
    setLineItem(item);
    setOpenDelete(true);
  };

  const renderImage = (lineItemImage: any) => {
    if (lineItemImage && Object.keys(lineItemImage).length !== 0) {
      return (
        <>
          <div className="relative">
            <Image
              src={lineItemImage.src}
              alt={"LineItem Image"}
              style={{
                objectFit: "contain",
                objectPosition: "center",
                width: "70px", // Adjust the width to make the image smaller
              }}
            />
          </div>
        </>
      );
    }
  };

  const renderTableCell = (item: any, columnKey: string) => {
    const lineItemImage = getLineItemImage(item);
    if (columnKey === "image") {
      return renderImage(lineItemImage);
    } else if (columnKey === "name") {
      return <div> {getKeyValue(item, columnKey)}</div>;
    } else if (columnKey === "price") {
      return <div>{`$${parseFloat(item.price || "0").toFixed(2)}`}</div>;
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

  const modals = (lineItem: any) => {
    if (lineItem) {
      return (
        <>
          <DeleteModal
            object={lineItem}
            open={openDelete}
            onClose={() => handleCloseDeleteModal()}
            onDelete={() => handleDelete(lineItem)}
          />
        </>
      );
    }
  };

  return (
    <div className="mt-4 mr-4 ml-4">
      {modals(line_item)}
      <Table isHeaderSticky isStriped aria-label="Table of Line Items">
        <TableHeader columns={line_item_columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={"No line items to display."}
          items={line_items}
        >
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

export default LineItemTable;
