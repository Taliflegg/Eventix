import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Profile from '../components/Proffile';
import { useAuth } from '../context/AuthContext';
import { fetchAddUserActivity } from '../services/userActivityService';
import LanguageSwitcher from './LanguageSwitcher';

// כפתור החלפת שפה פשוט למובייל
const MobileLanguageToggle = () => {
    const { i18n } = useTranslation();
    
    const getCurrentLanguageDisplay = () => {
        return i18n.language === 'he' ? 'עברית' : 'English';
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'he' ? 'en' : 'he';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="
                px-3 py-2 rounded-lg text-sm font-medium text-white
                bg-gradient-to-r from-gray-800 to-gray-900
                border border-gray-700/60 hover:border-gray-500/80
                shadow-md shadow-gray-800/30 hover:shadow-gray-600/50
                transform transition-all duration-300 hover:scale-105
                focus:outline-none
            "
        >
            {getCurrentLanguageDisplay()}
        </button>
    );
};

function NavBar() {
    const { t }: { t: (key: string) => string } = useTranslation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const { user } = useAuth();
    const location = useLocation();
    const seeProfile = !["/", "/register","/verify"].includes(location.pathname);

    const handleAddActivity = async (appName: string) => {
        try {
            const response = await fetchAddUserActivity(appName);
            console.log('Activity added:', response);
        }
        catch (error: any) {
            console.error(error);
            toast.error('Activity added failed: ' + (error.message || 'Unknown error'));
        }
    };

    useEffect(() => {
        const appName = getAppNameFromPath(location.pathname);
        if (appName === 'Events' || appName === 'Shabbat' || appName === 'MealTrain') {
            handleAddActivity(appName);
        }
        if(location.pathname !== "/verify-profile"){
            setIsProfileOpen(false);
        }    
        
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const getAppNameFromPath = (pathname: string) => {
        switch (pathname) {
            case '/AppHome':
                return 'AppHome';
            case '/events':
                return 'Events';
            case '/Shabbat':
                return 'Shabbat';
            case '/meals':
                return 'MealTrain';
            default:
                return 'Unknown App';
        }
    };

    const navLinks = [
        { to: "/AppHome", label: t("NavBar.Home_Button") },
        ...(user?.role === 'administrator' ? [
            { to: "/Analytics", label: t("NavBar.Analytics_Button") },
            { to: "/user_management", label: t("NavBar.User_Management_Button") },
            { to: "/events", label: t("NavBar.Events_Button") }
        ] : [{ to: "/user-events", label: t("NavBar.Events_Button") }]),        
        { to: "/shabbat", label: t("NavBar.Shabbat_Button") },
        { to: "/mealTrain", label: t("NavBar.Meals_Button") }
    ];

    return (
        <>
            <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-black via-gray-900 to-black shadow-2xl border-b border-gray-800 py-4">
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold text-white pb-4">{t('title')}</h1>
                </div>
                
                {/* תמונת פרופיל — בצד שמאל עליון (רק דסקטופ) */}
                {seeProfile && (
                    <div className="hidden md:block absolute top-4 start-6 z-20">
                        <button
                            data-tooltip-id="profile-tooltip"
                            data-tooltip-content="Go to Profile"
                            onClick={() => setIsProfileOpen(true)}
                            className="group relative focus:outline-none transform transition-all duration-300 hover:scale-110"
                        >
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-green-400 shadow-lg shadow-green-400/50 group-hover:shadow-green-400/80 transition-all duration-300"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-400/50 group-hover:shadow-green-400/80 transition-all duration-300">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        className="w-7 h-7 text-white"
                                    >
                                        <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5Zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5Z" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                    </div>
                )}
                
                {/* בורר שפה — בצד ימין עליון (רק דסקטופ) */}
                {seeProfile && (
                    <div className="hidden md:block absolute top-4 end-6 z-20">
                        <LanguageSwitcher />
                    </div>
                )}
                
                {/* סרגל הניווט המרכזי (דסקטופ) */}
                <div className="hidden md:flex justify-center w-full px-6">
                    {seeProfile && (
                        <nav className="flex gap-2 md:gap-3">
                            {navLinks.map((link, index) => (
                                <StyledLink key={index} to={link.to}>
                                    {link.label}
                                </StyledLink>
                            ))}
                        </nav>
                    )}
                </div>

                {/* שורת ניווט מובייל - פרופיל, תפריט, שפות */}
                {seeProfile && (
                    <div className="md:hidden flex items-center justify-between px-6">
                        {/* תמונת פרופיל - מובייל */}
                        <button
                            data-tooltip-id="profile-tooltip"
                            data-tooltip-content="Go to Profile"
                            onClick={() => setIsProfileOpen(true)}
                            className="group relative focus:outline-none transform transition-all duration-300 hover:scale-110"
                        >
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full object-cover border-2 border-green-400 shadow-lg shadow-green-400/50 group-hover:shadow-green-400/80 transition-all duration-300"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-400/50 group-hover:shadow-green-400/80 transition-all duration-300">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        className="w-5 h-5 text-white"
                                    >
                                        <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5Zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5Z" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>

                        {/* כפתור החלפת שפה - במרכז */}
                        <MobileLanguageToggle />

                        {/* כפתור המבורגר - בצד */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="relative group p-2 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700/60 hover:border-gray-500/80 shadow-md shadow-gray-800/30 hover:shadow-gray-600/50 transform transition-all duration-300 hover:scale-105"
                            aria-label="Toggle navigation menu"
                        >
                            <div className="w-6 h-6 flex flex-col justify-center items-center">
                                <span className={`block w-5 h-0.5 bg-white transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'}`}></span>
                                <span className={`block w-5 h-0.5 bg-white transform transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                                <span className={`block w-5 h-0.5 bg-white transform transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`}></span>
                            </div>
                        </button>
                    </div>
                )}

                {/* תפריט מובייל נפתח */}
                {seeProfile && (
                    <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-gray-700/50">
                            <nav className="px-4 py-3 space-y-2">
                                {navLinks.map((link, index) => (
                                    <MobileNavLink 
                                        key={index} 
                                        to={link.to} 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        delay={index * 50}
                                        isVisible={isMobileMenuOpen}
                                    >
                                        {link.label}
                                    </MobileNavLink>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}
            </header>

            <main>
                {/* פרופיל צידי */}
                {isProfileOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        width: 'min(400px, 90vw)',
                        height: '100%',
                        backgroundColor: 'white',
                        boxShadow: '-2px 0 5px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                        overflowY: 'auto',
                        transition: 'transform 0.3s ease-in-out'
                    }}>
                        <button
                            onClick={() => setIsProfileOpen(false)}
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                fontSize: '1.5em',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>
                        <Profile embedded={true} onImageChange={setProfileImage} />
                    </div>
                )}

                {/* overlay למובייל מנו */}
                {isMobileMenuOpen && (
                    <div 
                        className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </main>
        </>
    );
}

const StyledLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
        to={to}
        className="
            relative px-4 py-2 rounded-lg font-medium text-white text-sm md:text-base
            bg-gradient-to-r from-gray-800 to-gray-900
            border border-gray-700/60 hover:border-gray-500/80
            shadow-md shadow-gray-800/30 hover:shadow-gray-600/50
            transform transition-all duration-300 ease-out
            hover:scale-105 hover:-translate-y-1
            active:scale-95
            overflow-hidden
            group
            min-w-[100px]
            no-underline
            block
            text-center
        "
        onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
        }}
    >
        <span className="relative z-10">{children}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
    </Link>
);

const MobileNavLink = ({ 
    to, 
    children, 
    onClick, 
    delay = 0, 
    isVisible 
}: { 
    to: string; 
    children: React.ReactNode; 
    onClick: () => void;
    delay?: number;
    isVisible: boolean;
}) => (
    <Link
        to={to}
        onClick={onClick}
        className={`
            block w-full px-4 py-3 rounded-lg font-medium text-white text-base
            bg-gradient-to-r from-gray-800/80 to-gray-900/80
            border border-gray-700/40 hover:border-gray-500/60
            shadow-md shadow-gray-800/20 hover:shadow-gray-600/40
            transform transition-all duration-300 ease-out
            hover:scale-[1.02] hover:bg-gradient-to-r hover:from-gray-700/80 hover:to-gray-800/80
            active:scale-[0.98]
            no-underline
            backdrop-blur-sm
            ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
        `}
        style={{ 
            transitionDelay: isVisible ? `${delay}ms` : '0ms'
        }}
    >
        <span className="flex items-center justify-between">
            {children}
            <svg 
                className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </span>
    </Link>
);

export default NavBar;
