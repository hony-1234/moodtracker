import { yellowRules } from './src/utils/sensitivityEngine';

const comments = [
  "my husband is nice",
  "disbelief",
  "lesbian"
];

const rule = yellowRules[1]; // /(操|傻逼|...|sb)/i

comments.forEach(comment => {
  const match = comment.match(rule);
  if (match) {
    console.log(`Comment: "${comment}" matches substring: "${match[0]}"`);
  } else {
    console.log(`Comment: "${comment}" did not match.`);
  }
});
