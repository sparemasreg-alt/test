const fs = require('fs');
let code = fs.readFileSync('src/views/AdminView.tsx', 'utf8');

const createPlayerRegex = /<div className="bg-white\/5 border border-white\/10 p-6 rounded-2xl flex flex-col justify-center">\s*<h3 className="text-xl font-bold mb-6 flex items-center gap-2">\s*Create Player[\s\S]*?<\/form>\s*<\/div>/g;

const deletePlayerRegex = /<div className="bg-white\/5 border border-white\/10 p-6 rounded-2xl flex flex-col justify-center">\s*<h3 className="text-xl font-bold mb-6 flex items-center gap-2">\s*Delete Player[\s\S]*?<\/form>\s*<\/div>/g;

let createMatches = [...code.matchAll(createPlayerRegex)];
let deleteMatches = [...code.matchAll(deletePlayerRegex)];

let replacedText = '';

if (createMatches.length > 0) {
    replacedText += createMatches[0][0] + '\n\n';
    code = code.replace(createMatches[0][0], '');
}

if (deleteMatches.length > 0) {
    replacedText += deleteMatches[0][0] + '\n\n';
    code = code.replace(deleteMatches[0][0], '');
}

if (replacedText) {
    const anchor = '<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">';
    code = code.replace(anchor, anchor + '\n' + replacedText);
    
    fs.writeFileSync('src/views/AdminView.tsx', code);
    console.log("Moved forms successfully.");
} else {
    console.log("Forms not found.");
}
