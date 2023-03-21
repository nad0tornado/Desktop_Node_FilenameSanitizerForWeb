const fs = require("fs");
const path = require("path");

function getFiles(dir, filesList = [], ignoreList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (ignoreList.find((i) => i === file)) return;

    if (fs.statSync(filePath).isDirectory()) {
      filesList = getFiles(filePath, filesList);
    } else {
      filesList.push(filePath);
    }
  });

  return filesList;
}

// .. Note: In the original use-case I had for this project, slashes/backslashes were ok so I had to remove
// from here because it was marking even the clean files as "illegal", which is not what I wanted
const illegalsRegex = /[\s<>#%{}|\^~\[\]`\?;:@&=+$,!]/g;

const allFiles: string[] = getFiles("./", [], ["node_modules"]);
const illegalFiles = allFiles.filter((f) => f.match(illegalsRegex));

allFiles.forEach((f) => {
  // .. regex is fast as hell so technically don't need to do this check, but, not a bad habit to have in
  // the case of slower methods where the dataset is gigantic (thousands of entries)!
  // simply ignore files that are already deemed "clean"
  if (illegalFiles.includes(f)) {
    fs.rename(f, f.replace(illegalsRegex, ""), function (err) {
      if (err) {
        console.log('Error renaming file: "' + f + '"');
        console.log("Error: ");
        console.log(err);
      }
    });
  }
});

if (illegalFiles.length > 0)
  console.log("Cleaned (" + illegalFiles.length + ") illegal file names");
else {
  console.log("All files are clean");
}

console.log("...Finished!");
