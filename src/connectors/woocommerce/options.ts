// Options are WooCommerce product add ons

// TO-DO: Convert Product Add on to the Options format

// productAddOns have a field called options which is an array of options, the only fields we need are label, and price
// label maps to name
// price maps to price_adjustment
export const convertProductAddOnsToOptions = (productAddOns: any) => {
  if (productAddOns && productAddOns.length > 0) {
    const sizeOption = productAddOns.find(
      (option: any) => option.name === "Size"
    );
    if (sizeOption && sizeOption.options && sizeOption.options.length > 0) {
      console.log("Size Options: ", sizeOption.options);
      // From here, there is an array of size options that follow the above format, return them
      return sizeOption.options.map((size: any) => {
        return {
          name: size.label,
          price_adjustment: size.price,
        };
      });
    }
  }
  return [];
};
// TO-DO: Convert Options to Product Add On

export const convertOptionsToProductAddOns = (options: any) => {
  if (options && options.length > 0) {
    const sizeOptions = [
      {
        name: "Size",
        title_format: "label",
        description_enable: 0,
        description: "",
        type: "multiple_choice",
        display: "select",
        position: 0,
        required: 1,
        restrictions: 0,
        restrictions_type: "any_text",
        adjust_price: 0,
        price_type: "flat_fee",
        price: "",
        min: 0,
        max: 0,
        options: options.map((option: any) => ({
          label: option.name,
          price: option.price_adjustment,
          image: "",
          price_type: "quantity_based",
        })),
      },
    ];
    return { fields: sizeOptions };
  }
  return [];
};
