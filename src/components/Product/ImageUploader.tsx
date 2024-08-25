"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  // eslint-disable-next-line no-unused-vars
  onImageSelect: (image: File | null) => void;
}

const ImageUploader = (props: ImageUploaderProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setImagePreview(objectUrl);

    // Cleanup the URL object when the component is unmounted or the image changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);
      props.onImageSelect(selectedImage);
    }
  };

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //     e.preventDefault();
  //     if (!image) {
  //         return;
  //     }

  //     const formData = new FormData();
  //     formData.append('image', image);

  //     try {
  //         const response = await fetch('/api/s3-upload', {
  //             method: 'POST',
  //             body: 'formData',
  //         });

  //         const data = await response.json();
  //         console.log(data.status);
  //         // props.onUpload({src: data.url} as ProductImage) // Notify the parent component with the URL
  //         setUploading(false);

  //     } catch (error) {
  //         console.error('Error uploading image:', error);
  //         setUploading(false);
  //     }
  // }

  return (
    // <form onSubmit={handleSubmit}>
    <div>
      <input type="file" onChange={handleFileChange} />
      {imagePreview && (
        <div>
          <Image
            src={imagePreview}
            alt={"Image preview"}
            width={100}
            height={100}
            style={{
              objectFit: "contain",
              objectPosition: "center",
            }}
          />
        </div>
      )}
      {/* <button type="submit" disabled={!image || uploading}>
                    {uploading? "Uploading..." : "Upload Image"}
                </button> */}
    </div>

    // </form>
  );
};

export default ImageUploader;
