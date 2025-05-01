import admin from 'firebase-admin';

// Evitar inicialización múltiple
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
  }
}

// Exportar las instancias de Firestore y Auth
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;