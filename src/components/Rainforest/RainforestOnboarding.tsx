import React, { useEffect, useRef } from "react";

interface RainforestOnboardingProps {
  sessionKey: string;
  merchantId: string;
  merchantApplicationId: string;
  onSubmitted: () => void;
}

const RainforestOnboarding: React.FC<RainforestOnboardingProps> = ({
  sessionKey,
  merchantId,
  merchantApplicationId,
  onSubmitted,
}) => {
  const listenerAdded = useRef(false);

  useEffect(() => {
    const component = document.querySelector("rainforest-merchant-onboarding");

    if (component && !listenerAdded.current) {
      const handleSubmitted = function (event: Event) {
        console.log("Rainforest onboarding submitted:", event);
        onSubmitted();
      };

      component.addEventListener("submitted", handleSubmitted);
      listenerAdded.current = true;

      // Cleanup function
      return () => {
        component.removeEventListener("submitted", handleSubmitted);
        listenerAdded.current = false;
      };
    }
  }, [onSubmitted]);

  return (
    <rainforest-merchant-onboarding
      session-key={sessionKey}
      merchant-id={merchantId}
      merchant-application-id={merchantApplicationId}
    ></rainforest-merchant-onboarding>
  );
};

export default RainforestOnboarding;
