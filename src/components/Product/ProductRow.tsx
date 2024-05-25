// import React, { useState, useEffect } from "react";
import {} from //   Button,
//   Image,
//   TableRow,
//   TableCell,
//   getKeyValue,
"@nextui-org/react";
// import { ProductModal } from "@/components/Modals/ProductModal";
// import { DeleteModal } from "@/components/Modals/DeleteModal";
// import { deleteProduct } from "@/helpers/request";
// import { Copy, Trash } from "lucide-react";
// import { renderCategories, renderStockStatus } from "@/components/Renders";

interface ProductRowProps {
  product: any;
  onUpdate: () => void;
  userId: string;
  categories: any[];
}

const ProductRow = (props: ProductRowProps) => {
  console.log(props);
  //   const [openProduct, setOpenProduct] = useState(false);
  //   const [openCopyProduct, setOpenCopyProduct] = useState(false);
  //   const [openDelete, setOpenDelete] = useState(false);
  //   const { product, userId, onUpdate, categories } = props;

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

  //   const getProductImage = (product: any) => {
  //     const isValidUrl = (url: string) => {
  //       try {
  //         new URL(url);
  //         return true;
  //       } catch (error) {
  //         return false;
  //       }
  //     };
  //     if (!product || !product.images) {
  //       return null;
  //     }
  //     let productImage = product.images[0];
  //     if (productImage && !isValidUrl(productImage.src)) {
  //       productImage = {
  //         src: "https://t3.ftcdn.net/jpg/04/60/01/36/360_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa.jpg",
  //       };
  //     }
  //     return productImage;
  //   };

  //   const handleCloseProductModal = () => {
  //     setOpenProduct(false);
  //   };

  //   const handleCloseCopyProductModal = () => {
  //     setOpenCopyProduct(false);
  //   };

  //   const handleCloseDeleteModal = () => {
  //     setOpenDelete(false);
  //   };

  //   const handleDelete = async (product: any) => {
  //     await deleteProduct(product.id, { userid: userId });
  //     onUpdate();
  //     setOpenDelete(false);
  //   };

  //   const handleOpenDelete = () => {
  //     setOpenDelete(true);
  //   };

  //   const handleOpenProduct = () => {
  //     setOpenProduct(true);
  //   };

  //   const handleOpenCopyProduct = () => {
  //     setOpenCopyProduct(true);
  //   };

  //   const renderImage = (productImage: any) => {
  //     if (productImage && Object.keys(productImage).length !== 0) {
  //       return (
  //         <>
  //           <div className="relative">
  //             <Image
  //               src={productImage.src}
  //               alt={"Product Image"}
  //               style={{
  //                 objectFit: "contain",
  //                 objectPosition: "center",
  //                 width: "0px", // Adjust the width to make the image smaller
  //               }}
  //             />
  //           </div>
  //         </>
  //       );
  //     }
  //   };

  //   const renderTableCell = (item: any, columnKey: string) => {
  //     const productImage = getProductImage(item);
  //     if (columnKey === "image") {
  //       return renderImage(productImage);
  //     } else if (columnKey === "name") {
  //       return (
  //         <button
  //           onClick={() => handleOpenProduct()}
  //           className="text-blue-500 hover:text-blue-700 cursor-pointer"
  //         >
  //           {getKeyValue(item, columnKey)}
  //         </button>
  //       );
  //     } else if (columnKey === "categories") {
  //       return <div>{renderCategories(item)}</div>;
  //     } else if (columnKey === "stock_status") {
  //       return <div>{renderStockStatus(item)}</div>;
  //     } else if (columnKey === "price") {
  //       return <div>{`$${parseFloat(item.price || "0").toFixed(2)}`}</div>;
  //     } else if (columnKey === "actions") {
  //       return (
  //         <div className="flex justify-center space-x-4">
  //           <Button
  //             color="danger"
  //             size="sm"
  //             onClick={() => handleOpenDelete()}
  //             isIconOnly
  //           >
  //             <Trash />
  //           </Button>
  //           <Button
  //             color="primary"
  //             size="sm"
  //             onClick={() => handleOpenCopyProduct()}
  //             isIconOnly
  //           >
  //             <Copy />
  //           </Button>
  //         </div>
  //       );
  //     } else {
  //       return getKeyValue(item, columnKey);
  //     }
  //   };

  return (
    <div></div>
    // <TableRow key={product.key}>
    //   {(columnKey) => (
    //     <TableCell>{renderTableCell(product, columnKey as string)}</TableCell>
    //   )}
    // </TableRow>
  );
};

//   <ProductModal
//     product={product}
//     productImage={getProductImage(product)}
//     open={openProduct}
//     mode="patch"
//     categories={categories}
//     onClose={() => handleCloseProductModal()}
//     onUpdate={() => onUpdate()}
//   />
//   <ProductModal
//     product={product}
//     productImage={getProductImage(product)}
//     open={openCopyProduct}
//     mode="create"
//     onClose={() => handleCloseCopyProductModal()}
//     onUpdate={() => onUpdate()}
//     categories={categories}
//   />
//   <DeleteModal
//     object={product}
//     open={openDelete}
//     onClose={() => handleCloseDeleteModal()}
//     onDelete={() => handleDelete(product)}
//   />
export default ProductRow;
