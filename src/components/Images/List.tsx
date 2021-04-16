import Link from "next/link";
import { useRouter } from "next/router";
import baseUrl from "../../utils/baseUrl";

interface Props {
  images: Image[];
}

const List = ({ images }: Props) => {
  const router = useRouter();

  const imgLinkPath = (image: Image): string => {
    if (image.postId) return `/posts/${image.postId}`;
    if (image.motionId) return `/motions/${image.motionId}`;
    return router.asPath;
  };

  return (
    <>
      {images
        .slice()
        .reverse()
        .map((image) => {
          return (
            <Link href={imgLinkPath(image)} key={image.id}>
              <a>
                <img
                  src={baseUrl + image.path}
                  alt="Data could not render."
                  style={{
                    width: "100%",
                    display: "block",
                  }}
                />
              </a>
            </Link>
          );
        })}
    </>
  );
};

export default List;
