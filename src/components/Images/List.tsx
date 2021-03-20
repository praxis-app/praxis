import Link from "next/link";
import { Spinner } from "react-bootstrap";
import baseUrl from "../../utils/baseUrl";

const List = ({ images }) => {
  if (images.length)
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

  return <Spinner animation="border" />;
};

export default List;
