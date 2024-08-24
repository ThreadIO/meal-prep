import { Button } from "@nextui-org/react";

export const StyledButton = ({
  onClick,
  text,
  disabled,
}: {
  onClick: () => void;
  text: string;
  disabled?: boolean;
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
      disabled={disabled}
    >
      {text}
    </Button>
  );
};

export default StyledButton;
