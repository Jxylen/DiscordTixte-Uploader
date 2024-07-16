const ascii = require("ascii-table");
const fs = require('fs').promises;
const path = require('path');

async function loadFile(directoryName) {
    try {
      const directory = path.join(process.cwd(), 'src', directoryName);
      const files = await fs.readdir(directory, { withFileTypes: true });
      
      const jsFiles = [];
  
      for (const file of files) {
        if (file.isDirectory()) {
          const subFiles = await fs.readdir(path.join(directory, file.name));
          subFiles.forEach(subFile => {
            if (subFile.endsWith('.js')) {
              jsFiles.push(path.join(directory, file.name, subFile));
            }
          });
        } else if (file.name.endsWith('.js')) {
          jsFiles.push(path.join(directory, file.name));
        }
      }
  
      jsFiles.forEach((file) => {
        const resolvedPath = require.resolve(file);
        delete require.cache[resolvedPath];
      });
  
      return jsFiles;
    } catch (error) {
      console.error("Error loading files:", error);
      return [];
    }
  }

async function eventLoad(client) {
  const resultTable = new ascii().setHeading("Client Events", "Client Status");

  await client.events.clear();
  const files = await loadFile("events");

  if (!files.length) {
    console.log("No event files found.");
    return;
  }

  files.forEach((file) => {
    const event = require(file);

    const execute = (...args) => event.execute(...args, client);
    client.events.set(event.name, execute);

    if (event.once) {
      client.once(event.name, execute);
    } else {
      client.on(event.name, execute);
    }

    resultTable.addRow(event.name, "Active");
  });

  console.log(resultTable.toString(), "\nEvents Loaded!");
}

module.exports = { eventLoad };
