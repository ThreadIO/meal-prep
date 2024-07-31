import Subscription from "@/models/subscription.model";
import Org from "@/models/org.model";
import { NextResponse } from "next/server";

/** POST: http://localhost:3000/api/getsubscriptions */
export async function getSubscriptions(orgid: string) {
  try {
    if (!orgid)
      return NextResponse.json(
        { success: false, error: "No org id present...!" },
        { status: 400 }
      );

    const subscriptions = await Subscription.find({ orgid }, { __v: 0 });
    console.log("Subscriptions: ", subscriptions);
    if (!subscriptions) return NextResponse.json({ success: false, data: [] });

    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

/** POST: http://localhost:3000/api/subscription/orgid */
export async function createSubscription(
  mongoDbOrgId: string,
  subscriptionData: any
) {
  if (!mongoDbOrgId)
    return NextResponse.json(
      { success: false, error: "No mongoDbOrgId present...!" },
      { status: 400 }
    );

  if (!subscriptionData)
    return NextResponse.json({
      success: false,
      error: "Cannot get data from the user...!",
    });

  console.log("mongoDbOrgId Id: ", mongoDbOrgId);
  console.log("Subscription Data: ", subscriptionData);
  // Get current org
  const org = await Org.findById(mongoDbOrgId);
  console.log("Org found for sub: ", org);
  if (!org)
    return NextResponse.json(
      { success: false, error: "No org found...!" },
      { status: 404 }
    );

  // Create new subscription
  const subscription_model = new Subscription({
    ...subscriptionData,
    orgId: org._id,
  });

  // Save subscription in the database
  await subscription_model.save();

  // Push subscription in the org model
  org.subscriptions.push(subscription_model._id);

  // Save data in the org model
  await org.save();

  return NextResponse.json({ success: true, data: subscription_model });
}

/** PATCH: http://localhost:3000/api/subscription/subscriptionid */
export async function patchSubscription(id: string, body = {}) {
  try {
    if (!id)
      return NextResponse.json({
        success: false,
        error: "No subscription id present...!",
      });

    const updatedSubscription = await Subscription.findByIdAndUpdate(id, body, {
      new: true,
    });

    return NextResponse.json({ success: true, data: updatedSubscription });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

/** DELETE: http://localhost:3000/api/subscription/subscriptionid/orgid */
export async function deleteSubscription(subscriptionId: string) {
  try {
    if (!subscriptionId)
      return NextResponse.json({
        success: false,
        error: "Subscription ID is required...!",
      });

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription)
      return NextResponse.json({
        success: false,
        error: "Subscription not found...!",
      });

    const orgid = subscription.orgid;

    await Subscription.findByIdAndDelete(subscriptionId);

    // Remove subscription reference from org
    await Org.findByIdAndUpdate(orgid, {
      $pull: { subscriptions: subscriptionId },
    });

    return NextResponse.json({ success: true, deleted: subscriptionId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}
