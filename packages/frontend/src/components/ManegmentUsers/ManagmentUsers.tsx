import React, { useEffect, useState } from "react";
import { fetchAllUsers, updateUserRole } from "../../services/usersService";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useTranslation } from "react-i18next";

const MySwal = withReactContent(Swal);

type User = {
    id: string;
    email: string;
    role: string;
    name: string;
};

const getCleanRole = (role: string): "user" | "administrator" | "אחר" => {
    const r = role.toLowerCase();
    if (r.includes("administrator")) return "administrator";
    if (r.includes("user")) return "user";
    return "אחר";
};

const getRoleBadgeStyle = (role: string) => {
    const clean = getCleanRole(role);
    switch (clean) {
        case "administrator":
            return "bg-green-200 text-green-900";
        case "user":
            return "bg-gray-100 text-green-800";
        default:
            return "bg-gray-500 text-gray-700";
    }
};

const UsersList = () => {
    // const { t }: { t: (key: string) => string } = useTranslation();
    const { i18n, t }: { i18n: any; t: (key: string) => string } = useTranslation();
    const [languageKey, setLanguageKey] = useState(0);

    useEffect(() => {
        const handleLanguageChanged = () => {
            setLanguageKey(prev => prev + 1); // "מרענן" את הקומפוננטה
        };

        i18n.on("languageChanged", handleLanguageChanged);

        return () => {
            i18n.off("languageChanged", handleLanguageChanged);
        };
    }, [i18n]);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchName, setSearchName] = useState("");
    const [searchEmail, setSearchEmail] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await fetchAllUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (err) {
            console.error(t('MangmentUser.Error loading users'), err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const filtered = users.filter((user) =>
            user.name.toLowerCase().includes(searchName.toLowerCase()) &&
            user.email.toLowerCase().includes(searchEmail.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchName, searchEmail, users]);

    const handleChangeRole = async (user: User) => {
        const newRole = user.role.includes("administrator") ? "user" : "administrator";

        const result = await MySwal.fire({
            title: t('MangmentUser.Should I update a role?'),
            text: `${t('MangmentUser.change the role of')}${user.email} ${t('MangmentUser.to')}${newRole}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: t('MangmentUser.Yes, update'),
            cancelButtonText: t('MangmentUser.Cancellation'),
            confirmButtonColor: "#4caf50",
            cancelButtonColor: "#ccc",
            background: "#fff",
            color: "#2e7d32",
        });

        if (result.isConfirmed) {
            try {
                await updateUserRole(user.id, newRole);
                await MySwal.fire({
                    icon: "success",
                    title: t('MangmentUser.The role has been updated!'),
                    text: `${user.email} ${t('MangmentUser.now he is')}${newRole}.`,
                    background: "#fff",
                    color: "#2e7d32",
                    confirmButtonColor: "#4caf50",
                });
                fetchUsers(); // רענון
            } catch (error) {
                MySwal.fire({
                    icon: "error",
                    title: t('MangmentUser.error!'),
                    text: t('MangmentUser.Something went wrong updating the role'),
                    background: "#fff",
                    color: "#c62828",
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500 border-opacity-50"></div>
            </div>
        );
    }

    return (
        <div key={languageKey}>
            <div className="min-h-screen p-6 ">
                <h1 className="text-3xl font-bold mb-6 text-center text-green-800"> {t('MangmentUser.User list')}</h1>

                {/* שדות חיפוש */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 max-w-4xl mx-auto">
                    <input
                        type="text"
                        placeholder={t('MangmentUser.Search by name')}
                        className="w-full sm:w-1/2 px-4 py-2 border border-green-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder={t('MangmentUser.Search by email')}
                        className="w-full sm:w-1/2 px-4 py-2 border border-green-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                    />
                </div>

                {/* רשימת משתמשים */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="bg-white border border-green-200 shadow-lg rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                        >
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-green-900">{user.name}</h2>
                                <p className="text-sm text-green-700">{user.email}</p>
                                <span
                                    className={`inline-block px-3 py-1 text-sm mt-3 rounded-full ${getRoleBadgeStyle(
                                        user.role
                                    )}`}
                                >
                                    {getCleanRole(user.role)}
                                </span>
                            </div>
                            <button
                                onClick={() => handleChangeRole(user)}
                                className="mt-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors"
                            >
                                {t('MangmentUser.Update role')}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UsersList;
