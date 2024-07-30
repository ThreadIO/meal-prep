import Subscription from "@/models/subscription.model";
import Org from "@/models/org.model";
import { NextResponse } from "next/server";

/** POST: http://localhost:3000/api/getsubscriptions */
export async function getSubscriptions(orgId: string) {
  try {
    if (!orgId)
      return NextResponse.json(
        { success: false, error: "No org id present...!" },
        { status: 400 }
      );

    const subscriptions = await Subscription.find({ orgId }, { __v: 0 });

    if (!subscriptions) return NextResponse.json({ success: false, data: [] });

    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

/** POST: http://localhost:3000/api/subscription/orgid */
export async function createSubscription(orgId: string, subscriptionData: any) {
  if (!orgId)
    return NextResponse.json(
      { success: false, error: "No org id present...!" },
      { status: 400 }
    );

  if (!subscriptionData)
    return NextResponse.json({
      success: false,
      error: "Cannot get data from the user...!",
    });

  // Get current org
  const org = await Org.findOne({ orgid: orgId });
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
export async function deleteSubscription(
  subscriptionId: string,
  orgId: string
) {
  try {
    if (!subscriptionId || !orgId)
      return NextResponse.json({
        success: false,
        error: "Subscription ID and Org ID are required...!",
      });

    await Subscription.findByIdAndDelete(subscriptionId);

    // Remove subscription reference from org
    await Org.findByIdAndUpdate(orgId, {
      $pull: { subscriptions: subscriptionId },
    });

    return NextResponse.json({ success: true, deleted: subscriptionId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}
