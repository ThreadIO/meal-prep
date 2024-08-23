import { Button } from "@nextui-org/react";

export const StyledButton = ({
  onClick,
  text,
}: {
  onClick: () => void;
  text: string;
}) => {
  return (
    <Button
      style={{
        marginRight: "10px",
        padding: "5px 10px",
        borderRadius: "5px",
      }}
      size="sm"
      onClick={onClick}
      color="primary"
    >
      {text}
    </Button>
  );
};

export default StyledButton;
