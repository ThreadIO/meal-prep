import {
  Image,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/react";
import { line_item_columns } from "@/helpers/utils";
import { decodeHtmlEntities } from "@/helpers/frontend";
interface LineItemTableProps {
  line_items: any;
}

const LineItemTable = (props: LineItemTableProps) => {
  const { line_items } = props;

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
                width: "40px", // Adjust the width to make the image smaller
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
      return <div> {decodeHtmlEntities(getKeyValue(item, columnKey))}</div>;
    } else if (columnKey === "size") {
      const sizes = item.meta_data.filter(
        (meta: any) => !meta.key.startsWith("_")
      );
      console.log("Sizes: ", sizes);
      return (
        <div>
          {sizes.length > 0
            ? sizes.map((size: any, index: string) => (
                <div key={index}>{size.value}</div>
              ))
            : "N/A"}
        </div>
      );
    } else if (columnKey === "subtotal") {
      return <div>{`$${parseFloat(item.price || "0").toFixed(2)}`}</div>;
    } else if (columnKey === "total_tax") {
      return <div>{`$${parseFloat(item.total_tax || "0").toFixed(2)}`}</div>;
    } else {
      return getKeyValue(item, columnKey);
    }
  };

  return (
    <div className="mt-4 mr-4 ml-4 max-h-[50vh] overflow-y-auto">
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
