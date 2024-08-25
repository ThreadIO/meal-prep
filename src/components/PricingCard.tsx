import { AiFillCheckCircle } from "react-icons/ai";

const PricingCard = ({ price, product }: { price: any; product: any }) => {
  const dynamicDescription = () => {
    return (
      <div className="mt-6 space-y-4">
        <DescriptionItem text="5 meals included" />
        <DescriptionItem text="Customizable menu options" />
        <DescriptionItem text="Fresh, organic ingredients" />
        <DescriptionItem text="Home delivery available" />
        <DescriptionItem text="Nutritionist-approved recipes" />
      </div>
    );
  };

  const DescriptionItem = ({ text }: { text: string }) => (
    <div className="flex space-x-3">
      <AiFillCheckCircle
        className="h-5 w-5 flex-shrink-0 text-green-500 ml-2"
        aria-hidden="true"
      />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );

  const handleSubscription = async (e: any) => {
    e.preventDefault();
    const paymentResponse = await fetch("/api/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product: product.id, price: price.id }),
    });
    const data = await paymentResponse.json();
    console.log(data);
    window.location.assign(data);
  };

  return (
    <div className="border-gray-100 shadow-2xl border-4 text-center mt-10 max-w-[1040px]">
      <div className="p-6">
        <h4 className="text-3xl font-bold">{product.name}</h4>
        <div className="mt-8 flex flex-col items-center justify-center">
          <h1 className="text-5xl font-bold">
            {(price.unit_amount / 100).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </h1>
          <h3 className="mt-2">per week</h3>
        </div>
        {dynamicDescription()}
        <button
          className="mt-8 w-full rounded-md border border-transparent bg-[#f1592a] py-3 px-6 text-sm font-medium text-white shadow-sm hover:bg-red-600 transition-colors duration-300"
          onClick={handleSubscription}
        >
          Subscribe Now
        </button>
      </div>
    </div>
  );
};

export default PricingCard;
