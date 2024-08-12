import React, { useState, useMemo, useCallback } from "react";
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
  products: any[];
  onUpdate: () => void;
  userId: string;
  categories: any[];
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onUpdate,
  userId,
  categories,
}) => {
  const [openProduct, setOpenProduct] = useState(false);
  const [openCopyProduct, setOpenCopyProduct] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [product, setProduct] = useState<any>({});
  const [threadMeal, setThreadMeal] = useState<any>();
  const [loading, setLoading] = useState(false);

  // Memoize the deduplication of products
  const uniqueProducts = useMemo(() => {
    const seen = new Set();
    return products.filter((product) => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  }, [products]);

  const handleCloseProductModal = useCallback(() => {
    setProduct({});
    setOpenProduct(false);
  }, []);

  const handleCloseCopyProductModal = useCallback(() => {
    setProduct({});
    setOpenCopyProduct(false);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setProduct({});
    setOpenDelete(false);
  }, []);

  const handleDelete = useCallback(
    async (product: any) => {
      setLoading(true);
      console.log("Product: ", product);
      await threadConnector(product, userId, deleteMeal);
      await deleteProduct(product.id, { userid: userId });
      onUpdate();
      setLoading(false);
      setOpenDelete(false);
    },
    [userId, onUpdate]
  );

  const handleOpenDelete = useCallback((item: any) => {
    setProduct(item);
    setOpenDelete(true);
  }, []);

  const handleOpenProduct = useCallback(
    async (item: any) => {
      const add_ons = await getProductAddons(item.id, { userid: userId });
      setProduct({ ...item, add_ons: add_ons.fields });
      const threadMeal = await threadConnector(item, userId, getMeal);
      setThreadMeal(threadMeal);
      setOpenProduct(true);
    },
    [userId]
  );

  const handleOpenCopyProduct = useCallback(
    async (item: any) => {
      const add_ons = await getProductAddons(item.id, { userid: userId });
      setProduct({ ...item, add_ons: add_ons.fields });
      const threadMeal = await threadConnector(item, userId, getMeal);
      setThreadMeal(threadMeal);
      setOpenCopyProduct(true);
    },
    [userId]
  );

  const renderImage = useCallback((productImage: any) => {
    if (productImage && Object.keys(productImage).length !== 0) {
      return (
        <div className="relative">
          <Image
            src={productImage.src}
            alt={"Product Image"}
            style={{
              objectFit: "contain",
              objectPosition: "center",
              width: "70px",
            }}
          />
        </div>
      );
    }
    return null;
  }, []);

  const renderTableCell = useCallback(
    (item: any, columnKey: string) => {
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
    },
    [handleOpenProduct, handleOpenDelete, handleOpenCopyProduct]
  );

  const modals = useMemo(
    // eslint-disable-next-line react/display-name
    () => (product: any, threadMeal: any) => {
      if (product) {
        return (
          <>
            <MealModal
              meal={product}
              threadMeal={threadMeal}
              mealImage={getProductImage(product)}
              open={openProduct}
              tags={categories}
              onClose={handleCloseProductModal}
              onUpdate={onUpdate}
              mode="patch"
            />
            <MealModal
              meal={product}
              threadMeal={threadMeal}
              mealImage={getProductImage(product)}
              open={openCopyProduct}
              onClose={handleCloseCopyProductModal}
              onUpdate={onUpdate}
              tags={categories}
              mode="create"
            />
            <ConfirmationModal
              object={product}
              open={openDelete}
              onClose={handleCloseDeleteModal}
              onConfirm={() => handleDelete(product)}
              loading={loading}
            />
          </>
        );
      }
      return null;
    },
    [
      openProduct,
      openCopyProduct,
      openDelete,
      categories,
      handleCloseProductModal,
      handleCloseCopyProductModal,
      handleCloseDeleteModal,
      handleDelete,
      loading,
      onUpdate,
    ]
  );

  return (
    <div className="mt-4 mr-4 ml-4">
      {modals(product, threadMeal)}
      <Table
        isHeaderSticky
        isStriped
        aria-label="Table of Products"
        selectionBehavior="toggle"
        onRowAction={(key) => {
          const selectedProduct = uniqueProducts.find(
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
        <TableBody
          emptyContent={"No products to display."}
          items={uniqueProducts}
        >
          {(item: any) => (
            <TableRow key={item.id}>
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

export default React.memo(ProductTable);
