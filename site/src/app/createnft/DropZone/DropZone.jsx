import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Style from "./DropZone.module.css";
import Image from "next/image";
import img from "../../../../public/img";

export default function DropZone({ onFileSelected }) {
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);

const onDrop = useCallback((acceptedFiles) => {
  const file = acceptedFiles[0];
  if (file) {
    // create a temporary URL so we can load the image and inspect its dimensions
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const { width, height } = img;
      // enforce your 200×200 to 3500×3500px rule
      if (
        width < 200 || height < 200 ||
        width > 3500 || height > 3500
      ) {
        alert("Image must be between 200×200 and 3500×3500 pixels.");
        URL.revokeObjectURL(url);
        return;
      }
      // if OK, show preview and notify parent
      setImage(url);
      onFileSelected(file);
    };
    img.onerror = () => {
      alert("Failed to load the image for validation.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }
}, [onFileSelected]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop,
    multiple: false,
  });

  return (
    <div className="p-2 border-2 border-dashed rounded-lg cursor-pointer w-20 h-20 flex items-center justify-center" {...getRootProps()}>
      <input {...getInputProps()} />
      {image ? (
        <img src={image} alt="preview" className={Style.img} />
      ) : (
        <Image
        alt="Upload Image"
        src={img.preview}
        className={Style.img}
      />
      )}
    </div>
  );
};