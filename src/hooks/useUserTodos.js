// hooks/useUserTodos.js
import React, { useState, useEffect } from 'react'; // AJOUTÉ: Imports useState et useEffect
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, doc } from 'firebase/firestore';

export const useUserTodos = (userUid, isGuestMode, onUpdateGuestData, initialGuestTasks) => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null); // Uncomment if you want to track errors here

    useEffect(() => {
        // console.log("useUserTodos useEffect triggered. userUid:", userUid, "isGuestMode:", isGuestMode); // DEBUG

        if (isGuestMode) {
            // Logic for guest mode (using localData from dashboard.js)
            setTodos(initialGuestTasks);
            setLoading(false);
            // console.log("useUserTodos: Guest mode - using initialGuestTasks:", initialGuestTasks); // DEBUG
            return; // Exit if in guest mode
        } else if (userUid) {
            // CRITICAL: Target the subcollection /users/{userUid}/todos
            const todosCollectionRef = collection(db, 'users', userUid, 'todos');
            const q = query(
                todosCollectionRef,
                // No need for where('ownerUid', '==', userUid) in query if path already filters it by userId,
                // but it's good practice to keep it for robustness if you might accidentally
                // write to the wrong path without ownerUid set. Firebase rules handle this more robustly.
                // For now, let's keep it simple with just orderBy.
                orderBy('createdAt', 'desc')
            );

            setLoading(true); // Ensure loading is true before fetch
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedTodos = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTodos(fetchedTodos);
                setLoading(false);
                // setError(null); // Clear any previous errors
                console.log("Todos fetched for user:", userUid, fetchedTodos); // DEBUG
            }, (error) => {
                console.error("Error fetching todos in useUserTodos:", error);
                setLoading(false);
                // setError(error); // Set error state
            });

            return () => unsubscribe();
        } else {
            setTodos([]);
            setLoading(false);
            // console.log("useUserTodos: No user UID, todos reset."); // DEBUG
        }
    }, [userUid, isGuestMode, initialGuestTasks]); // Dépendances ajustées : onUpdateGuestData n'est pas une dépendance directe de ce useEffect car il n'est pas appelé ici.

    const addTodo = async (title, priority, deadline) => {
        if (!userUid && !isGuestMode) return;
        if (isGuestMode) {
            onUpdateGuestData(prev => ({
                ...prev,
                tasks: [...(prev.tasks || []), {
                    id: `guest-task-${Date.now()}`,
                    title,
                    priority,
                    deadline,
                    ownerUid: 'guest_noca_flow', // Or a guest-specific UID. IMPORTANT: ensure this matches your guest mode logic's UID if different
                    completed: false,
                    createdAt: new Date().toISOString()
                }]
            }));
        } else {
            try {
                // CRITICAL: Target the subcollection /users/{userUid}/todos
                await addDoc(collection(db, 'users', userUid, 'todos'), {
                    title,
                    priority,
                    deadline,
                    ownerUid: userUid, // Ensure ownerUid is explicitly set for security rules
                    completed: false,
                    createdAt: serverTimestamp()
                });
                console.log("Added todo to Firebase for user:", userUid); // DEBUG
            } catch (e) {
                console.error("Error adding todo:", e);
            }
        }
    };

    const toggleTodo = async (id) => {
        if (!userUid && !isGuestMode) return;
        if (isGuestMode) {
            onUpdateGuestData(prev => ({
                ...prev,
                tasks: (prev.tasks || []).map(task =>
                    task.id === id ? { ...task, completed: !task.completed } : task
                )
            }));
        } else {
            try {
                const currentTodo = todos.find(todo => todo.id === id);
                if (currentTodo) {
                    // CRITICAL: Target the subcollection /users/{userUid}/todos
                    const todoRef = doc(db, 'users', userUid, 'todos', id);
                    await updateDoc(todoRef, {
                        completed: !currentTodo.completed
                    });
                    console.log("Toggled todo in Firebase for user:", userUid, id); // DEBUG
                }
            } catch (e) {
                console.error("Error toggling todo:", e);
            }
        }
    };

    const deleteTodo = async (id) => {
        if (!userUid && !isGuestMode) return;
        if (isGuestMode) {
            onUpdateGuestData(prev => ({
                ...prev,
                tasks: (prev.tasks || []).filter(task => task.id !== id)
            }));
        } else {
            try {
                // CRITICAL: Target the subcollection /users/{userUid}/todos
                await deleteDoc(doc(db, 'users', userUid, 'todos', id));
                console.log("Deleted todo from Firebase for user:", userUid, id); // DEBUG
            } catch (e) {
                console.error("Error deleting todo:", e);
            }
        }
    };

    const editTodo = async (updatedTodo) => {
        if (!userUid && !isGuestMode) return;
        if (isGuestMode) {
            onUpdateGuestData(prev => ({
                ...prev,
                tasks: (prev.tasks || []).map(task =>
                    task.id === updatedTodo.id ? updatedTodo : task
                )
            }));
        } else {
            try {
                // CRITICAL: Target the subcollection /users/{userUid}/todos
                const todoRef = doc(db, 'users', userUid, 'todos', updatedTodo.id);
                await updateDoc(todoRef, {
                    title: updatedTodo.title,
                    priority: updatedTodo.priority,
                    deadline: updatedTodo.deadline,
                });
                console.log("Edited todo in Firebase for user:", userUid, updatedTodo.id); // DEBUG
            } catch (e) {
                console.error("Error editing todo:", e);
            }
        }
    };

    return { todos, loading, addTodo, editTodo, deleteTodo, toggleTodo };
};