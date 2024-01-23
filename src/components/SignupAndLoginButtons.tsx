import { useRedirectFunctions } from "@propelauth/nextjs/client";
import BusinessIcon from "@/components/BusinessIcon";
import { Button } from "@nextui-org/react";

export function SignupAndLoginButtons() {
  const { redirectToSignupPage, redirectToLoginPage } = useRedirectFunctions();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <BusinessIcon width={400} height={400} alt={"Thread Title"} />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <Button
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
            onClick={() => redirectToSignupPage()}
            color="primary"
          >
            Sign up
          </Button>
          <Button
            style={{ padding: "5px 10px", borderRadius: "5px" }}
            onClick={() => redirectToLoginPage()}
            color="primary"
          >
            Log in
          </Button>
        </div>
      </div>
    </div>
  );
}
