// src/hooks/useUserTodos.js
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; // <-- Chemin corrigé
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, doc } from 'firebase/firestore';

export const useUserTodos = (userUid, isGuestMode, onUpdateGuestData, initialGuestTasks) => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isGuestMode) {
            setTodos(initialGuestTasks);
            setLoading(false);
            return;
        } else if (userUid) {
            const todosCollectionRef = collection(db, 'users', userUid, 'todos');
            const q = query(
                todosCollectionRef,
                orderBy('createdAt', 'desc')
            );

            setLoading(true);
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedTodos = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTodos(fetchedTodos);
                setLoading(false);
                console.log("Todos fetched for user:", userUid, fetchedTodos);
            }, (error) => {
                console.error("Error fetching todos in useUserTodos:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        } else {
            setTodos([]);
            setLoading(false);
        }
    }, [userUid, isGuestMode, initialGuestTasks]);

    const addTodo = async (taskData) => { // MODIFIÉ : Accepte un seul objet
        if (!userUid && !isGuestMode) return;
        
        // On prépare la nouvelle tâche avec des valeurs par défaut robustes
        const newTodo = {
            title: taskData.title,
            completed: false,
            createdAt: serverTimestamp(),
            ownerUid: userUid,
            priority: taskData.priority || 'Normale', // Valeur par défaut
            deadline: taskData.deadline || null,      // Valeur par défaut
        };

        if (isGuestMode) {
            onUpdateGuestData(prev => ({
                ...prev,
                tasks: [...(prev.tasks || []), { ...newTodo, id: `guest-task-${Date.now()}`, createdAt: new Date().toISOString() }]
            }));
        } else {
            try {
                await addDoc(collection(db, 'users', userUid, 'todos'), newTodo);
                console.log("Added todo to Firebase for user:", userUid);
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
                    const todoRef = doc(db, 'users', userUid, 'todos', id);
                    await updateDoc(todoRef, {
                        completed: !currentTodo.completed
                    });
                    console.log("Toggled todo in Firebase for user:", userUid, id);
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
                await deleteDoc(doc(db, 'users', userUid, 'todos', id));
                console.log("Deleted todo from Firebase for user:", userUid);
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
                const todoRef = doc(db, 'users', userUid, 'todos', updatedTodo.id);
                await updateDoc(todoRef, {
                    title: updatedTodo.title,
                    priority: updatedTodo.priority,
                    deadline: updatedTodo.deadline,
                });
                console.log("Edited todo in Firebase for user:", userUid, updatedTodo.id);
            } catch (e) {
                console.error("Error editing todo:", e);
            }
        }
    };

    return { todos, loading, addTodo, editTodo, deleteTodo, toggleTodo };
};