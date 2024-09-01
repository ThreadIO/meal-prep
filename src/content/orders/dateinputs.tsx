import { Button, DateRangePicker, RadioGroup, Radio } from "@nextui-org/react";

export const renderDateInputs = (
  startDate: any,
  // eslint-disable-next-line no-unused-vars
  setStartDate: (s_date: any) => void,
  endDate: any,
  // eslint-disable-next-line no-unused-vars
  setEndDate: (e_date: any) => void,
  // eslint-disable-next-line no-unused-vars
  triggerFetchOrders: (mode: string) => void,
  error: string,
  mode: string,
  // eslint-disable-next-line no-unused-vars
  setMode: (mode: string) => void,
  startDeliveryDate: any,
  // eslint-disable-next-line no-unused-vars
  setStartDeliveryDate: (s_d_date: any) => void,
  endDeliveryDate: any,
  // eslint-disable-next-line no-unused-vars
  setEndDeliveryDate: (e_d_date: any) => void,
  deliveryDateRange: any,
  // eslint-disable-next-line no-unused-vars
  setDeliveryDateRange: (d_date: any) => void
) => {
  const renderError = () => {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  };

  // eslint-disable-next-line no-unused-vars
  const modeSwitch = (mode: string, setMode: (mode: string) => void) => (
    <RadioGroup
      value={mode}
      onChange={(e) => {
        setMode(e.target.value);
      }}
    >
      <Radio value="delivery">Delivery Date</Radio>
      <Radio value="order">Order Date</Radio>
    </RadioGroup>
  );

  const dateInputs = (
    startDate: any,
    endDate: any,
    // eslint-disable-next-line no-unused-vars
    setStartDate: (s_date: any) => void,
    // eslint-disable-next-line no-unused-vars
    setEndDate: (e_date: any) => void
  ) => {
    if (mode === "order") {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <DateRangePicker
            label="Order Date Range"
            value={{
              start: startDate,
              end: endDate,
            }}
            onChange={({ start, end }) => {
              setStartDate(start);
              setEndDate(end);
            }}
            showMonthAndYearPickers
          />
        </div>
      );
    } else {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <DateRangePicker
            label="Delivery Date Range"
            value={deliveryDateRange}
            onChange={setDeliveryDateRange}
            granularity="day"
            showMonthAndYearPickers
          />
        </div>
      );
    }
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
        {modeSwitch(mode, setMode)}
        {dateInputs(startDate, endDate, setStartDate, setEndDate)}
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
            onClick={() => triggerFetchOrders(mode)}
            color="primary"
          >
            Get Orders
          </Button>
        </div>
      </div>
    </div>
  );
};
