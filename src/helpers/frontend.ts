/* eslint-disable no-unused-vars */
export const getData = async (
  dataType: string,
  url: string,
  method: string,
  headers: any,
  onSuccess: (data: any) => void,
  onError: (error: any) => void,
  setLoading: (loading: boolean) => void,
  body?: any,
  onCall?: () => void,
  onEnd?: () => void,
  transformData?: (data: any) => any
) => {
  setLoading(true);
  if (onCall) {
    onCall();
  }
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorMessage =
        response.statusText || `Failed to fetch ${dataType} from the server`;
      onError(errorMessage);
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    if (transformData) {
      onSuccess(transformData(responseData.data));
    } else {
      onSuccess(responseData.data || []);
    }
    console.log(
      `Successfully fetched ${dataType} from ${url}:`,
      responseData.data
    );
    setLoading(false); // This directly uses the setLoading parameter
    if (onEnd) {
      onEnd();
    }
  } catch (error: any) {
    console.error(`Error fetching ${dataType} from ${url}:`, error);
    onError(error.message || `An error occurred while fetching ${dataType}`);
    setLoading(false); // This directly uses the setLoading parameter
  }
};

export const getCategories = async (
  user: any,
  setCategories: (categories: any) => void,
  setError: (error: any) => void,
  setCategoriesLoading: (loading: boolean) => void
) => {
  const url = "/api/woocommerce/getproducts/getcategories";
  const method = "POST";
  const headers = {
    "Content-Type": "application/json",
  };
  const body = { userid: user?.userId };
  getData(
    "categories",
    url,
    method,
    headers,
    setCategories,
    setError,
    setCategoriesLoading,
    body
  );
};
