import { Button, DatePicker } from "@nextui-org/react";

export const renderDateInputs = (
  startDate: any,
  // eslint-disable-next-line no-unused-vars
  setStartDate: (s_date: any) => void,
  endDate: any,
  // eslint-disable-next-line no-unused-vars
  setEndDate: (e_date: any) => void,
  triggerFetchOrders: () => void,
  error: string
) => {
  const renderError = () => {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  };

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
        {renderError()}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e)}
            maxValue={endDate?.copy().subtract({ days: 1 })}
            showMonthAndYearPickers
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e)}
            minValue={startDate?.copy().add({ days: 1 })}
            showMonthAndYearPickers
          />
        </div>
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
            onClick={() => triggerFetchOrders()}
            color="primary"
          >
            Get Orders
          </Button>
        </div>
      </div>
    </div>
  );
};
