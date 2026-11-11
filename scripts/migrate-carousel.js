// Script para migrar slides antiguos con las nuevas propiedades de layout y styling
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Valores por defecto para las nuevas propiedades
const defaults = {
  layout: {
    horizontalAlign: "left",
    verticalAlign: "center",
    textAlign: "left",
    maxWidth: "2xl",
  },
  styling: {
    titleSize: "large",
    titleColor: "#ffffff",
    descriptionColor: "#ffffff",
    overlayOpacity: 40,
    overlayColor: "black",
  },
};

async function migrateCarouselSlides() {
  console.log('🔄 Iniciando migración de slides del carrusel...\n');
  
  try {
    const snapshot = await db.collection('carousel-slides').get();
    
    if (snapshot.empty) {
      console.log('⚠️  No hay slides para migrar.');
      process.exit(0);
    }
    
    console.log(`📊 Encontrados ${snapshot.size} slides en total\n`);
    
    let needsUpdate = 0;
    let alreadyUpdated = 0;
    const batch = db.batch();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const slideId = doc.id;
      const slideTitle = data.title || 'Sin título';
      
      // Verificar si ya tiene las propiedades
      const hasLayout = data.layout && 
                        data.layout.horizontalAlign && 
                        data.layout.verticalAlign;
      const hasStyling = data.styling && 
                         data.styling.titleSize && 
                         data.styling.titleColor;
      
      if (!hasLayout || !hasStyling) {
        const ref = db.collection('carousel-slides').doc(slideId);
        const updateData = {};
        
        if (!hasLayout) {
          updateData.layout = defaults.layout;
          console.log(`  📐 Agregando layout a: "${slideTitle}" (${slideId})`);
        }
        
        if (!hasStyling) {
          updateData.styling = defaults.styling;
          console.log(`  🎨 Agregando styling a: "${slideTitle}" (${slideId})`);
        }
        
        batch.update(ref, updateData);
        needsUpdate++;
      } else {
        alreadyUpdated++;
      }
    });
    
    console.log('\n📋 Resumen:');
    console.log(`  - Slides a actualizar: ${needsUpdate}`);
    console.log(`  - Slides ya actualizados: ${alreadyUpdated}`);
    
    if (needsUpdate > 0) {
      console.log('\n💾 Guardando cambios en Firebase...');
      await batch.commit();
      console.log(`\n✅ Migración completada exitosamente!`);
      console.log(`   ${needsUpdate} slides actualizados con las nuevas propiedades.`);
    } else {
      console.log('\n✅ Todos los slides ya están actualizados. No se necesitan cambios.');
    }
    
    console.log('\n🎉 Proceso finalizado correctamente.\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    console.error('\nDetalles:', error.message);
    process.exit(1);
  }
}

// Ejecutar migración
console.log('═══════════════════════════════════════════════════════════');
console.log('  MIGRACIÓN DE SLIDES DEL CARRUSEL');
console.log('  Manos del Marga Marga');
console.log('═══════════════════════════════════════════════════════════\n');

migrateCarouselSlides();
