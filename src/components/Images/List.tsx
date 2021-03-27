import Link from "next/link";
import baseUrl from "../../utils/baseUrl";

const List = ({ images }) => {
  return (
    <div style={{ marginBottom: "10px" }}>
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
    </div>
  );
};

export default List;
