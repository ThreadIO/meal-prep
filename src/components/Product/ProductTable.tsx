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
import { MealModal } from "@/components/Modals/MealModal";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";
import {
  deleteMeal,
  deleteProduct,
  getMeal,
  getProductAddons,
} from "@/helpers/request";
import { Copy, Trash } from "lucide-react";
import { renderCategories, renderStockStatus } from "@/components/Renders";
import { product_columns } from "@/helpers/utils";
import {
  decodeHtmlEntities,
  getProductImage,
  threadConnector,
} from "@/helpers/frontend";

interface ProductTableProps {
  products: any;
  onUpdate: () => void;
  userId: string;
  categories: any[];
}

const ProductTable = (props: ProductTableProps) => {
  const [openProduct, setOpenProduct] = useState(false);
  const [openCopyProduct, setOpenCopyProduct] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [product, setProduct] = useState<any>({});
  const [threadMeal, setThreadMeal] = useState<any>();
  const [loading, setLoading] = useState(false);
  const { products, userId, onUpdate, categories } = props;

  const handleCloseProductModal = () => {
    setProduct({});
    setOpenProduct(false);
  };

  const handleCloseCopyProductModal = () => {
    setProduct({});
    setOpenCopyProduct(false);
  };

  const handleCloseDeleteModal = () => {
    setProduct({});
    setOpenDelete(false);
  };

  const handleDelete = async (product: any) => {
    setLoading(true);
    console.log("Product: ", product);
    await threadConnector(product, userId, deleteMeal);
    await deleteProduct(product.id, { userid: userId });
    onUpdate();
    setLoading(false);
    setOpenDelete(false);
  };

  const handleOpenDelete = (item: any) => {
    setProduct(item);
    setOpenDelete(true);
  };

  const handleOpenProduct = async (item: any) => {
    const add_ons = await getProductAddons(item.id, { userid: userId });
    setProduct({ ...item, add_ons: add_ons.fields }); // Add the add_ons to the product
    const threadMeal = await threadConnector(item, userId, getMeal);
    setThreadMeal(threadMeal);
    setOpenProduct(true);
  };

  const handleOpenCopyProduct = async (item: any) => {
    const add_ons = await getProductAddons(item.id, { userid: userId });
    setProduct({ ...item, add_ons: add_ons.fields });
    const threadMeal = await threadConnector(item, userId, getMeal);
    setThreadMeal(threadMeal);
    setOpenCopyProduct(true);
  };

  const renderImage = (productImage: any) => {
    if (productImage && Object.keys(productImage).length !== 0) {
      return (
        <>
          <div className="relative">
            <Image
              src={productImage.src}
              alt={"Product Image"}
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
    const productImage = getProductImage(item);
    if (columnKey === "image") {
      return renderImage(productImage);
    } else if (columnKey === "name") {
      const decodedName = decodeHtmlEntities(getKeyValue(item, columnKey));
      return (
        <button
          onClick={() => handleOpenProduct(item)}
          className="text-blue-500 hover:text-blue-700 cursor-pointer"
        >
          {decodedName}
        </button>
      );
    } else if (columnKey === "categories") {
      return <div>{renderCategories(item)}</div>;
    } else if (columnKey === "stock_status") {
      return <div>{renderStockStatus(item)}</div>;
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
          <Button
            color="primary"
            size="sm"
            onClick={() => handleOpenCopyProduct(item)}
            isIconOnly
          >
            <Copy />
          </Button>
        </div>
      );
    } else {
      return getKeyValue(item, columnKey);
    }
  };

  const modals = (product: any, threadMeal: any) => {
    if (product) {
      return (
        <>
          <MealModal
            meal={product}
            threadMeal={threadMeal}
            mealImage={getProductImage(product)}
            open={openProduct}
            tags={categories}
            onClose={() => handleCloseProductModal()}
            onUpdate={() => onUpdate()}
            mode="patch"
          />
          <MealModal
            meal={product}
            threadMeal={threadMeal}
            mealImage={getProductImage(product)}
            open={openCopyProduct}
            onClose={() => handleCloseCopyProductModal()}
            onUpdate={() => onUpdate()}
            tags={categories}
            mode="create"
          />
          <ConfirmationModal
            object={product}
            open={openDelete}
            onClose={() => handleCloseDeleteModal()}
            onConfirm={() => handleDelete(product)}
            loading={loading}
          />
        </>
      );
    }
  };

  return (
    <div className="mt-4 mr-4 ml-4">
      {modals(product, threadMeal)}
      <Table
        isHeaderSticky
        isStriped
        aria-label="Table of Products"
        selectionBehavior="toggle"
        onRowAction={(key) => {
          const selectedProduct = products.find(
            (product: any) => product.id === key
          );
          if (selectedProduct) {
            handleOpenProduct(selectedProduct);
          } else {
            console.error(`Product with id ${key} not found`);
          }
        }}
      >
        <TableHeader columns={product_columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No products to display."} items={products}>
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

export default ProductTable;
