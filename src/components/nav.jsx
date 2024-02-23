// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import '../styles/nav.css';


const Nav = () => {
    const [isUserSignedIn, setIsUserSignedIn] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsUserSignedIn(!!user);
        });

        return unsubscribe; // S'assurer de se désabonner lors du démontage du composant
    }, [auth]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            console.log('Déconnexion réussie');
            navigate('/');
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
        }
    };

    return (
        <nav className="navbar">
            <ul className="nav-links">
                <li>
                    <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/home">Accueil</NavLink>
                </li>
                <li>
                    <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/game">Echec&Match</NavLink>
                </li>
                <li>
                    <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/about">A propos de nous</NavLink>
                </li>
            </ul>
            {isUserSignedIn && (
                <button onClick={handleSignOut} className="logout-button">
                    Déconnexion
                </button>
            )}
        </nav>
    );
};

export default Nav;
