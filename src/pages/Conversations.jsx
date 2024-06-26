import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Link } from 'react-router-dom';
import app from './../../firebase-config';

const Conversations = () => {
    const [conversations, setConversations] = useState([]);
    const [userDetails, setUserDetails] = useState({});
    const db = getFirestore(app);
    const auth = getAuth(app);
    const currentUserID = auth.currentUser?.uid;
    const defaultImageUrl = '/image.png';

    useEffect(() => {
        if (!currentUserID) return;

        const fetchConversations = async () => {
            const q = query(collection(db, "conversations"), where("participants", "array-contains", currentUserID));
            const querySnapshot = await getDocs(q);
            let newConversations = [];
            let userIds = new Set();

            querySnapshot.forEach(doc => {
                const data = doc.data();
                const otherUserID = data.participants.find(p => p !== currentUserID);
                if (!userIds.has(otherUserID)) {
                    userIds.add(otherUserID);
                    newConversations.push({ id: doc.id, otherUserID, ...data });
                }
            });

            setConversations(newConversations);

            // Fetch user details for each participant
            userIds.forEach(async (id) => {
                if (!userDetails[id]) {  // Check if we already have the details to avoid refetching
                    const userDocRef = doc(db, "utilisateurs", id);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const avatar = userData.avatar || defaultImageUrl;
                        setUserDetails(prev => ({ ...prev, [id]: { ...userData, avatar } }));
                    }
                }
            });
        };

        fetchConversations();
    }, [currentUserID, db]);

    return (
        <div className="h-screen p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-gray-500">
            <h1 className="text-2xl font-bold text-center mb-6">Conversations</h1>
            <div className="mx-auto max-w-md rounded shadow-lg p-4 bg-white/10 backdrop-blur-md overflow-hidden">
                <ul>
                    {conversations.map(conv => (
                        <li key={conv.id} className="border-b border-white/20 last:border-b-0">
                            <Link
                                to={`/chat/${conv.id}`}
                                className="block p-3 hover:bg-white/20 rounded transition-colors flex items-center"
                            >
                                <img
                                    src={userDetails[conv.otherUserID]?.avatar || defaultImageUrl}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full mr-3"
                                />
                                <span>Conversation avec
                                    <span className="font-semibold">
                                        {' ' + (userDetails[conv.otherUserID]?.username || userDetails[conv.otherUserID]?.firstName || 'User')}
                                    </span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Conversations;