const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const replaceMap = [
  // Backgrounds
  [/\bbg-white(?!\/)/g, 'bg-[#111111]'],
  [/\bbg-gray-50\/50\b/g, 'bg-[#0A0A0A]/50'],
  [/\bbg-gray-50(?!\/)/g, 'bg-[#0A0A0A]'],
  [/\bbg-gray-100(?!\/)/g, 'bg-[#1A1A1A]'],
  [/\bbg-gray-200\/50\b/g, 'bg-[#222222]/50'],
  [/\bbg-gray-200\/60\b/g, 'bg-[#222222]/60'],
  [/\bbg-gray-200\/80\b/g, 'bg-[#222222]/80'],
  [/\bbg-gray-200(?!\/)/g, 'bg-[#222222]'],
  [/\bbg-\[\#FDFDFD\]/g, 'bg-[#000000]'],
  [/\bbg-\[\#F8F9FA\]/g, 'bg-[#0A0A0A]'],
  
  // Text colors
  [/\btext-gray-900(?!\/)/g, 'text-gray-100'],
  [/\btext-gray-800(?!\/)/g, 'text-gray-200'],
  [/\btext-gray-700(?!\/)/g, 'text-gray-300'],
  [/\btext-gray-600(?!\/)/g, 'text-gray-400'],
  
  // Borders
  [/\bborder-gray-100(?!\/)/g, 'border-[#222222]'],
  [/\bborder-gray-200\/50\b/g, 'border-[#333333]/50'],
  [/\bborder-gray-200\/60\b/g, 'border-[#333333]/60'],
  [/\bborder-gray-200\/80\b/g, 'border-[#333333]/80'],
  [/\bborder-gray-200(?!\/)/g, 'border-[#333333]'],
  [/\bborder-gray-300(?!\/)/g, 'border-[#444444]'],
  
  // Hover Backgrounds
  [/\bhover:bg-gray-50(?!\/)/g, 'hover:bg-[#1A1A1A]'],
  [/\bhover:bg-gray-100(?!\/)/g, 'hover:bg-[#222222]'],
  [/\bhover:bg-gray-200\/50\b/g, 'hover:bg-[#333333]/50'],
  [/\bhover:bg-gray-200(?!\/)/g, 'hover:bg-[#333333]'],
  
  // Ring/Shadow
  [/\bring-gray-200(?!\/)/g, 'ring-[#333333]'],
  [/\bring-black\/5\b/g, 'ring-white/5'],
];

const files = walk('./src');
let updatedCount = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  replaceMap.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log(`Updated ${file}`);
  }
});
console.log(`Total files updated: ${updatedCount}`);
