(function () {
    const ACCOUNTS_KEY = "flixoraAccounts";
    function profileKey(email) {
        return `flixoraProfiles:${(email || "guest").toLowerCase()}`;
    }

    let firestore = null;
    let firebaseReady = false;

    function toDocId(email) {
        return encodeURIComponent((email || "guest").toLowerCase());
    }

    function initFirebase() {
        if (firebaseReady) return true;
        if (!window.FLIXORA_FIREBASE_CONFIG) return false;
        if (!window.firebase || !window.firebase.firestore) return false;
        try {
            if (!window.firebase.apps.length) {
                window.firebase.initializeApp(window.FLIXORA_FIREBASE_CONFIG);
            }
            firestore = window.firebase.firestore();
            firebaseReady = true;
            return true;
        } catch (err) {
            return false;
        }
    }

    function readLocalAccounts() {
        return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
    }

    function saveLocalAccounts(accounts) {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }

    function readLocalProfiles(email) {
        return JSON.parse(localStorage.getItem(profileKey(email)) || "[]");
    }

    function saveLocalProfiles(email, profiles) {
        localStorage.setItem(profileKey(email), JSON.stringify(profiles));
    }

    async function readAccounts() {
        const local = readLocalAccounts();
        if (!initFirebase()) return local;
        try {
            const snap = await firestore.collection("flixora").doc("accounts").get();
            const remote = snap.exists ? (snap.data().items || []) : [];
            if (remote.length) {
                saveLocalAccounts(remote);
                return remote;
            }
            return local;
        } catch (err) {
            return local;
        }
    }

    async function saveAccounts(accounts) {
        saveLocalAccounts(accounts);
        if (!initFirebase()) return;
        try {
            await firestore.collection("flixora").doc("accounts").set({ items: accounts }, { merge: true });
        } catch (err) {
            // keep local fallback silently
        }
    }

    async function readProfiles(email) {
        const local = readLocalProfiles(email);
        if (!initFirebase()) return local;
        try {
            const snap = await firestore.collection("flixora_profiles").doc(toDocId(email)).get();
            const remote = snap.exists ? (snap.data().items || []) : [];
            if (remote.length) {
                saveLocalProfiles(email, remote);
                return remote;
            }
            return local;
        } catch (err) {
            return local;
        }
    }

    async function saveProfiles(email, profiles) {
        saveLocalProfiles(email, profiles);
        if (!initFirebase()) return;
        try {
            await firestore.collection("flixora_profiles").doc(toDocId(email)).set({ items: profiles }, { merge: true });
        } catch (err) {
            // keep local fallback silently
        }
    }

    async function syncUserData(email) {
        if (!initFirebase()) return false;
        const accounts = readLocalAccounts();
        const profiles = readLocalProfiles(email);
        try {
            await firestore.collection("flixora").doc("accounts").set({ items: accounts }, { merge: true });
            await firestore.collection("flixora_profiles").doc(toDocId(email)).set({ items: profiles }, { merge: true });
            return true;
        } catch (err) {
            return false;
        }
    }

    window.flixoraStore = {
        initFirebase,
        isFirebaseReady: () => initFirebase(),
        readAccounts,
        saveAccounts,
        readProfiles,
        saveProfiles,
        syncUserData
    };
})();
