import Link from "next/link";
import { useRouter } from "next/router";
import baseUrl from "../../utils/baseUrl";

interface Props {
  images: Image[];
}

const List = ({ images }: Props) => {
  const router = useRouter();

  return (
    <>
      {images
        .slice()
        .reverse()
        .map(({ id, postId, path }) => {
          return (
            <Link href={postId ? `/posts/${postId}` : router.asPath} key={id}>
              <a>
                <img
                  src={baseUrl + path}
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
