export const normalizeText = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();

export const redRules = [
  // Suicide / Self-Harm
  /(想|要|企圖|打算|好想|真係想|真的很想).*(死|尋死|寻死|跳樓|跳楼|自殺|自杀|割腕|鎅手|割手|離開這世界|离开这世界)/,
  /(结束|結束).*(生命|自己|一切)/,
  /(不想|唔想|沒法|無法|无法|不能).*(活|生存|撐落去|撑下去)/,
  /(想不開|想不开|做傻事)/,
  /(沒有|没有|無|找不到).*(生存|活著|活着|活下去|繼續|继续).*(的)?(意義|意义|理由|動力|动力)/,
  /不想(在|留)(在這個世界|在这世界|世上)/,
  /一睡不醒/,
  /(nobody|no one).*(save|care|help|love|understand).*(me)/i,
  /(want|wish|feel like|wanna).*(die|end it|kill myself|kill my self|hurt myself|cut myself|disappear|pass away|giving up on life|don't want to live)/i,
  /die/i,
  /no reason to (live|go on|keep going)/i,
  /better off dead/i,
  /(覺得|觉得|自己).*(是個|是个).*(垃圾|廢物|废物|負累|负担|多餘|多余)/,
  /(不想|沒勇氣|没勇气).*(存在|面對|面对|明天)/,
  /(傷害|伤害|懲罰|惩罚).*(自己)/,
  /hurting myself/i,
  /(hopeless|worthless|pointless|nothing matters anymore)/i,
  /(吞藥|吞药|安眠藥|安眠药|燒炭|烧炭|自焚|跳河|跳橋|跳桥|上吊|吊頸|吊颈)/,
  /(take my own life|end my life|commit suicide|overdose|hang myself)/i,
  /(世界|大家).*(沒有|没)(我|了我).*(更好|开心|開心)/,
  /the world would be better without me/i,

  // Violence / Extremism / Threats
  /(砍|殺|杀|打爆|斬死|斩死|掐死|鍊死|死|打死|揍|弄死|同歸於盡|同归于尽).*(人|(?<!其)他|她|別人|老师|同學|同学|大家)/,
  /(光復香港|时代革命|時代革命|光复香港|港獨|港独|黑警|死黑警|分裂國家|分裂国家|暴動|暴动|造反|建國|颠覆政权)/,
  /kill (someone|them|him|her|you|everyone)/i,
  /(mass violence|shoot up|school shooting|bring a gun)/i,
  /(帶|带)(刀|武器|槍|枪|炸藥|炸药).*(學校|学校|返學)/,
  /(炸|燒|烧).*(學校|学校|大樓|大楼)/,
  /(报复社会|報復社會)/,
  
  // Emojis mapping to red level
  /(🔪|🔫|💣|🩸|☠️|💀)/
];

export const yellowRules = [
  // Profanity & Insults (Cantonese)
  /(屌|撚|鳩|柒|仆街|扑街|冚家剷|死全家|dllm|on9|diu|痴線|痴线|仆你個街|仆你个街|含撚|臭閪|臭雞|臭鸡|屌你老母|憨鳩|戇鳩|戇狗|收皮|食屎|屌那星|冚家祥|死八婆|臭鴨|狗公|死毒撚|頂你個肺|顶你个肺|麻甩佬|粉腸|契弟|臭罌|仆直|死窮鬼)/i,
  
  // Profanity & Insults (Mainland Chinese, Pinyin, Variants)
  // Refined '操' to not match P.E. or admin terms like 早操, 體操, 操場, 操行, 操心, 操勞, 操作, 節操.
  // Removed "我去" to prevent false alarms on literal "I go to..."
  // Removed raw "nt" and "sb" substrings to prevent flagging "student", "husband", etc.
  /((?<!(早|體|体|節|节|重))操(?!(場|场|行|心|勞|劳|作|持))|傻逼|他妈的|干|滚|妈的|贱人|賤人|廢柴|废柴|白痴|弱智|死蠢|賤格|煞笔|沙雕|装逼|玛德|麻痹|脑残|腦殘|草泥马|尼玛|绿茶婊|屌丝|你妈死了|傻屌|狗娘养|卧槽|他大爷|你大爷|特么|特么的|特喵|马蛋|麻蛋|泥煤|王八蛋|小瘪三|畜生|祖宗十八代|你妹|滚蛋|小三|狐狸精|死变态|nmsl|cnm|tmd|nmb)/i,
  
  // English stand-alone slang with word boundaries to prevent substring collisions (e.g. want -> nt, husband -> sb)
  /\b(nt|sb)\b/i,

  // Profanity & Insults (English & Leetspeak/Censored variants)
  /(f[u*@#!]+c?[k*@#!]+|sh[i1*@#!]+t|b[i1*@#!]+tch|c[u*@#!]+nt|a\$$hole|asshole|bastard|motherfucker|stfu|bullshit|garbage|idiot|retard|slut|whore|dick|cock|pussy|dumbass|douchebag|jackass|wanker|twat|prick|faggot|crap|damn|dammit|piss off|screw you|bollocks|bugger|tosser|minger|skank|bimbo|twink|n[i1*@!]+g{2,}[a-z]*)/i,
  
  /(垃圾學校|垃圾学校|討厭學校|讨厌学校|恨學校|恨学校|炸學校|炸school)/,

  // Bullying / Harassment / Minor Violence / Abuse
  /(欺凌|杯葛|排擠|排挤|孤立|被玩|欺負|欺负|針對|针对|笑我)/,
  /(打我|揍我|家暴|虐待|虐打|被父母打|非禮|性侵|性騷擾|強姦|强奸|摸我|偷拍)/,
  /(厕所里打|放學打|放学打|捉弄|恶作剧|惡作劇)/,
  /(bullied|bully|bullying|make fun of me|laugh at me|ganging up on me)/i,
  
  // Emojis mapping to yellow level (Negative sentiment, insults, slang replacements) - Moved 😷 to green
  /(🖕|🤬|💩|🤡|🤢|🤮|👺|👿|🐴|🦙|🌿|🐎|🐒|🐶|🐷)/
];

export const greenRules = [
  // Stress, sadness, academics, mental health keywords (non-urgent)
  /(壓力大|压力大|好大壓力|好大压力|好煩|烦|唔開心|不开心|喊|哭|悶|灰|嬲|生气|發脾氣|发脾气|憎|討厭|讨厌|好攰|好累|心累|辛苦|緊張|紧张)/,
  /(失眠|訓唔著|睡不着|冇胃口|没胃口)/,
  /(抑鬱|抑郁|焦慮|焦虑|擔心|担心|驚(?!喜|奇|艷)|惊(?!喜|奇|艳)|怕|驚恐|無奈|无奈|失落|崩潰|崩溃|想喊|激死|火大|無心情|无心情|迷茫|迷惘)/,
  /(不及格|烂grade|爛grade|成績差|成绩差|退步|測驗|测验|考試|考试).*(差|烂|爛|肥佬|唔合格|不合格)/,
  /(leave me alone|down|sad|angry|emo|unhappy|cry|crying|bored|annoyed|hate|tired|exhausted|burnout|burned out|nervous)/i,
  /(depressed|anxious|worried|scared|fear|nervous|upset|stressful|mad|frustrated|overwhelmed|lost|insomnia)/i,
  /(exam|test|dictation|grade|study|stress|hard|difficult|results|revision).*(sucks|hard|fail|bad|stress)/i,
  /(fail|bad).*(exam|test|quiz)/i,
  /(讀書|读书).*(好辛苦|好攰|好累|壓力|压力)/,

  // Physical distress (Sickness, Pain, Injury)
  /(病|不舒服|唔舒服|(?<![a-zA-Z])(頭|头|胃|肚子|肚|牙|手|腳|脚|心|身|肉|骨|喉嚨|喉咙|腰|背|眼|耳|鼻).*痛|受傷|受伤|骨折|流血|頭暈|头晕|嘔吐|嘔)/,
  /(\b(unwell|sick|fever|flu|headache|stomachache|pain|painful)\b|\bhurt\b)/i,

  // Emojis mapping to green level
  /(😭|😢|😞|😔|😡|😠|😩|😫|💔|📉|😷)/
];

export const negationRules = [
  /(不|唔|没|沒有|不可能|未)(想死|要死|想自殺|会自杀|想伤害自己|想打人|會打人)|(not|don't|do not|never|won't).*(want to die|want to kill|want to hurt|do it|kill myself)/i,
  /(不|唔|没).*(是|會|会|想).*(垃圾|廢物|废物)/,
  /(並非|并非)/,
  /(只是|只係|不過是|不过是).*(說說|说说|講下|讲下)/
];

export const matchesAny = (text: string, rules: RegExp[]) => rules.some(rule => rule.test(text));

export const getWarningLevel = (text: string): 'red' | 'yellow' | 'green' | 'none' => {
  if (!text) return 'none';
  const normText = normalizeText(text);

  if (matchesAny(normText, redRules)) {
    if (matchesAny(normText, negationRules)) {
      return 'yellow'; // Downgrade to yellow if strongly negated
    }
    return 'red';
  }
  
  if (matchesAny(normText, yellowRules)) return 'yellow';
  if (matchesAny(normText, greenRules)) return 'green';
  
  return 'none';
};

export const getWarningWeight = (level: string): number => {
  if (level === 'red') return 3;
  if (level === 'yellow') return 2;
  if (level === 'green') return 1;
  return 0;
};
