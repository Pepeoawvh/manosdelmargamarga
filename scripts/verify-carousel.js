// Script de verificación rápida del carrusel
// Ejecutar: node scripts/verify-carousel.js

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════');
console.log('  VERIFICACIÓN DEL CARRUSEL');
console.log('  Manos del Marga Marga');
console.log('═══════════════════════════════════════════════════════════\n');

const checks = [
  {
    name: 'SlideForm.jsx',
    path: 'src/app/components/slides/SlideForm.jsx',
    searchStrings: [
      'activeSection',
      'basic, layout, styling',
      'layout: {',
      'styling: {',
      'Posicionamiento',
      'horizontalAlign',
      'titleColor'
    ]
  },
  {
    name: 'HeroCarousel.jsx',
    path: 'src/app/components/HeroCarousel.jsx',
    searchStrings: [
      'layout.verticalAlign',
      'layout.horizontalAlign',
      'styling.titleColor',
      'styling.overlayOpacity',
      'maxWidthClasses'
    ]
  },
  {
    name: 'CarouselManager.jsx',
    path: 'src/app/components/admin/CarouselManager.jsx',
    searchStrings: [
      'stopPropagation',
      '{...listeners}',
      'cursor-grab'
    ]
  }
];

let allPassed = true;

checks.forEach(check => {
  console.log(`📄 Verificando ${check.name}...`);
  
  const filePath = path.join(process.cwd(), check.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ Archivo no encontrado: ${check.path}\n`);
    allPassed = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  let passed = 0;
  let failed = 0;
  
  check.searchStrings.forEach(searchString => {
    if (content.includes(searchString)) {
      console.log(`   ✅ Encontrado: "${searchString}"`);
      passed++;
    } else {
      console.log(`   ❌ NO encontrado: "${searchString}"`);
      failed++;
      allPassed = false;
    }
  });
  
  console.log(`   📊 ${passed}/${passed + failed} verificaciones pasadas\n`);
});

console.log('═══════════════════════════════════════════════════════════');
if (allPassed) {
  console.log('✅ ¡TODAS LAS VERIFICACIONES PASARON!');
  console.log('\nEl código del carrusel está actualizado correctamente.');
  console.log('\nSi aún no ves los cambios:');
  console.log('  1. Limpia el caché: Remove-Item -Recurse -Force .next');
  console.log('  2. Reinicia el servidor: npm run dev');
  console.log('  3. Hard reload en el navegador: Ctrl + F5');
  console.log('  4. Verifica datos en Firebase (migra si es necesario)');
} else {
  console.log('❌ ALGUNAS VERIFICACIONES FALLARON');
  console.log('\nEl código NO está completamente actualizado.');
  console.log('Verifica que hayas subido todos los cambios al repositorio.');
}
console.log('═══════════════════════════════════════════════════════════\n');

process.exit(allPassed ? 0 : 1);
