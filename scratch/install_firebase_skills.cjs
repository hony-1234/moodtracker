const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetProjectDir = path.join(__dirname, '..', '.agents', 'skills');

console.log('Target Project Skills Dir:', targetProjectDir);

const zipUrl = 'https://codeload.github.com/firebase/agent-skills/zip/refs/heads/main';
const tempZip = path.join(process.env.TEMP, 'firebase-agent-skills.zip');
const tempExtract = path.join(process.env.TEMP, 'firebase-agent-skills-extract');

function download(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode === 301 || response.statusCode === 302) {
      return download(response.headers.location, dest, cb);
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close(cb);
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    if (cb) cb(err);
  });
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Downloading firebase/agent-skills repository archive...');
download(zipUrl, tempZip, (err) => {
  if (err) {
    console.error('Download failed:', err);
    process.exit(1);
  }
  console.log('Downloaded successfully! Extracting...');

  if (fs.existsSync(tempExtract)) {
    fs.rmSync(tempExtract, { recursive: true, force: true });
  }
  fs.mkdirSync(tempExtract, { recursive: true });

  execSync(`powershell -Command "Expand-Archive -Path '${tempZip}' -DestinationPath '${tempExtract}' -Force"`, { stdio: 'inherit' });

  const skillsSrc = path.join(tempExtract, 'agent-skills-main', 'skills');
  if (!fs.existsSync(skillsSrc)) {
    console.error('Skills directory not found in extracted archive:', skillsSrc);
    process.exit(1);
  }

  const skillDirs = fs.readdirSync(skillsSrc).filter(f => fs.statSync(path.join(skillsSrc, f)).isDirectory());
  console.log(`Found ${skillDirs.length} Firebase skills:`, skillDirs);

  // Install to project-level .agents/skills
  if (!fs.existsSync(targetProjectDir)) fs.mkdirSync(targetProjectDir, { recursive: true });
  for (const skill of skillDirs) {
    const srcPath = path.join(skillsSrc, skill);
    const destProjPath = path.join(targetProjectDir, skill);
    copyRecursiveSync(srcPath, destProjPath);
    console.log(`+ Installed to project: .agents/skills/${skill}`);
  }

  // Also create a skills-lock.json in root
  const lockFile = path.join(__dirname, '..', 'skills-lock.json');
  let lockData = { skills: {} };
  if (fs.existsSync(lockFile)) {
    try {
      lockData = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
    } catch (e) {}
  }
  for (const skill of skillDirs) {
    lockData.skills[skill] = {
      source: 'firebase/agent-skills',
      path: `skills/${skill}`
    };
  }
  fs.writeFileSync(lockFile, JSON.stringify(lockData, null, 2), 'utf8');

  console.log('\nAll Firebase agent skills installed successfully!');
});
