// src/app/createnft/DropZone/DropZone.jsx
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Style from "./DropZone.module.css";
import Image from "next/image";
import img from "@/lib/img";

export default function DropZone({ setImage }) {
  const [fileUrl, setFileUrl] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 50 * 1024 * 1024) {
        alert("File too large. Maximum size is 50MB.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/create-nft/upload-image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        const { url, hash } = data;
        const img = new window.Image();
        img.onload = () => {
          const { width, height } = img;
          // enforce your 512×512 to 4000×4000px rule
          if (width < 512 || height < 512 || width > 4000 || height > 4000) {
            alert("Image must be between 512×512 and 4000×4000 pixels.");
            URL.revokeObjectURL(url);
            return;
          }
          // if OK, show preview and notify parent
          setFileUrl(url);
          setImage({ url, hash, width, height, size: file.size });
          console.log(url);
        };
        img.onerror = () => {
          alert("Failed to load the image for validation.");
          URL.revokeObjectURL(url);
        };
        img.src = url;
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Image upload failed: " + error.message);
      }
    },
    [setImage]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop,
    multiple: false,
  });

  return (
    <div
      className="p-2 border-2 border-dashed rounded-lg cursor-pointer w-20 h-20 flex items-center justify-center"
      {...getRootProps()}>
      <input {...getInputProps()} />
      {fileUrl ? (
        <img src={fileUrl} alt="preview" className={Style.img} />
      ) : (
        <Image alt="Upload Image" src={img.preview} className={Style.img} />
      )}
    </div>
  );
}
