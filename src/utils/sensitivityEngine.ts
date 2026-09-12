export const normalizeText = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();

export const redRules = [
  // 1. Standalone Explicit Crisis Actions / Self-Harm / Suicide Methods
  /(自殺|自杀|跳樓|跳楼|跳軌|跳轨|割腕|鎅手|割手|割脈|上吊|吊頸|吊颈|自殘|自残|燒炭|烧炭|自焚|跳河|跳橋|跳桥|跳火車|尋死|寻死|吞藥|吞药|安眠藥|安眠药)/,
  /(想消失|好想消失|人間蒸發|人間蒸发|徹底消失|永遠消失|消失喺呢個世界|消失喺世上|消失在這世界|離開這世界|離開世界|離開人世|不想存在)/,
  /(死咗佢算|死左佢算|死左算|死了算了|死了就好|死咗更好|早死早著|早死早着)/,
  /\b(kill myself|kill my self|commit suicide|end my life|take my own life|hang myself|overdose)\b/i,
  /better off dead/i,
  /\b(suicide|suicidal)\b/i,

  // 2. Intent & Desire Patterns (Suicide / Disappearance / Ceasing to exist)
  /(想|要|打算|企圖|企图|好想|真係想|真的很想|好希望|寧願|寧可|不如|諗緊|準備|决定|決定).*(死|尋死|跳樓|跳楼|結束生命|结束生命|離開人世|消失|做傻事|自殘)/,
  /(结束|結束).*(生命|自己|一切|折磨)/,
  /(不想|唔想|沒法|無法|无法|不能|撐唔到|撑唔到|撐唔落去|撑不下去).*(活|生存|撐落去|撑下去|面對明天|面對未來|醒來|醒番)/,
  /(想不開|想不开|走上絕路|走上绝路)/,
  /(沒有|没有|無|找不到|失去).*(生存|活著|活着|活下去|繼續|继续|走下去).*(的)?(意義|意义|理由|動力|动力|希望|勇氣|勇气)/,
  /不想(在|留)?(在這個世界|在这世界|世上|人間|世界上)/,
  /(一睡不醒|永遠不要醒|睡了不要醒|好想長眠)/,
  /(nobody|no one).*(save|care|help|love|understand).*(me)/i,
  /(want|wish|feel like|wanna).*(die|end it|kill myself|hurt myself|cut myself|disappear|pass away|giving up on life|don't want to live|end my life)/i,
  /no reason to (live|go on|keep going)/i,
  /(覺得|觉得|自己|自覺).*(是個|是个|係個|成個|成了|好似係|好似是).*(垃圾|廢物|废物|負累|负担|累贅|累赘|多餘|多余|包袱)/,
  /(不想|沒勇氣|没勇气|無勇氣).*(存在|面對|面对|明天|活著|活下去)/,
  /(傷害|伤害|懲罰|惩罚|自殘|自残).*(自己)/,
  /hurting myself/i,
  /(hopeless|worthless|pointless|nothing matters anymore|hate my life)/i,
  /(世界|大家|屋企|身邊人).*(沒有|没)(我|了我).*(更好|开心|開心|更輕鬆)/,
  /the world would be better without me/i,
  /(活得很痛苦|活得好痛苦|生活好痛苦|好痛苦.*想死)/,

  // 3. Violence / Extremism / Threats
  /(砍|殺|杀|打爆|斬死|斩死|掐死|鍊死|打死|揍死|弄死|同歸於盡|同归于尽).*(人|(?<!其)他|她|別人|老师|老師|同學|同学|大家|校長|全家)/,
  /(光復香港|时代革命|時代革命|光复香港|港獨|港独|黑警|死黑警|分裂國家|分裂国家|暴動|暴动|造反|建國|颠覆政权)/,
  /kill (someone|them|him|her|you|everyone)/i,
  /(mass violence|shoot up|school shooting|bring a gun|bomb)/i,
  /(帶|带)(刀|武器|槍|枪|炸藥|炸药).*(學校|学校|返學|入校)/,
  /(炸|燒|烧).*(學校|学校|大樓|大楼|教室|課室)/,
  /(报复社会|報復社會|血洗)/,
  
  // 4. Emojis mapping to red level
  /(🔪|🔫|💣|🩸|☠️|💀)/
];

export const yellowRules = [
  // Profanity & Insults (Cantonese)
  /(屌|撚|鳩|柒|仆街|扑街|冚家剷|死全家|dllm|on9|diu|痴線|痴线|仆你個街|仆你个街|含撚|臭閪|臭雞|臭鸡|屌你老母|憨鳩|戇鳩|戇狗|收皮|食屎|屌那星|冚家祥|死八婆|臭鴨|狗公|死毒撚|頂你個肺|顶你个肺|麻甩佬|粉腸|契弟|臭罌|仆直|死窮鬼)/i,
  
  // Profanity & Insults (Mandarin & Variants)
  /((?<!(早|體|体|節|节|重))操(?!(場|场|行|心|勞|劳|作|持))|傻逼|他妈的|干|滚|妈的|贱人|賤人|廢柴|废柴|白痴|弱智|死蠢|賤格|煞笔|沙雕|装逼|玛德|麻痹|脑残|腦殘|草泥马|尼玛|绿茶婊|屌丝|你妈死了|傻屌|狗娘养|卧槽|他大爷|你大爷|特么|特么的|特喵|马蛋|麻蛋|泥煤|王八蛋|小瘪三|畜生|祖宗十八代|你妹|滚蛋|小三|狐狸精|死变态|nmsl|cnm|tmd|nmb)/i,
  
  // English stand-alone slang
  /\b(nt|sb)\b/i,
  /(f[u*@#!]+c?[k*@#!]+|sh[i1*@#!]+t|b[i1*@#!]+tch|c[u*@#!]+nt|a\$\$hole|asshole|bastard|motherfucker|stfu|bullshit|garbage|idiot|retard|slut|whore|dick|cock|pussy|dumbass|douchebag|jackass|wanker|twat|prick|faggot|crap|damn|dammit|piss off|screw you|bollocks|bugger|tosser|minger|skank|bimbo|twink|n[i1*@!]+g{2,}[a-z]*)/i,
  
  /(垃圾學校|垃圾学校|討厭學校|讨厌学校|恨學校|恨学校|炸學校|炸school)/,

  // Bullying / Harassment / Extortion / Abuse
  /(欺凌|杯葛|排擠|排挤|孤立|被玩|欺負|欺负|針對|针对|笑我|取笑我|起底)/,
  /(打我|揍我|家暴|虐待|虐打|被父母打|被同學打|被同學圍|非禮|性侵|性騷擾|強姦|强奸|摸我|偷拍|勒索|搶錢|收陀地)/,
  /(厕所里打|放學打|放学打|捉弄|恶作剧|惡作劇|搶我野|丟我書包|撕我簿)/,
  /(bullied|bully|bullying|make fun of me|laugh at me|ganging up on me|extort|harass)/i,
  
  // Emojis mapping to yellow level
  /(🖕|🤬|💩|🤮)/
];

// Positive / Safe Expressions (Never a warning)
export const positiveRules = [
  /(開心|开心|高興|高兴|快樂|快乐|幸福|好玩|感激|多謝|謝謝|多谢|谢谢|感恩)/,
  /(我愛|我爱|喜歡|喜欢|讚|讚好|超讚|好棒|好正)/,
  /(努力|加油|堅持|继续加油|進步|進步左|考好)/,
  /(放假|旅行)/,
  /\b(good|great|happy|fun|awesome|nice|thank|thanks|love|appreciate|excited)\b/i
];

// Context Mitigators / Clarifications
export const contextMitigatorRules = [
  /(開玩笑|只是玩笑|講笑|讲笑|玩下啫|隨便講下|随便说说|聽歌|歌名|歌詞|歌词)/
];

// Mild Everyday School Fatigue / Academic Pressure (Informational only)
export const mildStressRules = [
  /(攰|累|好攰|好累|眼瞓|好眼瞓|功課多|好多功課|考試壓力|溫書|温习|默書|默书)/,
  /\b(tired|exhausted|sleepy|stressed)\b/i
];

export const greenRules = mildStressRules;

export interface NlpAnalysisResult {
  level: 'red' | 'yellow' | 'green' | 'none';
  category: 'self_harm' | 'violence' | 'bullying' | 'profanity' | 'distress' | 'general';
  matchedRuleSummary?: string;
  isNegated?: boolean;
}

export const analyzeTextNlp = (text: string): NlpAnalysisResult => {
  if (!text || !text.trim()) {
    return { level: 'none', category: 'general' };
  }

  const normalized = normalizeText(text);

  // Check RED rules
  for (const rule of redRules) {
    if (rule.test(normalized)) {
      const isHarm = /(死|殺|自殘|割腕|跳樓|結束生命|消失|kill|suicide|disappear)/i.test(normalized);
      return {
        level: 'red',
        category: isHarm ? 'self_harm' : 'violence',
        matchedRuleSummary: rule.toString()
      };
    }
  }

  // Check YELLOW rules
  for (const rule of yellowRules) {
    if (rule.test(normalized)) {
      const isBully = /(欺凌|打我|排擠|取笑|勒索|bully|harass)/i.test(normalized);
      return {
        level: 'yellow',
        category: isBully ? 'bullying' : 'profanity',
        matchedRuleSummary: rule.toString()
      };
    }
  }

  // Check Positive rules first -> strictly safe, no warning
  for (const rule of positiveRules) {
    if (rule.test(normalized)) {
      return {
        level: 'none',
        category: 'general',
        matchedRuleSummary: 'Positive Sentiment'
      };
    }
  }

  // Check Context Mitigators -> strictly safe, no warning
  for (const rule of contextMitigatorRules) {
    if (rule.test(normalized)) {
      return {
        level: 'none',
        category: 'general',
        matchedRuleSummary: 'Context Mitigator'
      };
    }
  }

  // Check MILD fatigue / academic stress rules
  for (const rule of mildStressRules) {
    if (rule.test(normalized)) {
      return {
        level: 'green',
        category: 'distress',
        matchedRuleSummary: 'Mild School Fatigue/Stress'
      };
    }
  }

  return { level: 'none', category: 'general' };
};

export const getWarningLevel = (text: string): 'red' | 'yellow' | 'green' | 'none' => {
  return analyzeTextNlp(text).level;
};

export const getWarningWeight = (level: 'red' | 'yellow' | 'green' | 'none'): number => {
  switch (level) {
    case 'red': return 100;
    case 'yellow': return 30;
    case 'green': return -10;
    default: return 0;
  }
};
