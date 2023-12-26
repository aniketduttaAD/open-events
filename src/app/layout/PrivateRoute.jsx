import { useSelector } from "react-redux";
import UnauthorisedModal from "../../features/authentication/UnauthorisedModal";

export default function PrivateRoute({ element: Element, prevLocation }) {
  const { authenticated } = useSelector((state) => state.auth);
  return authenticated ? (
    <Element />
  ) : (
    <UnauthorisedModal prevLocation={prevLocation} />
  );
}
