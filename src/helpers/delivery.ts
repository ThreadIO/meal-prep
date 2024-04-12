// delivery.ts

// Define a map where the keys are zip codes and the values are minimum order amounts
const zipcodeMinimumOrderAmount: { [zipcode: string]: number } = {
  "60601": 200, // Chicago zipcodes
  "60602": 200,
  "60603": 200,
  "60604": 200,
  "60605": 200,
  // Add more Chicago zipcodes here
  "60540": 300, // Naperville zipcodes
  "60563": 300,
  "60564": 300,
  "60565": 300,

  // Add more Naperville zipcodes here
  "61820": 400, // Champaign zipcodes
  "61821": 400,
  "61822": 400,
  "61824": 400,
  // Add more Champaign zipcodes here
  // Add more zipcodes and their corresponding minimum order amounts as needed
};

// Define a function to get the minimum order amount based on the zipcode
export function getMinimumOrderAmount(zipcode: string): number {
  const minimumOrderAmount = zipcodeMinimumOrderAmount[zipcode];
  if (minimumOrderAmount === undefined) {
    throw new Error(`Minimum order amount not found for zipcode: ${zipcode}`);
  }
  return minimumOrderAmount;
}
