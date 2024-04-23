import User from "@/models/user.model";
import { NextResponse } from "next/server";
import { encryptField } from "@/helpers/encrypt";
export async function getUser(userid: string) {
  try {
    console.log("In get user...");
    const user = await User.findOne({ userid: userid });
    console.log("User: ", user);
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.log("Error in Get User: ", error);
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}

/** POST: http://localhost:3000/api/user */
export async function createUser(userid: string, settings: any) {
  try {
    if (!userid)
      return NextResponse.json({
        success: false,
        error: "No user id present...!",
      });
    console.log("In create User...");
    const user_response = await getUser(userid);
    console.log("Got user response: ", user_response);
    const data = await user_response.json();
    if (data != null && data.data != null) {
      console.log("User already exists...!");
      return NextResponse.json({
        success: false,
        error: "User already exists...!",
      });
    }
    console.log("Data: ", data);
    if (settings.client_key && settings.client_secret) {
      settings.client_key = encryptField(settings.client_key);
      settings.client_secret = encryptField(settings.client_secret);
    }
    const newUser = {
      userid: userid,
      settings: settings,
    };
    console.log("New User: ", newUser);
    const user = await User.create(newUser);
    console.log("User Created: ", user);
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

/** DELETE: http://localhost:3000/api/recipe/id */
export async function deleteUser(userid: string) {
  try {
    if (!userid)
      return NextResponse.json({
        success: false,
        error: "No user id present...!",
      });

    await User.deleteMany({ userid: userid });

    return NextResponse.json({ success: true, deleted: userid });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

export async function patchUser(userid: string, body = {}) {
  try {
    console.log("UserId ID: ", userid);
    if (!userid)
      return NextResponse.json({
        success: false,
        error: "No user id present...!",
      });
    if (
      (body as any) &&
      (body as any).settings &&
      (body as any).settings.client_key &&
      (body as any).settings.client_secret
    ) {
      (body as any).settings.client_key = encryptField(
        (body as any).settings.client_key
      );
      (body as any).settings.client_secret = encryptField(
        (body as any).settings.client_secret
      );
    }
    await User.updateMany({ userid: userid }, body);
    return NextResponse.json({ success: true, updated: userid });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}
