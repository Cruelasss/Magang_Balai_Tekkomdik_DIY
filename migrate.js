const { execSync } = require('child_process');

try {
  console.log("Creating Database...");
  execSync('mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com -P 4000 -u 3g7EAF5RiX5H14P.root -ppmo9zABiImp32V5g -e "CREATE DATABASE IF NOT EXISTS tekkomdik_intern_gate;"', { stdio: 'inherit' });
  console.log("Database created.");
  
  console.log("Importing Data...");
  execSync('mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com -P 4000 -u 3g7EAF5RiX5H14P.root -ppmo9zABiImp32V5g --default-character-set=utf8mb4 tekkomdik_intern_gate < backup_db2.sql', { stdio: 'inherit' });
  console.log("Data imported successfully.");
} catch (error) {
  console.error("Failed:", error.message);
}
