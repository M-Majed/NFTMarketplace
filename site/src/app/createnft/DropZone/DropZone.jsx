// src/app/createnft/DropZone/DropZone.jsx
import React, { useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import img from "@/lib/img";
import style from "./DropZone.module.css";

export default function DropZone({ setImage: set_image }) {
  const [file_url, set_file_url] = useState(null);

  const handle_drop = useCallback(
    async (accepted_files) => {
      const file = accepted_files[0];
      if (!file) return;

      if (file.size > 50 * 1024 * 1024) {
        alert("File too large. Max 50MB.");
        return;
      }

      const form_data = new FormData();
      form_data.append("file", file);

      try {
        const res = await fetch("/api/create-nft/upload-image", {
          method: "POST",
          body: form_data,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        const url = data.url;
        const probe = new window.Image();
        probe.onload = () => {
          const { width, height } = probe;
          if (width < 512 || height < 512 || width > 4000 || height > 4000) {
            alert("Image must be 512–4000px.");
            return;
          }
          set_file_url(url);
          set_image({ url, width, height, size: file.size });
        };
        probe.onerror = () => {
          alert("Image validation failed.");
        };
        probe.src = url;
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Upload failed: " + error.message);
      }
    },
    [set_image]
  );

  const { getRootProps: get_root_props, getInputProps: get_input_props } =
    useDropzone({
      accept: "image/*",
      onDrop: handle_drop,
      multiple: false,
    });

  return (
    <div className={style.dropzone} {...get_root_props()}>
      <input {...get_input_props()} />
      {file_url ? (
        <img src={file_url} alt="Preview" className={style.img} />
      ) : (
        <Image
          alt="Upload"
          src={img.preview}
          width={256}
          height={256}
          className={style.img}
          priority
        />
      )}
    </div>
  );
}
