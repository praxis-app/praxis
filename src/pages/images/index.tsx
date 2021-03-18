import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";

import ImagesForm from "../../components/Images/Form";
import ImagesList from "../../components/Images/List";
import { IMAGES, CURRENT_USER } from "../../apollo/client/queries";
import { UPLOAD_IMAGE, DELETE_IMAGE } from "../../apollo/client/mutations";

const Index = () => {
  const [images, setImages] = useState(null);
  const [uploadImage] = useMutation(UPLOAD_IMAGE);
  const [deleteImage] = useMutation(DELETE_IMAGE);
  const currentUserRes = useQuery(CURRENT_USER);
  const imagesRes = useQuery(IMAGES);

  useEffect(() => {
    setImages(imagesRes.data ? imagesRes.data.allImages : imagesRes.data);
  }, [imagesRes.data]);

  const handleSubmit = async (e, image) => {
    e.preventDefault();

    try {
      if (currentUserRes.data) {
        const { data } = await uploadImage({
          variables: { image: image, userId: currentUserRes.data.user.id },
        });
        e.target.reset();
        setImages([...images, data.uploadImage.image]);
      }
    } catch (err) {
      alert(err);
    }
  };

  const deleteImageHandler = async (id) => {
    try {
      await deleteImage({
        variables: {
          id,
        },
      });
      // Removes deleted image from state
      setImages(images.filter((image) => image.id !== id));
    } catch {}
  };

  return (
    <>
      <ImagesForm handleSubmit={handleSubmit} />
      <ImagesList images={images} />
    </>
  );
};

export default Index;
