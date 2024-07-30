import Org from "@/models/org.model";
import { NextResponse } from "next/server";
import {
  createSubscription,
  patchSubscription,
} from "@/controller/subscription.controller";

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
      orgid: body.orgid,
      name: body.name,
      merchantid: body.merchandid,
      url: body.url,
      service: body.service,
      subscriptions: [],
    };
    const org = await Org.create(newOrg);

    // Create new subscriptions
    for (const sub of body.subscriptions) {
      const { isNew, ...subData } = sub;
      if (isNew) {
        await createSubscription(org._id, subData);
      }
    }

    const updatedOrg = await Org.findById(org._id).populate("subscriptions");
    console.log("Created Org: ", updatedOrg);
    return NextResponse.json({ success: true, data: updatedOrg });
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

      // Handle subscriptions separately
      const { subscriptions, ...orgData } = body;

      const updatedOrg = await Org.findOneAndUpdate({ orgid: orgid }, orgData, {
        new: true,
      });

      // Create new subscriptions and update existing ones
      for (const sub of subscriptions) {
        const { isNew, ...subData } = sub;
        if (isNew) {
          await createSubscription(orgid, subData);
        } else {
          await patchSubscription(sub._id, sub);
        }
      }

      // Fetch the updated org with populated subscriptions
      const finalUpdatedOrg = await Org.findById(updatedOrg._id).populate(
        "subscriptions"
      );

      return NextResponse.json({ success: true, data: finalUpdatedOrg });
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
    const orgs = await Org.find({}).populate("subscriptions");
    console.log("Orgs: ", orgs);
    return NextResponse.json({ success: true, data: orgs });
  } catch (error) {
    console.log("Error in Get Org: ", error);
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}
