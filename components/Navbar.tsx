import { useOutletContext} from "react-router";
import { Box } from "lucide-react";
import Button from "./ui/Button";
import { APP_INFO } from "../lib/app-info";

export default function Navbar() {
    const { isSignedIn, userName, signIn, signOut } = useOutletContext<AuthContext>()

    const handleAuthClick = async () => {

        if(isSignedIn) {
            try {
                await signOut();
            } catch (e) {
                console.error({message: "Puter Log out failed!", error: e})
            }
            return;
        }

        try {
            await signIn();
        } catch (e) {
            console.error({message: "Puter Log in failed!", error: e})
        }
    }


    return (
        <header className="navbar">
            <nav className="inner">
                <div className="left">

                    <div className="brand">
                        <Box className="logo" />

                        <span className="name capitalize">
                            {APP_INFO.title}
                        </span>
                    </div>

                    <ul className="links">
                        <a href="#">Product</a>
                        <a href="#">Pricing</a>
                        <a href="#">Community</a>
                        <a href="#">Enterprise</a>
                    </ul>

                </div>
                <div className="actions">
                    {isSignedIn ? (
                        <>
                        <span className="greeting">
                            {
                                userName ? `Hi ${userName}` : "Signed In"
                            }
                        </span>

                        <Button size="sm" className="btn" onClick={handleAuthClick}>Log Out</Button>
                        </>
                    ) : (
                        <>
                             <Button size="sm" variant="ghost" onClick={handleAuthClick}>Log In</Button>
                            <a href="#upload"
                               className="cta" >
                                Get Started
                            </a>
                        </>
                    )
                    }

                </div>
            </nav>
        </header>
    )
}
