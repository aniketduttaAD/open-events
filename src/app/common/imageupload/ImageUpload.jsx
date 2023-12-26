import { useState } from "react";
import { uploadImage } from "../imageupload/imageUploadReducer";
import { useDispatch } from "react-redux";
import { Segment, Input, Button, Icon } from "semantic-ui-react";

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const selectedImage = e.target.files[0];
    setFile(selectedImage);
  };
  const handleClick = () => {
    dispatch(uploadImage(file));
    console.log("Uploading file:", file);
  };

  return (
    <Segment>
      <Input
        type='file'
        label={<Button icon='file' />}
        labelPosition='right'
        onChange={handleFileChange}
      />
      {file && (
        <div style={{ marginTop: "10px" }}>
          <span>
            <Icon name='file outline' /> {file.name}
          </span>
          <Button style={{ marginLeft: "10px" }} primary onClick={handleClick}>
            Upload
          </Button>
        </div>
      )}
    </Segment>
  );
};

export default ImageUpload;
