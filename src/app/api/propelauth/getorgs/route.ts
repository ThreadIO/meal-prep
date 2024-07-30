import { NextRequest, NextResponse } from "next/server";
import { propelauth } from "@/helpers/propelauth";

export async function POST(request: NextRequest) {
  var response: any = null;
  try {
    const query = await request.json(); // get the query from the request body
    response = await propelauth.fetchOrgByQuery(query);
    return NextResponse.json({ success: true, orgs: response.orgs });
  } catch (error: unknown) {
    if (error instanceof Error)
      return NextResponse.json(
        error.message +
          "\n this is the verifier key: " +
          process.env.PROPELAUTH_VERIFIER_KEY +
          "\n" +
          "this is the api key: " +
          process.env.PROPELAUTH_API_KEY
      );
    return NextResponse.json({
      success: false,
      message: "This is due to propelAuth",
    });
  }
}
