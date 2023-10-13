import { Link } from "react-router-dom";
import HeaderLogo from "./HeaderLogo";

const HeaderLogoContainer = () => {
    return (
        <div className="d-flex pe-5">
            <Link to="/" className="link-settings">
                <HeaderLogo />
            </Link>
        </div>
    );
};

export default HeaderLogoContainer;