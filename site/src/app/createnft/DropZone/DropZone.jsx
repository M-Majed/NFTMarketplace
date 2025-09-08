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

        const url = data.url;
        const probe = new window.Image();
        probe.onload = () => {
          const { width, height } = probe;
          if (width < 512 || height < 512 || width > 4000 || height > 4000) {
            alert("Image must be between 512×512 and 4000×4000 pixels.");
            return;
          }
          setFileUrl(url);
          setImage({ url, width, height, size: file.size });
        };
        probe.onerror = () => {
          alert("Failed to load the image for validation.");
        };
        probe.src = url;
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
    <div className={Style.dropzone} {...getRootProps()}>
      <input {...getInputProps()} />
      {fileUrl ? (
        <img src={fileUrl} alt="Preview" className={Style.img} />
      ) : (
        <Image
          alt="Upload placeholder"
          src={img.preview}
          width={256}
          height={256}
          className={Style.img}
          priority
        />
      )}
    </div>
  );
}
