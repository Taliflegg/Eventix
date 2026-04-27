import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { fetchAuthenticatedUser, verifyGoogleToken } from '../services/usersService';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
//A TypeScript block that allows you to declare global variables or objects that are not automatically recognized by TypeScript.
declare global {
    //Extending the global 'Window' interface in the browser.
    interface Window {
        //Declares that the 'window' object has a property named 'google' of type 'any',
        //originating from the externally loaded Google Identity Services library.
        google: any;
    }
}
const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t }: { t: (key: string) => string } = useTranslation();

    // This is the function that will be automatically called by the Google library
    // after the user successfully logs in with Google and authorizes access to the app.
    const handleCredentialResponse = async (response: any) => {
        try {
            // Sending the ID Token to the Backend for verification.
            await verifyGoogleToken(response.credential);
            console.log('Login succeeded');
            toast.success(t('LoginPage.success'));
            setTimeout(() => {
                const s = localStorage.getItem('eventSharedUrl');
                if (s != null) {
                    localStorage.removeItem('eventSharedUrl');
                    navigate(s);
                } else {
                    (async () => {
                        try {
                            const fetchedUser = await fetchAuthenticatedUser();
                            login(fetchedUser);
                            navigate('/AppHome');
                        } catch (err) {
                            console.error('Failed to fetch user:', err);
                        }
                    })();
                }
            }, 4000);
            //Take the user to their event page
        } catch (error: any) {
            //Check if a user does not exist in the system
            if (error.response?.status === 403) {
                toast.error(t("LoginPage.notRegistered"));
                return;
            }
            else if (error.response?.status === 404) {
                toast.error(t("LoginPage.userNotFound"));
                setTimeout(() => navigate("/register"), 4000);
                //Transfer to Google registration
                return;
            }
            console.error('Error sending token to backend:', error);
            toast.error(t("LoginPage.verifyError") + ": " + (error.message || t("LoginPage.unexpectedError")));
        }
    };
    // useEffect to initialize the Google library and display the button when the component loads.
    useEffect(() => {
        const interval = setInterval(() => {
            const buttonDiv = document.getElementById("google-signin-button");
            // The Google object will only be available after the GSI library has been successfully loaded from index.html
            if (window.google && window.google.accounts && buttonDiv && buttonDiv.childNodes.length === 0) {
                // Clean before rendering to avoid double rendering
                buttonDiv.innerHTML = "";
                clearInterval(interval);
                // Initialize the Google Identity Services library
                window.google.accounts.id.initialize({
                    //Retrieve the application's client ID from the environment variables
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                    // The function that will handle Google's response
                    callback: handleCredentialResponse,
                });
                // Display the Google login button
                window.google.accounts.id.renderButton(
                    // The element where the button will be displayed
                    buttonDiv,
                    {
                        theme: "outline",      // Button style
                        size: "large",         // Button size
                        text: "continue_with", // Button text
                        shape: "rectangular",  // Button shape
                        width: "250",          // Custom width in pixels
                        locale: "en",          // Button language
                        logo_alignment: "left" // Logo alignment
                    }
                );
            }
        }, 100);
        return () => clearInterval(interval);
    }, [handleCredentialResponse]);
    return (
        <div style={{
            display: 'flex',            // Use flexbox to center content
            flexDirection: 'column',    // Arrange items in a column
            alignItems: 'center',       // Center horizontally
            justifyContent: 'center',   // Center vertically
            textAlign: 'center'         // Center text within the div
        }}>
            {/* This is the HTML placeholder where Google's JS will draw the button  */}
            <div id="google-signin-button"></div>
        </div >
    );
};
export default LoginPage;