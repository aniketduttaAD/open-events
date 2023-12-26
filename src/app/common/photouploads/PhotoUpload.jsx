import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button, Modal, Icon, Header } from "semantic-ui-react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { toast } from "react-toastify";
import cuid from "cuid";
import { getFileExtension } from "../utils/utility";
import { uploadToFirebaseStorage } from "../../firestore/firebaseService";
import { updateUserProfilePicture } from "../../firestore/firestoreService";

export default function PhotoUpload({ open, setOpen, context }) {
  const [files, setFiles] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const cropper = useRef(null);

  function handleUploadImage(imageBlob) {
    setLoading(true);
    const filename = cuid() + "." + getFileExtension(files[0].name);
    uploadToFirebaseStorage(imageBlob, filename, context)
      .then((downloadURL) => {
        updateUserProfilePicture(downloadURL, filename, context)
          .then(() => {
            setLoading(false);
            handleClose();
          })
          .catch((error) => {
            toast.error(error.message);
            setLoading(false);
          });
      })
      .catch((error) => {
        toast.error(error.message);
        setLoading(false);
      });
  }

  const handleClose = () => {
    setOpen(false);
    setImage(null);
    setFiles([]);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFiles([file]);
      setImage(URL.createObjectURL(file));
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSaveImage = () => {
    if (
      cropper.current &&
      cropper.current.cropper &&
      typeof cropper.current.cropper.getCroppedCanvas === "function"
    ) {
      const canvas = cropper.current.cropper.getCroppedCanvas();
      if (canvas) {
        const width = canvas.width;
        const height = canvas.height;
        if (context === "profilePhoto") {
          if (width <= 600 && height <= 600) {
            canvas.toBlob((blob) => {
              handleUploadImage(blob);
            });
          } else {
            toast.error(
              "Please select an image with dimensions of 600x600 pixels."
            );
          }
        } else {
          if (width <= 900 && height <= 400) {
            canvas.toBlob((blob) => {
              handleUploadImage(blob);
            });
          } else {
            toast.error(
              "Please select an image with dimensions of 900x400 pixels."
            );
          }
        }
      }
    }
  };

  return (
    <Modal
      closeIcon
      open={open}
      onClose={handleClose}
      closeOnDimmerClick={false}
      style={{ width: context === "coverPhoto" ? "60%" : "30%" }}
    >
      <Modal.Header content='Update profile picture' />
      <Modal.Content>
        {image ? (
          <Cropper
            ref={cropper}
            style={{
              height: 400,
              width: context === "coverPhoto" ? "100%" : "100%",
            }}
            aspectRatio={context === "coverPhoto" ? 16 / 9 : 1}
            preview='.img-preview'
            guides={false}
            viewMode={1}
            dragMode='move'
            scalable={true}
            cropBoxMovable={true}
            cropBoxResizable={true}
            src={image}
          />
        ) : (
          <div
            {...getRootProps()}
            style={{
              border: isDragActive ? "dashed 3px green" : "dashed 3px #eee",
              borderRadius: "5%",
              paddingTop: "16vh",
              paddingBottom: "16vh",
              textAlign: "center",
              display: files.length ? "none" : "block",
            }}
          >
            <input {...getInputProps()} />
            <Icon name='upload' size='large' />
            <Header content='Drop your image' />
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button color='youtube' icon='close' onClick={handleClose} />
        <Button
          loading={loading}
          color='youtube'
          icon='save'
          onClick={handleSaveImage}
          disabled={!files.length}
        />
      </Modal.Actions>
    </Modal>
  );
}
