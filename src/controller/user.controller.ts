import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function getUser(userid: string) {
  try {
    const user = await User.find({ userid: userid });
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}

/** POST: http://localhost:3000/api/recipe */
export async function createUser(userid: string, settings: any) {
  try {
    if (!userid)
      return NextResponse.json({
        success: false,
        error: "No user id present...!",
      });
    const existing = await (await getUser(userid)).json();
    if (existing.data.length > 0) {
      console.log("User already exists...!");
      return NextResponse.json({
        success: false,
        error: "User already exists...!",
      });
    }
    const newUser = {
      userid: userid,
      settings: settings,
    };
    const user = await User.create(newUser);
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

    await User.updateMany({ userid: userid }, body);

    return NextResponse.json({ success: true, updated: userid });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}
