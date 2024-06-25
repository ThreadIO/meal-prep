"use client";
import { useEffect } from "react";
import { useUser } from "@propelauth/nextjs/client";
import { Button, Spinner } from "@nextui-org/react";
import { useQuery, useQueryClient } from "react-query";
import CouponTable from "@/components/Coupon/CouponTable";
// import { CouponModal } from "@/components/Modals/CouponModal";

const getCoupons = async (userId: string) => {
  const response = await fetch("/api/woocommerce/getcoupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid: userId }),
  });
  if (!response.ok) throw new Error("Failed to fetch coupons");
  return (await response.json()).data;
};

const Coupons = () => {
  const { loading, isLoggedIn, user } = useUser();
  const queryClient = useQueryClient();

  const {
    data: coupons = [],
    isLoading: couponsLoading,
    error: couponsError,
  } = useQuery(
    ["coupons", user?.userId],
    () => getCoupons(user?.userId ?? ""),
    {
      enabled: !!user?.userId,
    }
  );

  //   const [openCoupon, setOpenCoupon] = useState(false);

  useEffect(() => {
    if (isLoggedIn && !loading) {
      queryClient.invalidateQueries(["coupons", user?.userId]);
    }
  }, [isLoggedIn, loading, queryClient, user?.userId]);

  //   const handleCloseCouponModal = () => {
  //     setOpenCoupon(false);
  //   };

  const renderCouponPage = () => {
    if (couponsError) {
      return renderError();
    } else {
      return (
        <div className="overflow-y-auto h-full pb-20">
          <div className="mx-auto max-w-4xl text-center mt-10 items-center">
            <h2 className="text-3xl font-semibold leading-7 mb-6">Coupons</h2>
            <div className="flex justify-center">
              <Button color="primary" onPress={() => {}} className="mt-4">
                Create New Coupon
              </Button>
            </div>
          </div>
          {couponsLoading ? renderLoading() : renderCouponContent()}
        </div>
      );
    }
  };

  const renderError = () => (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: "red" }}>
        {(couponsError as Error)?.message || "An error occurred"}
      </p>
    </div>
  );

  const renderCouponContent = () => (
    <div>
      <CouponTable
        coupons={coupons}
        onUpdate={() =>
          queryClient.invalidateQueries(["coupons", user?.userId])
        }
      />
    </div>
  );

  const renderLoading = () => (
    <div className="flex justify-center items-center h-full">
      <Spinner label="Loading Coupons" />
    </div>
  );

  return (
    <>
      {/* <CouponModal
        coupon={null}
        open={openCoupon}
        onClose={handleCloseCouponModal}
        onUpdate={() =>
          queryClient.invalidateQueries(["coupons", user?.userId])
        }
      /> */}
      {renderCouponPage()}
    </>
  );
};

export default Coupons;
