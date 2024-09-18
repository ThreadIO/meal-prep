import { NextRequest, NextResponse } from "next/server";
import connect from "@/database/conn";
import { getAllByPagination } from "@/helpers/woocommerce";

export async function POST(request: NextRequest) {
  console.log("Incoming POST request to /api/woocommerce/getorders");

  try {
    await connect(process.env.NEXT_PUBLIC_COMPANY);
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: "Database connection error",
        error: err,
      },
      { status: 500 }
    );
  }

  const requestData = await request.json();
  const { userid, startDate, endDate, page = 1 } = requestData;

  let allOrders: any[] = [];
  let currentPage = page;
  let hasMore = true;

  while (hasMore) {
    const ordersResponse = await getAllByPagination(userid, "orders", {
      startDate,
      endDate,
      startPage: currentPage,
      pageCount: 1,
    });

    const { data: orders, pagination } = ordersResponse;
    allOrders = allOrders.concat(orders);

    hasMore = pagination.currentPage < pagination.totalPages;
    currentPage++;
  }

  return NextResponse.json(
    {
      success: true,
      data: allOrders,
      pagination: {
        currentPage: page,
        totalPages: currentPage - 1,
        hasMore: false,
      },
    },
    { status: 200 }
  );
}
