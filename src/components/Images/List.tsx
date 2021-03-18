import Link from "next/link";
import { Spinner } from "react-bootstrap";
import baseUrl from "../../utils/baseUrl";

const List = ({ images }) => {
  if (images)
    return (
      <>
        {images
          .slice()
          .reverse()
          .map(({ id, postId, path }) => {
            return (
              <div key={id}>
                <Link href={`/posts/${postId}`}>
                  <a>
                    <img
                      src={baseUrl + path}
                      alt="Data could not render."
                      style={{
                        width: "95%",
                        display: "block",
                        marginTop: "12px",
                      }}
                    />
                  </a>
                </Link>
              </div>
            );
          })}
      </>
    );

  return <Spinner animation="border" />;
};

export default List;
