import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Style from "./DropZone.module.css";
import Image from "next/image";
import img from "../../../../public/img";

const DropZone = () => {
  const [image, setImage] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(Object.assign(file, { preview: URL.createObjectURL(file) }));
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop,
    multiple: false,
  });

  return (
    <div className="p-2 border-2 border-dashed rounded-lg cursor-pointer w-20 h-20 flex items-center justify-center" {...getRootProps()}>
      <input {...getInputProps()} />
      {image ? (
        <img src={image.preview} alt="preview" className={Style.img} />
      ) : (
        <Image
        alt="Upload Image"
        src={img.nft_image_1}
        className={Style.img}
      />
      )}
    </div>
  );
};

export default DropZone;