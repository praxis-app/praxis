import Link from "next/link";
import baseUrl from "../../utils/baseUrl";

const List = ({ images }) => {
  return (
    <>
      {images
        .slice()
        .reverse()
        .map(({ id, postId, path }) => {
          return (
            <Link href={`/posts/${postId}`} key={id}>
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
