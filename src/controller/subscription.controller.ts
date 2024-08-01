import Subscription from "@/models/subscription.model";
import Org from "@/models/org.model";
import { NextResponse } from "next/server";
import {
  createPayinConfig,
  createPayinFromPaymentMethod,
} from "@/helpers/rainforest";
import { startSession } from "mongoose";
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

export async function triggerSubscription(
  subscriptionid: string,
  nextBillingDate: Date | null = null
) {
  const session = await startSession();
  session.startTransaction();

  try {
    if (!subscriptionid) {
      throw new Error("No subscription id present...!");
    }

    const subscription =
      await Subscription.findById(subscriptionid).session(session);
    if (!subscription) {
      throw new Error("Subscription not found...!");
    }

    // Generate a unique identifier for this billing cycle
    const billingCycleId = `${subscriptionid}_${subscription.nextBillingDate.toISOString()}`;

    // Check if this billing cycle has already been processed
    if (
      subscription.processedBillingCycles &&
      subscription.processedBillingCycles.includes(billingCycleId)
    ) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({
        success: true,
        message: "Billing cycle already processed",
      });
    }

    console.log("Triggering subscription: ", subscription);
    const payinConfigReponse = await createPayinConfig({
      amount: subscription.amount,
    });
    const payinConfig = (payinConfigReponse.response as { data: any }).data;
    console.log("Payin Config: ", payinConfig);
    const payinConfigId = payinConfig.payin_config_id;
    const response = await createPayinFromPaymentMethod(
      subscription.paymentMethodId,
      payinConfigId
    );
    const data = (response.response as { data: any }).data;
    console.log("Payin Response: ", response);

    // Update the subscription with the processed billing cycle and new billing date
    const updateData: any = {
      $push: { processedBillingCycles: billingCycleId },
    };
    if (nextBillingDate) {
      console.log("Setting next billing date: ", nextBillingDate);
      updateData.nextBillingDate = nextBillingDate;
    }

    await Subscription.findByIdAndUpdate(subscriptionid, updateData, {
      session,
    });

    await session.commitTransaction();
    session.endSession();

    console.log("Subscription triggered successfully");
    console.log("Data: ", data);

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json({ success: false, error: error });
  }
}

export async function checkSubscriptions() {
  const session = await startSession();
  session.startTransaction();

  try {
    const currentDate = new Date();
    const subscriptions = await Subscription.find({
      nextBillingDate: { $lte: currentDate },
      status: "active",
    }).session(session);

    const results = [];

    for (const subscription of subscriptions) {
      const nextBillingDate = calculateNextBillingDate(subscription);
      const result = await triggerSubscription(
        subscription._id.toString(),
        nextBillingDate
      );
      const data = await result.json();
      results.push(data);
    }

    await session.commitTransaction();
    session.endSession();
    console.log("Results: ", results);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error checking subscriptions:", error);
    return NextResponse.json({ success: false, error: error });
  }
}

function calculateNextBillingDate(subscription: any) {
  const currentDate = new Date();
  let nextDate = new Date(subscription.nextBillingDate);

  while (nextDate <= currentDate) {
    switch (subscription.billingFrequency) {
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7 * subscription.billingInterval);
        break;
      case "monthly":
        nextDate.setMonth(
          nextDate.getMonth() + 1 * subscription.billingInterval
        );
        break;
      case "quarterly":
        nextDate.setMonth(
          nextDate.getMonth() + 3 * subscription.billingInterval
        );
        break;
      case "yearly":
        nextDate.setFullYear(
          nextDate.getFullYear() + 1 * subscription.billingInterval
        );
        break;
    }
  }

  return nextDate;
}
