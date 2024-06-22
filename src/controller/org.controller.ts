import Org from "@/models/org.model";
import { NextResponse } from "next/server";

export async function getOrgByPropelAuth(orgid: string) {
  try {
    const org = await Org.findOne({ orgid: orgid });
    console.log("Org: ", org);
    return NextResponse.json({ success: true, data: org });
  } catch (error) {
    console.log("Error in Get Org: ", error);
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}

export async function getOrgByRainforest(merchantid: string) {
  try {
    const org = await Org.findOne({ orgid: merchantid });
    console.log("Merchant: ", org);
    return NextResponse.json({ success: true, data: org });
  } catch (error) {
    console.log("Error in Get Org: ", error);
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}

/** POST: http://localhost:3000/api/org */
export async function createOrg(orgid: string, body: any) {
  console.log("In create org helper");
  try {
    if (!orgid)
      return NextResponse.json({
        success: false,
        error: "No org id present...!",
      });
    const existingOrg = (await (await getOrgByPropelAuth(orgid)).json()).data;
    if (existingOrg) {
      console.log("Org already exists...!");
      return NextResponse.json({
        success: false,
        error: "Org already exists...!",
      });
    }
    const newOrg = {
      orgid: body.orgid, // This is the id from the propelAuth
      name: body.name, // Name of the organization
      merchantid: body.merchandid, // This is the id from rainforest
      url: body.url, // This is the URL of the company's website
      service: body.service, // Name of the service (Woocommerce, Shopify, ect.)
    };
    const org = await Org.create(newOrg);
    console.log("Created Org: ", org);
    return NextResponse.json({ success: true, data: org });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

/** DELETE: http://localhost:3000/api/recipe/id */
export async function deleteOrg(orgid: string) {
  try {
    if (!orgid)
      return NextResponse.json({
        success: false,
        error: "No org id present...!",
      });

    await Org.deleteMany({ orgid: orgid });

    return NextResponse.json({ success: true, deleted: orgid });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

export async function patchOrg(orgid: string, body: any = {}) {
  try {
    if (!orgid)
      return NextResponse.json({
        success: false,
        error: "No org id present...!",
      });

    if (Object.keys(body).length > 0) {
      console.log("Body: ", body);
      await Org.updateOne({ orgid: orgid }, { $set: body });
      return NextResponse.json({ success: true, updated: orgid });
    } else {
      return NextResponse.json({
        success: false,
        error: "No valid fields to update",
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

export async function getAllOrgs() {
  try {
    const orgs = Org.find({});
    console.log("Orgs: ", orgs);
    return NextResponse.json({ success: true, data: orgs });
  } catch (error) {
    console.log("Error in Get Org: ", error);
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}
