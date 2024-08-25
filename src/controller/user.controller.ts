import User from "@/models/user.model";
import { NextResponse } from "next/server";
import { encryptField } from "@/helpers/encrypt";

export async function getUser(userid: string) {
  try {
    const user = await User.findOne({ userid: userid });
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
    // if (data != null && data.data != null) {
    //   console.log("User already exists...!");
    //   return NextResponse.json({
    //     success: false,
    //     error: "User already exists...!",
    //   });
    // }
    console.log("Data: ", data);
    console.log("Settings: ", settings);
    if (
      settings.client_key &&
      settings.client_secret &&
      settings.username &&
      settings.application_password
    ) {
      settings.client_key = encryptField(settings.client_key);
      settings.client_secret = encryptField(settings.client_secret);
      settings.application_password = encryptField(settings.username);
      settings.application_password = encryptField(
        settings.application_password
      );
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

export async function patchUser(userid: string, body: any = {}) {
  try {
    console.log("UserId ID: ", userid);
    if (!userid)
      return NextResponse.json({
        success: false,
        error: "No user id present...!",
      });

    const updateFields: any = {};

    if (body.settings) {
      if (body.settings.client_key) {
        updateFields["settings.client_key"] = encryptField(
          body.settings.client_key
        );
      }
      if (body.settings.client_secret) {
        updateFields["settings.client_secret"] = encryptField(
          body.settings.client_secret
        );
      }
      if (body.settings.url) {
        updateFields["settings.url"] = body.settings.url;
      }
      if (body.settings.username) {
        updateFields["settings.username"] = encryptField(
          body.settings.username
        );
      }
      if (body.settings.application_password) {
        updateFields["settings.application_password"] = encryptField(
          body.settings.application_password
        );
      }
    }

    if (Object.keys(updateFields).length > 0) {
      await User.updateOne({ userid: userid }, { $set: updateFields });
      return NextResponse.json({ success: true, updated: userid });
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
