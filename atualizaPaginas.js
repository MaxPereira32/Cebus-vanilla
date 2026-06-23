const fs = require('fs');
const path = require('path');

const modulosDir = path.join(__dirname, 'js', 'modulos');

function findPaginaFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findPaginaFiles(filePath));
    } else if (file.endsWith('Pagina.js')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = findPaginaFiles(modulosDir);

let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Extrair nome do módulo a partir do caminho
  const moduleName = path.basename(path.dirname(file));

  // 1. Injetar id: 'modulo_name' no usePaginacao
  const usePagRegex = /(paginacao\s*=\s*Cebus\.util\.usePaginacao\(\s*\{)/g;
  if (usePagRegex.test(content) && !content.includes("id: '" + moduleName + "'")) {
    content = content.replace(usePagRegex, `$1\n      id: '${moduleName}',`);
    changed = true;
  }

  // 2. Injetar a função mudarItensPorPagina no objeto pagina se ainda não existir
  if (content.includes('var pagina = {') && !content.includes('mudarItensPorPagina:')) {
    content = content.replace(/var pagina = \{/g, `var pagina = {\n    mudarItensPorPagina: function(el) { if (paginacao) paginacao.mudarPorPagina(el.value); },`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
    updatedCount++;
  }
});

console.log(`Finished. Updated ${updatedCount} files.`);
