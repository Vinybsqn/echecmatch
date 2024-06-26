import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { FiEdit2 } from "react-icons/fi";

const ProfilPage = () => {
  const [userData, setUserData] = useState({});
  const [editField, setEditField] = useState("");
  const [games, setGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "utilisateurs", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserData(userData);
          setSelectedGames(userData.games || []);
        } else {
          console.log("Aucune donnée utilisateur trouvée!");
        }
      } else {
        navigate("/connexion");
      }
    });

    const fetchGames = async () => {
      const gamesSnapshot = await getDocs(collection(db, 'games'));
      const gamesList = gamesSnapshot.docs.map(doc => doc.data().name);
      setGames(gamesList);
    };

    fetchGames();
    return () => unsubscribe();
  }, [auth, db, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('Déconnexion réussie');
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  const updateUserField = async (fieldName, value) => {
    try {
      const userRef = doc(db, "utilisateurs", auth.currentUser.uid);
      await updateDoc(userRef, { [fieldName]: value });
      setEditField("");
      setUserData({ ...userData, [fieldName]: value });
    } catch (error) {
      console.error("Erreur lors de la mise à jour", error);
    }
  };

  const handleGameSelection = (game) => {
    if (selectedGames.includes(game)) {
      setSelectedGames(selectedGames.filter(selectedGame => selectedGame !== game));
    } else if (selectedGames.length < 4) {
      setSelectedGames([...selectedGames, game]);
    }
  };

  const saveGames = async () => {
    try {
      const userRef = doc(db, "utilisateurs", auth.currentUser.uid);
      await updateDoc(userRef, { games: selectedGames });
      setUserData({ ...userData, games: selectedGames });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des jeux", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-500 via-purple-500 to-gray-500 py-8">
      <div className="p-10 backdrop-blur-lg bg-white/30 rounded-xl shadow-xl text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Profil de {userData.username}</h1>
        <div className="flex items-center justify-center space-x-2">
          <img src={userData.avatar} alt="Avatar" className="rounded-full w-24 h-24 object-cover" />
        </div>
        <div className="flex items-center justify-center space-x-2">
          {editField === "email" ? (
            <input
              className="text-center text-black"
              type="text"
              defaultValue={userData.email}
              onBlur={(e) => updateUserField("email", e.target.value)}
              autoFocus
            />
          ) : (
            <span className="text-white">{`E-Mail: ${userData.email}`}</span>
          )}
          <FiEdit2 onClick={() => setEditField("email")} className="cursor-pointer text-xl text-white hover:text-gray-300" />
        </div>
        <div className="flex items-center justify-center space-x-2">
          {editField === "lastName" ? (
            <input
              className="text-center text-black"
              type="text"
              defaultValue={userData.lastName}
              onBlur={(e) => updateUserField("lastName", e.target.value)}
              autoFocus
            />
          ) : (
            <span className="text-white">{`Nom: ${userData.lastName}`}</span>
          )}
          <FiEdit2 onClick={() => setEditField("lastName")} className="cursor-pointer text-xl text-white hover:text-gray-300" />
        </div>
        <div className="flex items-center justify-center space-x-2">
          {editField === "firstName" ? (
            <input
              className="text-center text-black"
              type="text"
              defaultValue={userData.firstName}
              onBlur={(e) => updateUserField("firstName", e.target.value)}
              autoFocus
            />
          ) : (
            <span className="text-white">{`Prénom: ${userData.firstName}`}</span>
          )}
          <FiEdit2 onClick={() => setEditField("firstName")} className="cursor-pointer text-xl text-white hover:text-gray-300" />
        </div>
        <div className="flex items-center justify-center space-x-2">
          {editField === "genre" ? (
            <input
              className="text-center text-black"
              type="text"
              defaultValue={userData.genre}
              onBlur={(e) => updateUserField("genre", e.target.value)}
              autoFocus
            />
          ) : (
            <span className="text-white">{`Genre: ${userData.genre}`}</span>
          )}
          <FiEdit2 onClick={() => setEditField("genre")} className="cursor-pointer text-xl text-white hover:text-gray-300" />
        </div>
        <div className="flex items-center justify-center space-x-2">
          {editField === "dob" ? (
            <input
              className="text-center text-black"
              type="text"
              defaultValue={userData.dob}
              onBlur={(e) => updateUserField("dob", e.target.value)}
              autoFocus
            />
          ) : (
            <span className="text-white">{`Date de naissance: ${userData.dob}`}</span>
          )}
          <FiEdit2 onClick={() => setEditField("dob")} className="cursor-pointer text-xl text-white hover:text-gray-300" />
        </div>
        <div className="games-selection">
          <p className="text-white">Sélectionnez jusqu'à 4 jeux : *</p>
          <div className="grid grid-cols-2 gap-4 py-2">
            {games.map((game, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-transform transform hover:scale-105 ${
                  selectedGames.includes(game) ? 'bg-purple-500 text-white border-transparent' : 'backdrop-filter backdrop-blur-lg bg-white/30 shadow-lg border-white text-white'
                }`}
                onClick={() => handleGameSelection(game)}
              >
                <span className="text-xl font-semibold">{game}</span>
              </div>
            ))}
          </div>
          <button onClick={saveGames} className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Enregistrer les jeux</button>
        </div>
        <button onClick={handleSignOut} className="mt-4 px-4 py-2 bg-violet-500 text-white font-semibold rounded hover:bg-violet-600 transition-colors">
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default ProfilPage;