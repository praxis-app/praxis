import Link from "next/link";
import { useEffect } from "react";
import jwtDecode from "jwt-decode";
import { Nav } from "react-bootstrap";
import { useQuery, useMutation } from "@apollo/client";

import { setAuthToken } from "../../utils/auth";
import { CURRENT_USER } from "../../apollo/client/queries";
import { LOGOUT_USER, SET_CURRENT_USER } from "../../apollo/client/mutations";

const Header = () => {
  const { data } = useQuery(CURRENT_USER);
  const [logoutUser] = useMutation(LOGOUT_USER);
  const [setCurrentUser] = useMutation(SET_CURRENT_USER);

  useEffect(() => {
    if (localStorage.jwtToken) {
      setAuthToken(localStorage.jwtToken);
      const decoded: User = jwtDecode(localStorage.jwtToken);
      setCurrentUserMutate(decoded);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        logoutUserMutate();
      }
    }
  }, [setCurrentUser]);

  const setCurrentUserMutate = async (user: User) => {
    await setCurrentUser({
      variables: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  };

  const logoutUserMutate = async () => {
    await logoutUser();
  };

  return (
    <nav
      className="navbar navbar-dark navbar-expand-lg"
      style={{ marginBottom: "50px", background: "rgb(30, 30, 30)" }}
    >
      <Link href="/" passHref>
        <Nav.Link className="navbar-brand">Praxis</Nav.Link>
      </Link>

      <div className="collpase navbar-collapse">
        <ul className="navbar-nav mr-auto">
          <li className="navbar-item">
            <Link href="/users" passHref>
              <Nav.Link className="nav-link">Users</Nav.Link>
            </Link>
          </li>

          {data && data.user.isAuthenticated ? (
            <>
              <li className="navbar-item">
                <Link href={`/users/${data.user.name}`} passHref>
                  <Nav.Link className="nav-link">{data.user.name}</Nav.Link>
                </Link>
              </li>

              <li className="navbar-item">
                <Link href="/users/login" passHref>
                  <Nav.Link
                    onClick={() =>
                      window.confirm("Are you sure you want to log out?") &&
                      logoutUserMutate()
                    }
                    className="nav-link"
                  >
                    Log out
                  </Nav.Link>
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link href="/users/login" passHref>
                  <Nav.Link className="nav-link">Log in</Nav.Link>
                </Link>
              </li>

              <li className="navbar-item">
                <Link href="/users/signup" passHref>
                  <Nav.Link className="nav-link">Sign up</Nav.Link>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
