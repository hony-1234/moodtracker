import { yellowRules, redRules, greenRules } from './src/utils/sensitivityEngine';

const comments = [
  "今天我的好朋友不閧心我去安慰她",
  "Noting want to say bura",
  "可以做早操"
];

comments.forEach(comment => {
  console.log(`\nTesting comment: "${comment}"`);
  
  redRules.forEach((rule, idx) => {
    if (rule.test(comment)) {
      console.log(`  MATCHED RED RULE #${idx + 1}: ${rule}`);
    }
  });

  yellowRules.forEach((rule, idx) => {
    if (rule.test(comment)) {
      console.log(`  MATCHED YELLOW RULE #${idx + 1}: ${rule}`);
    }
  });

  greenRules.forEach((rule, idx) => {
    if (rule.test(comment)) {
      console.log(`  MATCHED GREEN RULE #${idx + 1}: ${rule}`);
    }
  });
});
