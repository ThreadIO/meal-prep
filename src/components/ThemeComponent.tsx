import { Button } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeComponent = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, [theme]);

  if (!mounted) return null;

  return (
    <div style={{ textAlign: "center" }}>
      <Button
        color="primary"
        style={{
          margin: "10px",
        }}
        onClick={() => setTheme("light")}
      >
        Light Mode
      </Button>
      <Button
        color="primary"
        style={{
          margin: "10px",
        }}
        onClick={() => setTheme("dark")}
      >
        Dark Mode
      </Button>
    </div>
  );
};

export default ThemeComponent;
