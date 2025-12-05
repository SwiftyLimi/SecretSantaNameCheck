const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Get the name from command line argument
const nameToRemove = process.argv[2];

if (!nameToRemove) {
  console.error('Usage: node remove-selection.js <name>');
  console.error('Example: node remove-selection.js Miran');
  process.exit(1);
}

const db = new sqlite3.Database('./secret_santa.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  
  console.log('Connected to database');
  
  // First, find the name ID
  db.get('SELECT id, name FROM names WHERE name = ?', [nameToRemove], (err, nameRow) => {
    if (err) {
      console.error('Error finding name:', err.message);
      db.close();
      process.exit(1);
    }
    
    if (!nameRow) {
      console.error(`Name "${nameToRemove}" not found in database`);
      db.close();
      process.exit(1);
    }
    
    console.log(`Found name: ${nameRow.name} (ID: ${nameRow.id})`);
    
    // Check if there's a selection
    db.get('SELECT * FROM selections WHERE name_id = ?', [nameRow.id], (err, selectionRow) => {
      if (err) {
        console.error('Error checking selection:', err.message);
        db.close();
        process.exit(1);
      }
      
      if (!selectionRow) {
        console.log(`No selection found for "${nameToRemove}"`);
        db.close();
        process.exit(0);
      }
      
      console.log(`Found selection for "${nameToRemove}"`);
      console.log(`Selection ID: ${selectionRow.id}, Selected at: ${selectionRow.selected_at}`);
      
      // Remove the selection
      db.run('DELETE FROM selections WHERE name_id = ?', [nameRow.id], function(err) {
        if (err) {
          console.error('Error removing selection:', err.message);
          db.close();
          process.exit(1);
        }
        
        console.log(`\n✅ Successfully removed selection for "${nameToRemove}"`);
        console.log(`The name is now available for selection again.`);
        db.close();
        process.exit(0);
      });
    });
  });
});

