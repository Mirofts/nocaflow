// src/lib/mockData.js

// Fonction utilitaire pour générer des dates réalistes (pour les démos)
const getDate = (daysAhead = 0, hoursAhead = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(date.getHours() + hoursAhead);
  date.setMinutes(Math.floor(date.getMinutes() / 5) * 5); // Arrondi à la 5min près
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.toISOString();
};

export const initialMockData = {
    user: {
        uid: 'guest_noca_flow',
        displayName: 'Visiteur Curieux',
        // Assurez-vous que cette image existe et que son nom est propre (pas de caractères spéciaux)
        photoURL: '/images/avatars/yves.jpg', // Par exemple, si 'yves.jpg' est valide et existe.
    },
    tasks: [
        { id: '1', title: 'Préparer la démo NocaFLOW pour le client Alpha', completed: false, priority: 'urgent', deadline: getDate(2, 10), assignedTo: 'Alice Dubois', ownerUid: 'guest_noca_flow' },
        { id: '2', title: 'Finaliser le rapport de performance Q2', completed: false, priority: 'normal', deadline: getDate(5, 14), assignedTo: 'Bob Martin', ownerUid: 'guest_noca_flow' },
        { id: '3', title: 'Envoyer les relances factures impayées (Projet Z)', completed: true, priority: 'urgent', deadline: getDate(-10, 9), assignedTo: 'Diana Prince', ownerUid: 'guest_noca_flow' },
        { id: '4', title: "Organiser l'atelier de brainstorming", completed: false, priority: 'cold', deadline: getDate(7, 11), assignedTo: 'Charlie Dupont', ownerUid: 'guest_noca_flow' },
        { id: '5', title: 'Mettre à jour la documentation API V2', completed: false, priority: 'urgent', deadline: getDate(3, 16), assignedTo: 'Ethan Hunt', ownerUid: 'guest_noca_flow' },
        { id: '6', title: 'Rechercher de nouvelles tendances UX pour 2026', completed: false, priority: 'normal', deadline: getDate(15, 10), assignedTo: 'Carla Lopez', ownerUid: 'guest_noca_flow' },
        { id: '7', title: 'Acheter du café et des snacks pour le bureau', completed: false, priority: 'cold', deadline: getDate(1, 12), assignedTo: 'Visiteur Curieux', ownerUid: 'guest_noca_flow' },
        { id: '8', title: 'Répondre aux 15 emails non lus de la veille', completed: false, priority: 'urgent', deadline: getDate(0, 3), assignedTo: 'Alice Dubois', ownerUid: 'guest_noca_flow' },
        { id: '9', title: 'Créer un GIF rigolo pour l\'annonce interne', completed: false, priority: 'normal', deadline: getDate(8, 15), assignedTo: 'David Chen', ownerUid: 'guest_noca_flow' },
    ],
    notes: `## Bienvenue sur votre bloc-notes NocaFLOW ! 🚀\n\nIci, vous pouvez noter toutes vos idées, vos rappels rapides, ou même un journal de bord. C'est votre espace personnel pour ne rien oublier.\n\n**Quelques idées de choses à noter :**\n* Idées pour le prochain brainstorm client.\n* Codes d'accès temporaires (à supprimer après usage !)\n* Liste de courses pour la pause déjeuner.\n* Le nom de ce collègue qui raconte de super blagues.\n\nCommencez à taper pour sauvegarder automatiquement vos pensées.\n\nBonne productivité et amusez-vous bien ! ✨`,
    meetings: [
        { id: 'm1', title: 'Réunion de Sprint - Projet Alpha', dateTime: getDate(0, 2), attendees: ['Alice Dubois', 'Bob Martin', 'Visiteur Curieux'], type: 'staff', createdAt: getDate(-1) },
        { id: 'm2', title: 'Point quotidien Design UX/UI', dateTime: getDate(0, -1), attendees: ['Carla Lopez', 'Visiteur Curieux'], type: 'staff', createdAt: getDate(-2) },
        { id: 'm3', title: 'Appel client - Négociation Contrat Beta', dateTime: getDate(1, 10), attendees: ['Diana Prince', 'Visiteur Curieux', 'Client B'], type: 'client', createdAt: getDate(-1) },
        { id: 'm4', title: 'Brainstorming - Campagne Marketing Hiver', dateTime: getDate(3, 14), attendees: ['David Chen', 'Ethan Hunt', 'Alice Dubois', 'Visiteur Curieux'], type: 'staff', createdAt: getDate(-2) },
        { id: 'm5', title: 'Déjeuner d\'équipe virtuel', dateTime: getDate(5, 12), attendees: ['Alice Dubois', 'Bob Martin', 'Carla Lopez', 'David Chen', 'Ethan Hunt', 'Visiteur Curieux'], type: 'staff', createdAt: getDate(-3) },
        { id: 'm6', title: 'Présentation des résultats Q1 - Interne', dateTime: getDate(-7, 10), attendees: ['Alice Dubois', 'Bob Martin', 'Visiteur Curieux'], type: 'staff', createdAt: getDate(-8) },
        { id: 'm7', title: 'Mini-brief rapide NocaFLOW', dateTime: getDate(0, 0.1), attendees: ['Visiteur Curieux'], type: 'staff', createdAt: getDate(-0.5) }
    ],
    projects: [
        {
            id: 'p1',
            name: 'Refonte Site NocaFLOW V3',
            client: 'Interne',
            progress: 85,
            deadline: getDate(3, 17),
            staff: ['/images/avatars/avatar-1.jpg', '/images/avatars/avatar-2.jpg', '/images/avatars/yves.jpg', '/images/avatars/avatar-5.jpg'],
            paidAmount: '25 000 €',
            nextPayment: '5 000 € (01/07)',
            totalAmount: '30 000 €',
            createdAt: getDate(-30),
            googleDriveLink: 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqrStUvWxyz012345',
            description: "Refonte complète du site marketing pour améliorer le taux de conversion et l'expérience utilisateur. Inclut une nouvelle charte graphique et une optimisation SEO avancée."
        },
        {
            id: 'p_alert',
            name: 'Audit Sécurité Priorité',
            client: 'CyberGuard Inc.',
            progress: 20,
            deadline: getDate(1, 4),
            staff: ['/images/avatars/avatar-8.jpg'],
            paidAmount: '0 €',
            nextPayment: 'N/A',
            totalAmount: '10 000 €',
            createdAt: getDate(-7),
            googleDriveLink: null,
            description: "Audit de sécurité urgent pour le système critique."
        },
        {
            id: 'p2',
            name: 'Application Mobile X - MVP',
            client: 'Tech Solutions Inc.',
            progress: 40,
            deadline: getDate(25, 18),
            staff: ['/images/avatars/avatar-3.jpg', '/images/avatars/avatar-4.jpg', '/images/avatars/avatar-6.jpg'],
            paidAmount: '15 000 €',
            nextPayment: '10 000 € (15/07)',
            totalAmount: '40 000 €',
            createdAt: getDate(-60),
            googleDriveLink: null,
            description: "Développement du produit minimum viable (MVP) d'une application mobile innovante pour la gestion des stocks de produits technologiques."
        },
        {
            id: 'p3',
            name: 'Campagne Marketing "Été Éclatant"',
            client: 'Summer Wear Co.',
            progress: 98,
            deadline: getDate(-2, 17),
            staff: ['/images/avatars/avatar-5.jpg', '/images/avatars/avatar-7.jpg', '/images/avatars/avatar-9.jpg'],
            paidAmount: '12 000 €',
            nextPayment: '0 € (Terminé)',
            totalAmount: '12 000 €',
            createdAt: getDate(-45),
            googleDriveLink: 'https://drive.google.com/drive/folders/987654321zyxwvuTsrQponMLKjIhGfedcba',
            description: "Conception et déploiement d'une campagne marketing estivale multi-canal (réseaux sociaux, email, display) pour augmenter les ventes de vêtements d'été."
        },
        {
            id: 'p4',
            name: 'Audit Sécurité Systèmes',
            client: 'Global CyberSafe',
            progress: 10,
            deadline: getDate(40, 10),
            staff: ['/images/avatars/avatar-8.jpg', '/images/avatars/avatar-10.jpg'],
            paidAmount: '0 €',
            nextPayment: '7 500 € (À l\'acceptation)',
            totalAmount: '15 000 €',
            createdAt: getDate(-5),
            googleDriveLink: null,
            description: "Audit complet de la sécurité des infrastructures systèmes et recommandations pour renforcer la protection contre les cybermenaces."
        },
         {
            id: 'p5',
            name: 'Optimisation SEO Blog Cuisine',
            client: 'Gourmet Guides',
            progress: 60,
            deadline: getDate(15, 12),
            staff: ['/images/avatars/avatar-11.jpg', '/images/avatars/avatar-12.jpg'],
            paidAmount: '2 000 €',
            nextPayment: '2 000 € (Fin de mois)',
            totalAmount: '5 000 €',
            createdAt: getDate(-20),
            googleDriveLink: 'https://drive.google.com/drive/folders/abcdefg123456789',
            description: "Amélioration du référencement naturel pour le blog de recettes. Analyse de mots-clés, optimisation du contenu et link-building."
        },
    ],
    invoices: [
        { id: 'inv1', title: 'Facture Projet Alpha - Phase 1', client: 'Tech Solutions Inc.', amount: '5 000.00 €', date: '15/05/2025', status: 'Paid' },
        { id: 'inv2', title: 'Facture Site NocaFLOW - Acompte', client: 'Interne', amount: '10 000.00 €', date: '01/06/2025', status: 'Paid' },
        { id: 'inv3', title: 'Facture Campagne Hiver - Création', client: 'Winter Gear Co.', amount: '7 000.00 €', date: '05/06/2025', status: 'Paid' },
        { id: 'inv4', title: 'Facture Projet Alpha - Phase 2', client: 'Tech Solutions Inc.', amount: '5 000.00 €', date: '20/06/2025', status: 'Pending' },
        { id: 'inv5', title: 'Facture Audit Sécurité - Acompte', client: 'Global CyberSafe', amount: '7 500.00 €', date: '01/07/2025', status: 'Pending' },
        { id: 'inv6', title: 'Facture Optimisation SEO - Phase Initiale', client: 'Gourmet Guides', amount: '2 000.00 €', date: '25/06/2025', status: 'Paid' },
        { id: 'inv7', title: 'Facture Maintenance Annuelle', client: 'Old Client Corp.', amount: '1 200.00 €', date: '10/07/2025', status: 'Pending' },
    ],
    messages: [
        { id: 'msg1', sender: 'Alice Dubois', avatar: '/images/avatars/avatar-1.jpg', text: 'Salut l\'équipe ! Des nouvelles sur la refonte du site NocaFLOW ?', timestamp: '10:00', unread: false },
        { id: 'msg2', sender: 'Visiteur Curieux', avatar: '/images/avatars/yves.jpg', text: 'Oui, on a terminé la phase de conception UX hier soir. Prêt pour la revue !', timestamp: '10:05', unread: false, recipient: 'Alice Dubois' },
        { id: 'msg3', sender: 'Alice Dubois', avatar: '/images/avatars/avatar-1.jpg', text: 'Super nouvelle ! On se voit à 11h pour discuter des prochaines étapes. N\'oublie pas les maquettes 😉', timestamp: '10:15', unread: true },
        { id: 'msg4', sender: 'Bob Martin', avatar: '/images/avatars/avatar-3.jpg', text: 'Besoin d’aide sur le rapport de performance. Tu es dispo ?', timestamp: 'Hier 14:30', unread: false },
        { id: 'msg5', sender: 'Visiteur Curieux', avatar: '/images/avatars/yves.jpg', text: 'Je suis un peu pris, mais je peux regarder ça en fin de journée.', timestamp: 'Hier 14:45', unread: false, recipient: 'Bob Martin' },
        { id: 'msg6', sender: 'Bob Martin', avatar: '/images/avatars/avatar-3.jpg', text: 'Pas de problème, merci !', timestamp: 'Hier 14:50', unread: false },
        { id: 'msg7', sender: 'Charlie Dupont', avatar: '/images/avatars/avatar-2.jpg', text: 'Le rapport annuel est prêt pour relecture.', timestamp: 'Lun. 09:00', unread: false },
        { id: 'msg8', sender: 'Visiteur Curieux', avatar: '/images/avatars/yves.jpg', text: 'Parfait, je vais le relire dans la matinée.', timestamp: 'Lun. 09:10', unread: false, recipient: 'Charlie Dupont' },
        { id: 'msg9', sender: 'Diana Prince', avatar: '/images/avatars/avatar-4.jpg', text: 'Peux-tu m’envoyer les dernières versions des maquettes finales s’il te plaît ?', timestamp: 'Aujourd’hui 09:30', unread: true },
        { id: 'msg10', sender: 'Ethan Hunt', avatar: '/images/avatars/avatar-5.jpg', text: 'N’oublie pas les statistiques de la semaine dernière pour le meeting de 15h ! 📈', timestamp: 'Aujourd’hui 10:01', unread: true },
        { id: 'msg11', sender: 'Carla Lopez', avatar: '/images/avatars/avatar-6.jpg', text: 'J\'ai quelques idées géniales pour l\'UI de la nouvelle app, hâte de vous montrer !', timestamp: 'Aujourd’hui 11:00', unread: false },
        { id: 'msg12', sender: 'Visiteur Curieux', avatar: '/images/avatars/yves.jpg', text: 'Super ! Envoie ça quand tu peux. 👍', timestamp: 'Aujourd’hui 11:05', unread: false, recipient: 'Carla Lopez' },
        { id: 'msg13', sender: 'David Chen', avatar: '/images/avatars/avatar-7.jpg', text: 'Voici les premières ébauches de la campagne "Été Éclatant". Qu\'en penses-tu ?', timestamp: 'Aujourd’hui 12:00', unread: true, type: 'image', fileURL: 'https://picsum.photos/id/237/200/300' },
        { id: 'msg14', sender: 'Visiteur Curieux', avatar: '/images/avatars/yves.jpg', text: 'Wow, ça a l\'air génial ! J\'adore le concept. 🎉', timestamp: 'Aujourd’hui 12:05', unread: false, recipient: 'David Chen' },
    ],
    // Renommé planningTasks en ganttTasks pour être cohérent avec le dashboard.js
    // Mettez à jour vos données réelles pour correspondre à ces chemins si nécessaire.
    planningTasks: [
        { id: 'pt1', person: 'Alice Dubois', title: 'Préparer la démo UX', startDate: getDate(0).split('T')[0], endDate: getDate(5).split('T')[0], completed: false, priority: 'normal', color: 'pink' },
        { id: 'pt2', person: 'Bob Martin', title: 'Développement Backend V1', startDate: getDate(3).split('T')[0], endDate: getDate(10).split('T')[0], completed: false, priority: 'urgent', color: 'red' },
        { id: 'pt3', person: 'Carla Lopez', title: 'Wireframes Mobiles', startDate: getDate(-2).split('T')[0], endDate: getDate(2).split('T')[0], completed: true, priority: 'normal', color: 'green' },
        { id: 'pt4', person: 'David Chen', title: "Planification Campagne A", startDate: getDate(1).split('T')[0], endDate: getDate(7).split('T')[0], completed: false, priority: 'cold', color: 'blue' },
        { id: 'pt5', person: 'Alice Dubois', title: 'Tests Qualité Alpha', startDate: getDate(6).split('T')[0], endDate: getDate(12).split('T')[0], completed: false, priority: 'normal', color: 'pink' },
        { id: 'pt6', person: 'Bob Martin', title: 'Intégration API Tiers', startDate: getDate(11).split('T')[0], endDate: getDate(18).split('T')[0], completed: false, priority: 'urgent', color: 'red' },
        { id: 'pt7', person: 'Sophie Laurent', title: 'Implémentation UI/UX', startDate: getDate(-1).split('T')[0], endDate: getDate(4).split('T')[0], completed: false, priority: 'normal', color: 'violet' },
        { id: 'pt8', person: 'Marc Tremblay', title: 'Migration Serveur Cloud', startDate: getDate(8).split('T')[0], endDate: getDate(14).split('T')[0], completed: false, priority: 'urgent', color: 'cyan' },
        { id: 'pt9', person: 'Ethan Hunt', title: 'Analyse des données client', startDate: getDate(0).split('T')[0], endDate: getDate(3).split('T')[0], completed: false, priority: 'normal', color: 'orange' },
        { id: 'pt10', person: 'Diana Prince', title: 'Stratégie de Contenu Q3', startDate: getDate(5).split('T')[0], endDate: getDate(9).split('T')[0], completed: false, priority: 'cold', color: 'teal' },
    ],
    staffMembers: [
        { id: 's1', name: 'Alice Dubois', role: 'Chef de Projet Senior', email: 'alice.d@example.com', avatar: '/images/avatars/avatar-1.jpg' },
        { id: 's2', name: 'Bob Martin', role: 'Développeur Fullstack', email: 'bob.m@example.com', avatar: '/images/avatars/avatar-3.jpg' },
        { id: 's3', name: 'Carla Lopez', role: 'Designer UX/UI', email: 'carla.l@example.com', avatar: '/images/avatars/avatar-5.jpg' },
        { id: 's4', name: 'David Chen', role: 'Spécialiste Marketing Digital', email: 'david.c@example.com', avatar: '/images/avatars/avatar-7.jpg' },
        { id: 's5', name: 'Ethan Hunt', role: 'Analyste Données', email: 'ethan.h@example.com', avatar: '/images/avatars/avatar-9.jpg' },
        { id: 's6', name: 'Diana Prince', role: 'Consultante Stratégie', email: 'diana.p@example.com', avatar: '/images/avatars/avatar-4.jpg' },
        { id: 's7', name: 'Charlie Dupont', role: 'Responsable Qualité', email: 'charlie.d@example.com', avatar: '/images/avatars/avatar-2.jpg' },
        { id: 's8', name: 'Sophie Laurent', role: 'Développeur Frontend', email: 'sophie.l@example.com', avatar: '/images/avatars/avatar-11.jpg' },
        { id: 's9', name: 'Marc Tremblay', role: 'Architecte Cloud', email: 'marc.t@example.com', avatar: '/images/avatars/avatar-10.jpg' },
    ],
    clients: [
        { id: 'cl1', name: 'Tech Solutions Inc.', contactEmail: 'contact@techsol.com', phone: '0123456789', lastContact: getDate(-5), projects: ['p2'] },
        { id: 'cl2', name: 'Summer Wear Co.', contactEmail: 'info@summerwear.com', phone: '0987654321', lastContact: getDate(-2), projects: ['p3'] },
        { id: 'cl3', name: 'Global CyberSafe', contactEmail: 'support@cybersafe.com', phone: '0654321098', lastContact: getDate(-1), projects: ['p4'] },
        { id: 'cl4', name: 'Gourmet Guides', contactEmail: 'hello@gourmetguides.net', phone: '0711223344', lastContact: getDate(-10), projects: ['p5'] },
        { id: 'cl5', name: 'EcoBuild Innovations', contactEmail: 'info@ecobuild.com', phone: '0566778899', lastContact: getDate(-15), projects: [] },
    ],
};

