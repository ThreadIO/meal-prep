import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-east-2", // TODO: should be process.env.REGION
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request: NextRequest) {
  try {
    console.log("Uploading image to s3 bucket");
    const formData = await request.formData();
    const image = formData.get("image") as File;

    //
    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }
    const buffer = Buffer.from(await image.arrayBuffer());
    const data = await uploadImageToS3(buffer, image.name);
    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    console.log("Error: ", error);
    return NextResponse.json({
      success: false,
      error: "Error uploading file.",
    });
  }
}

async function uploadImageToS3(image: Buffer, imageName: String) {
  const imageBuffer = image;
  console.log("In upload s3 helper function");

  // TODO: Remove this code. It was for testing
  // const command = new ListBucketsCommand({});

  // try {
  //     const { Owner, Buckets } = await s3Client.send(command);
  //     console.log(
  //       `${Owner!.DisplayName} owns ${Buckets!.length} bucket${
  //         Buckets!.length === 1 ? "" : "s"
  //       }:`,
  //     );
  //     console.log(`${Buckets!.map((b) => ` • ${b.Name}`).join("\n")}`);
  //   } catch (err) {
  //     console.error(err);
  //   }
  const bucket = "threadwcimages";
  const key = `${imageName}`;
  const params = {
    Bucket: bucket, // TODO: should be process.env.AWS_S3_BUCKET_NAME
    Key: key,
    Body: imageBuffer,
    ContentType: "image/jpg",
  };

  const command = new PutObjectCommand(params);

  await s3Client.send(command);

  return {
    imageName: imageName,
    url: `https://${bucket}.s3.amazonaws.com/${key}`,
  };
}
