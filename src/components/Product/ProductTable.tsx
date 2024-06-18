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
import { ProductModal } from "@/components/Modals/ProductModal";
import { MealModal } from "@/components/Modals/MealModal";
import { DeleteModal } from "@/components/Modals/DeleteModal";
import { deleteProduct } from "@/helpers/request";
import { Copy, Trash } from "lucide-react";
import { renderCategories, renderStockStatus } from "@/components/Renders";
import { product_columns } from "@/helpers/utils";

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
  const { products, userId, onUpdate, categories } = props;

  //   useEffect(() => {
  //     if (product && Object.keys(product).length > 0) {
  //       if (openProduct) {
  //         console.log("Product: ", product);
  //         setOpenProduct(true);
  //       } else if (openCopyProduct) {
  //         setOpenCopyProduct(true);
  //       }
  //     }
  //   }, [product]);

  const getProductImage = (product: any) => {
    const isValidUrl = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch (error) {
        return false;
      }
    };
    if (!product || !product.images) {
      return null;
    }
    let productImage = product.images[0];
    if (productImage && !isValidUrl(productImage.src)) {
      productImage = {
        src: "https://t3.ftcdn.net/jpg/04/60/01/36/360_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa.jpg",
      };
    }
    return productImage;
  };

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
    await deleteProduct(product.id, { userid: userId });
    onUpdate();
    setOpenDelete(false);
  };

  const handleOpenDelete = (item: any) => {
    setProduct(item);
    setOpenDelete(true);
  };

  const handleOpenProduct = (item: any) => {
    setProduct(item);
    setOpenProduct(true);
  };

  const handleOpenCopyProduct = (item: any) => {
    setProduct(item);
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
      return (
        <button
          onClick={() => handleOpenProduct(item)}
          className="text-blue-500 hover:text-blue-700 cursor-pointer"
        >
          {getKeyValue(item, columnKey)}
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

  const modals = (product: any) => {
    if (product) {
      return (
        <>
          <MealModal
            meal={product}
            mealImage={getProductImage(product)}
            open={openProduct}
            categories={categories}
            onClose={() => handleCloseProductModal()}
            onUpdate={() => onUpdate()}
          />
          {/* <ProductModal
            product={product}
            productImage={getProductImage(product)}
            open={openProduct}
            mode="patch"
            categories={categories}
            onClose={() => handleCloseProductModal()}
            onUpdate={() => onUpdate()}
          /> */}
          <ProductModal
            product={product}
            productImage={getProductImage(product)}
            open={openCopyProduct}
            mode="create"
            onClose={() => handleCloseCopyProductModal()}
            onUpdate={() => onUpdate()}
            categories={categories}
          />
          <DeleteModal
            object={product}
            open={openDelete}
            onClose={() => handleCloseDeleteModal()}
            onDelete={() => handleDelete(product)}
          />
        </>
      );
    }
  };

  return (
    <div className="mt-4 mr-4 ml-4">
      {modals(product)}
      <Table isHeaderSticky isStriped aria-label="Table of Products">
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