// Ré-export de mockPortalData si nécessaire (à vérifier si utilisé)
export const mockPortalData = {
    documentTitle: 'Stratégie de Lancement Produit V2',
    author: {
        name: 'Yves P. (Votre profil)',
        avatarUrl: '/images/avatars/yves.jpg', // Assurez-vous que cette image existe et que son nom est propre
    },
    isFeatured: true,
    viewCount: '2.5k',
    avgEngagementSeconds: 185,
    leadsCaptured: 42,
    summary: `Ce document détaille la stratégie complète pour le lancement de la version 2 de notre produit phare. Il couvre l'analyse de marché, la proposition de valeur, les personas cibles, le plan marketing détaillé (SEO, SEM, social media, email marketing), et les prévisions de vente pour les six prochains mois.\n\nNous avons mis un accent particulier sur l'engagement utilisateur post-lancement et les boucles de feedback pour assurer une amélioration continue.`,
    project: {
        tasks: [
            { id: 't1', title: 'Revue UX/UI complète', status: 'complété' },
            { id: 't2', title: 'Développement Backend V2', status: 'en cours' },
            { id: 't3', title: 'Création contenu marketing', status: 'en cours' },
            { id: 't4', title: 'Préparation du support client', status: 'à faire' },
        ],
    },
    invoices: [
        { id: 'INV-2025-001', amount: '15,000 €', date: '10/05/2025', status: 'Payée' },
        { id: 'INV-2025-002', amount: '5,000 €', date: '20/06/2025', status: 'En attente' },
    ],
    files: [
        { id: 'f1', name: 'Plan Marketing V2.pdf', url: '#' },
        { id: 'f2', name: 'Spécifications Techniques.docx', url: '#' },
        { id: 'f3', name: 'Maquettes UX.zip', url: '#' },
    ],
    messages: [
        { id: 'm1', author: 'Team Design', avatarChar: 'TD', text: 'Les dernières maquettes sont prêtes pour validation !', timestamp: 'Hier, 16:30' },
        { id: 'm2', author: 'Yves P.', avatarUrl: '/images/avatars/yves.jpg', text: 'Excellent travail, je suis en train de les revoir.', timestamp: 'Hier, 16:45' },
        { id: 'm3', author: 'Alice D.', avatarChar: 'AD', text: 'Quelqu\'un a des retours sur le script vidéo ?', timestamp: 'Aujourd’hui, 09:00' },
    ],
};