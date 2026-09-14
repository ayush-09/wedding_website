/**
 * i18n — three-language dictionary for the wedding site.
 *
 * Design rules:
 *   · Proper nouns (couple names, family surnames, venue names, film
 *     titles, place names, song titles) stay in Latin script across
 *     all languages — they're the "brand" of the invitation and the
 *     Devanagari transliterations would drift from how each relative
 *     actually spells their name.
 *   · Dates, years, and times are pre-localized with Devanagari
 *     numerals for hi/mr — it's what guests expect on a formal
 *     Indian invite.
 *   · Ceremony names (Haldi, Mehndi, Sangeet, Vivah) are Sanskrit-
 *     origin and read the same across English / Hindi / Marathi —
 *     they're left as a shared proper noun.
 *   · Template strings use `{name}` placeholders, substituted at
 *     render time via the optional `vars` argument of `translate()`.
 *   · Missing keys fall back to English instead of throwing — so
 *     untranslated text still renders, just not in the chosen lang.
 */

export type Language = "en" | "hi" | "mr";

export const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
];

export const translations = {
  // ── Hero ──────────────────────────────────────────────
  "hero.together": {
    en: "We're getting married",
    hi: "हम विवाह बंधन में बंध रहे हैं",
    mr: "आम्ही विवाह बंधनात अडकत आहोत",
  },
  "hero.scroll": {
    en: "Scroll",
    hi: "नीचे",
    mr: "खाली",
  },
  "hero.date": {
    en: "23 · 01 · 2027",
    hi: "२३ · ०१ · २०२७",
    mr: "२३ · ०१ · २०२७",
  },

  // ── Family ────────────────────────────────────────────
  "family.blessings": {
    en: "With the blessings of the Divine and our elders",
    hi: "ईश्वर और बड़ों के आशीर्वाद से",
    mr: "देवाच्या आणि वडीलधाऱ्यांच्या आशीर्वादाने",
  },
  "family.our_families": {
    en: "Our families",
    hi: "हमारे परिवार",
    mr: "आमचे कुटुंब",
  },
  "family.joined": {
    en: "Joined in celebration",
    hi: "उत्सव में एकजुट",
    mr: "उत्सवात एकत्र",
  },
  "family.request": {
    en: "request the honour of your presence at the wedding of their children",
    hi: "अपने बच्चों के विवाह में आपकी शुभ उपस्थिति का अनुरोध करते हैं",
    mr: "आपल्या मुलांच्या लग्नात आपली शुभ उपस्थिती प्रार्थितो",
  },
  "family.groom_family": {
    en: "The groom's family",
    hi: "वर का परिवार",
    mr: "वराचे कुटुंब",
  },
  "family.bride_family": {
    en: "The bride's family",
    hi: "वधू का परिवार",
    mr: "वधूचे कुटुंब",
  },
  "family.surname_template": {
    en: "The {surname} Family",
    hi: "{surname} परिवार",
    mr: "{surname} कुटुंब",
  },

  // ── Story ─────────────────────────────────────────────
  "story.eyebrow": {
    en: "Our story",
    hi: "हमारी कहानी",
    mr: "आमची कथा",
  },
  "story.heading": {
    en: "From two families, one beginning.",
    hi: "दो परिवारों से, एक शुरुआत।",
    mr: "दोन कुटुंबांमधून, एक सुरुवात.",
  },
  "story.narrative": {
    en: "With the blessings of our families and elders, we are getting married this January. We would be honoured to have you with us as we begin this new chapter of our lives together.",
    hi: "अपने परिवारों और बड़ों के आशीर्वाद से, हम इस जनवरी विवाह बंधन में बंध रहे हैं। अपने जीवन का यह नया अध्याय आरंभ करते समय आपकी उपस्थिति हमारे लिए सौभाग्य की बात होगी।",
    mr: "आपल्या कुटुंबांच्या आणि वडीलधाऱ्यांच्या आशीर्वादाने, आम्ही या जानेवारीत विवाहबद्ध होत आहोत. आयुष्यातील हा नवीन अध्याय सुरू करताना आपली उपस्थिती आमच्यासाठी आनंदाची गोष्ट असेल.",
  },

  // ── Presence (live "diyas alight" counter) ────────────
  "presence.one": {
    en: "1 diya alight",
    hi: "१ दीया प्रज्वलित",
    mr: "१ दिवा प्रज्वलित",
  },
  "presence.many": {
    en: "{count} diyas alight",
    hi: "{count} दिये प्रज्वलित",
    mr: "{count} दिवे प्रज्वलित",
  },

  // ── Events (section heading) ──────────────────────────
  "events.eyebrow": {
    en: "The celebrations",
    hi: "समारोह",
    mr: "सोहळा",
  },
  "events.heading_a": {
    en: "Four ceremonies.",
    hi: "चार समारोह।",
    mr: "चार सोहळे.",
  },
  "events.heading_b": {
    en: "One beginning.",
    hi: "एक शुरुआत।",
    mr: "एक सुरुवात.",
  },

  // ── Events (shared card labels) ───────────────────────
  "events.label.time": {
    en: "Time",
    hi: "समय",
    mr: "वेळ",
  },
  "events.label.dressCode": {
    en: "Dress code",
    hi: "परिधान",
    mr: "पेहराव",
  },
  "events.label.anthem": {
    en: "Anthem",
    hi: "गीत",
    mr: "गीत",
  },
  "events.label.passport": {
    en: "Passport stamp · unlocks on RSVP",
    hi: "पासपोर्ट मोहर · RSVP पर खुलेगी",
    mr: "पासपोर्ट शिक्का · RSVP नंतर खुलेल",
  },

  // ── Events (per-ceremony copy) ────────────────────────
  "events.haldi.subtitle": {
    en: "A morning kissed by turmeric",
    hi: "हल्दी से भीगी एक सुबह",
    mr: "हळदीने न्हालेली सकाळ",
  },
  "events.haldi.description": {
    en: "The house wakes up to laughter, sunlight, and the scent of fresh turmeric. Come ready to get messy.",
    hi: "घर हँसी, धूप और ताज़ी हल्दी की ख़ुशबू से जागता है। तैयार होकर आइए — थोड़ा रंगना पड़ेगा।",
    mr: "घर हसणं, सूर्यप्रकाश आणि ताज्या हळदीच्या सुवासाने जागं होतं. थोडं रंगायची तयारी ठेवा.",
  },
  "events.haldi.dressCode": {
    en: "Mustard & Marigold",
    hi: "सरसों और गेंदा",
    mr: "मोहरी आणि झेंडू",
  },
  "events.haldi.time": {
    en: "10:00 AM",
    hi: "१०:०० पूर्वाह्न",
    mr: "१०:०० सकाळी",
  },

  "events.mehendi.subtitle": {
    en: "Patterns on palms, stories in every leaf",
    hi: "हथेलियों पर नक़्श, हर पत्ते में कहानी",
    mr: "हातावर नक्षी, प्रत्येक पानात एक कथा",
  },
  "events.mehendi.description": {
    en: "An afternoon of henna, chaat, and the oldest songs your nani knows. Cousins compete for the darkest stain.",
    hi: "एक दोपहर — मेहंदी, चाट और उन सबसे पुराने गीतों के साथ जो सिर्फ़ नानी को याद हैं। सबसे गहरे रंग के लिए भाई-बहनों में होड़।",
    mr: "एक दुपार — मेंदी, चाट आणि आजीला आठवणाऱ्या जुनाट गाण्यांची. सर्वात गडद रंगासाठी भावंडांमध्ये चढाओढ.",
  },
  "events.mehendi.dressCode": {
    en: "Forest Green & Fuchsia",
    hi: "वन हरा और गुलाबी",
    mr: "हिरवं आणि गुलाबी",
  },
  "events.mehendi.time": {
    en: "4:00 PM",
    hi: "४:०० अपराह्न",
    mr: "४:०० दुपारी",
  },

  "events.wedding.subtitle": {
    en: "The seven vows",
    hi: "सात वचन",
    mr: "सात वचनं",
  },
  "events.wedding.description": {
    en: "Under a canopy of marigolds, we take seven circles around a fire that will remember us long after the morning.",
    hi: "गेंदे की छाँव के नीचे, हम एक ऐसी अग्नि के सात फेरे लेते हैं जो इस सुबह के बाद भी हमें याद रखेगी।",
    mr: "झेंडूच्या मंडपाखाली, आम्ही अशा अग्नीभोवती सात फेरे घेतो जी या सकाळनंतरही आमची आठवण ठेवेल.",
  },
  "events.wedding.dressCode": {
    en: "Regal Reds & Ivory",
    hi: "शाही लाल और हाथीदाँती",
    mr: "राजेशाही लाल आणि हस्तिदंत",
  },
  "events.wedding.time": {
    en: "11:00 AM",
    hi: "११:०० पूर्वाह्न",
    mr: "११:०० सकाळी",
  },
  

  // ── Events (pre-localized long dates) ─────────────────
  "events.haldi.date": {
    en: "Thursday, 21 January 2027",
    hi: "गुरुवार, २१ जनवरी २०२७",
    mr: "गुरुवार, २१ जानेवारी २०२७",
  },
  "events.mehendi.date": {
    en: "Friday, 22 January 2027",
    hi: "शुक्रवार, २२ जनवरी २०२७",
    mr: "शुक्रवार, २२ जानेवारी २०२७",
  },
  "events.wedding.date": {
    en: "Saturday, 23 January 2027",
    hi: "शनिवार, २३ जनवरी २०२७",
    mr: "शनिवार, २३ जानेवारी २०२७",
  },

  // Short date for RSVP list
  "events.haldi.shortDate": {
    en: "21 Jan",
    hi: "२१ जन",
    mr: "२१ जाने",
  },
  "events.mehendi.shortDate": {
    en: "22 Jan",
    hi: "२२ जन",
    mr: "२२ जाने",
  },
  "events.wedding.shortDate": {
    en: "23 Jan",
    hi: "२३ जन",
    mr: "२३ जाने",
  },
  
  

  // ── Gallery ───────────────────────────────────────────
  "gallery.eyebrow": {
    en: "Moments",
    hi: "क्षण",
    mr: "क्षण",
  },
  "gallery.heading": {
    en: "Moments, in frames.",
    hi: "क्षण, तस्वीरों में।",
    mr: "क्षण, चित्रांमध्ये.",
  },
  "gallery.open_hint": {
    en: "Tap to view",
    hi: "देखने के लिए टैप करें",
    mr: "पाहण्यासाठी टॅप करा",
  },
  "gallery.close": {
    en: "Close",
    hi: "बंद करें",
    mr: "बंद करा",
  },
  "gallery.prev": {
    en: "Previous photo",
    hi: "पिछली तस्वीर",
    mr: "मागील फोटो",
  },
  "gallery.next": {
    en: "Next photo",
    hi: "अगली तस्वीर",
    mr: "पुढील फोटो",
  },
  "gallery.viewer": {
    en: "Photo viewer",
    hi: "तस्वीर दर्शक",
    mr: "फोटो दर्शक",
  },
  "gallery.go_to": {
    en: "Go to photo",
    hi: "तस्वीर पर जाएं",
    mr: "फोटोवर जा",
  },

  // ── Countdown ─────────────────────────────────────────
  "countdown.eyebrow": {
    en: "Counting down",
    hi: "उलटी गिनती",
    mr: "मोजणी सुरू",
  },
  "countdown.heading_lead": {
    en: "until we say",
    hi: "जब तक हम कहें",
    mr: "आम्ही म्हणेपर्यंत",
  },
  "countdown.heading_highlight": {
    en: "\u201CI do.\u201D",
    hi: "\u201Cहाँ\u201D।",
    mr: "\u201Cहोय\u201D.",
  },
  "countdown.days": { en: "Days", hi: "दिन", mr: "दिवस" },
  "countdown.hours": { en: "Hours", hi: "घंटे", mr: "तास" },
  "countdown.minutes": { en: "Minutes", hi: "मिनट", mr: "मिनिटे" },
  "countdown.seconds": { en: "Seconds", hi: "सेकंड", mr: "सेकंद" },
  "countdown.happening": {
    en: "It\u2019s happening. Welcome.",
    hi: "यह हो रहा है। स्वागत है।",
    mr: "हे घडतंय. स्वागत आहे.",
  },
  "countdown.cta_drag": {
    en: "Tap here to reveal without scratching",
    hi: "बिना खुरचे तारीख देखने के लिए यहाँ टैप करें",
    mr: "स्क्रॅच न करता तारीख पाहण्यासाठी येथे टॅप करा",
  },
  "countdown.cta_hide": {
    en: "Hide the date",
    hi: "तिथि छुपाएँ",
    mr: "तारीख लपवा",
  },
  "countdown.married.eyebrow": {
    en: "Just married",
    hi: "अभी-अभी विवाह हुआ",
    mr: "नुकतेच विवाह झाले",
  },
  "countdown.married.heading": {
    en: "Mr. & Mrs. Varshney",
    hi: "श्री एवं श्रीमती वार्ष्णेय",
    mr: "श्री. आणि सौ. वार्ष्णेय",
  },
  "countdown.married.body": {
    en: "Since the twenty-third of January, two thousand and twenty-seven.",
    hi: "तेईस जनवरी, दो हज़ार सत्ताईस से।",
    mr: "तेविस जानेवारी, दोन हजार सत्तावीस पासून.",
  },
  "countdown.married.thanks": {
    en: "Thank you for being part of our forever.",
    hi: "हमारी कहानी का हिस्सा बनने के लिए धन्यवाद।",
    mr: "आमच्या कथेचा भाग झाल्याबद्दल धन्यवाद.",
  },

  // ── RSVP ──────────────────────────────────────────────
  "rsvp.eyebrow": {
    en: "Your reply",
    hi: "आपका उत्तर",
    mr: "आपले उत्तर",
  },
  "rsvp.heading_a": {
    en: "Will you be",
    hi: "क्या आप",
    mr: "तुम्ही",
  },
  "rsvp.heading_b": {
    en: "there?",
    hi: "आएँगे?",
    mr: "याल का?",
  },
  "rsvp.stage.name.title": {
    en: "First, who is this?",
    hi: "पहले बताइए, यह कौन है?",
    mr: "प्रथम सांगा, आपण कोण?",
  },
  "rsvp.stage.name.placeholder": {
    en: "Your full name",
    hi: "आपका पूरा नाम",
    mr: "आपले पूर्ण नाव",
  },
  "rsvp.continue": {
    en: "Continue →",
    hi: "आगे →",
    mr: "पुढे →",
  },
  "rsvp.stage.attending.title": {
    en: "Hi {name}. Will you be with us?",
    hi: "नमस्ते {name}। क्या आप हमारे साथ होंगे?",
    mr: "नमस्कार {name}. आपण आमच्यासोबत असाल का?",
  },
  "rsvp.stage.attending.yes": {
    en: "Yes, always",
    hi: "हाँ, हमेशा",
    mr: "होय, नक्कीच",
  },
  "rsvp.stage.attending.no": {
    en: "Regretfully no",
    hi: "क्षमा कीजिए, नहीं",
    mr: "क्षमस्व, नाही",
  },
  "rsvp.stage.events.title": {
    en: "Which celebrations shall we keep a seat for you at?",
    hi: "किन समारोहों में हम आपके लिए स्थान रखें?",
    mr: "कोणत्या सोहळ्यांमध्ये आम्ही आपल्यासाठी जागा ठेवू?",
  },
  "rsvp.stage.message.title": {
    en: "One line, for the memory wall?",
    hi: "एक पंक्ति, यादों की दीवार के लिए?",
    mr: "एक ओळ, आठवणींच्या भिंतीसाठी?",
  },
  "rsvp.stage.message.placeholder": {
    en: "A wish, a memory, a joke only we will get...",
    hi: "एक शुभकामना, एक याद, एक मज़ाक जो सिर्फ़ हम समझेंगे...",
    mr: "एक शुभेच्छा, एक आठवण, एक विनोद जो फक्त आम्हालाच कळेल...",
  },
  "rsvp.stage.message.submit": {
    en: "Seal my reply →",
    hi: "मेरा उत्तर बंद कीजिए →",
    mr: "माझे उत्तर बंद करा →",
  },
  "rsvp.done.received": {
    en: "Thank you!",
    hi: "धन्यवाद!",
    mr: "धन्यवाद!",
  },
  "rsvp.done.yesMsg": {
    en: "{count} stamps added to your passport. See you soon, {name}.",
    hi: "आपके पासपोर्ट में {count} मोहरें जुड़ीं। जल्द मिलेंगे, {name}।",
    mr: "आपल्या पासपोर्टात {count} शिक्के जोडले. लवकरच भेटू, {name}.",
  },
  "rsvp.done.yesMsgSingular": {
    en: "1 stamp added to your passport. See you soon, {name}.",
    hi: "आपके पासपोर्ट में १ मोहर जुड़ी। जल्द मिलेंगे, {name}।",
    mr: "आपल्या पासपोर्टात १ शिक्का जोडला. लवकरच भेटू, {name}.",
  },
  "rsvp.done.noMsg": {
    en: "We will miss you, {name}. Your message will be read aloud.",
    hi: "हम आपको याद करेंगे, {name}। आपका संदेश सबके सामने पढ़ा जाएगा।",
    mr: "आम्ही आपली आठवण काढू, {name}. आपला संदेश सर्वांसमोर वाचला जाईल.",
  },
  "rsvp.submitting": {
    en: "Sealing…",
    hi: "भेज रहे हैं…",
    mr: "पाठवत आहोत…",
  },
  "rsvp.error.notConfigured": {
    en: "Our reply box isn't ready yet — please email akashvarshney117@gmail.com for now.",
    hi: "हमारी उत्तर-पेटी अभी तैयार नहीं है — कृपया akashvarshney117@gmail.com पर ईमेल करें।",
    mr: "आमची उत्तर-पेटी अद्याप तयार नाही — कृपया akashvarshney117@gmail.com वर ईमेल करा.",
  },
  "rsvp.error.generic": {
    en: "Something interrupted our reply. Please try once more.",
    hi: "उत्तर भेजते समय कुछ रुकावट आई। कृपया फिर प्रयास करें।",
    mr: "उत्तर पाठवताना काही अडचण आली. कृपया पुन्हा प्रयत्न करा.",
  },

  // ── Footer ────────────────────────────────────────────
  "footer.blessing": {
    en: "Your presence is our blessing.",
    hi: "आपकी उपस्थिति हमारा आशीर्वाद है।",
    mr: "आपली उपस्थिती आमचा आशीर्वाद आहे.",
  },
  "footer.questions": {
    en: "For questions,",
    hi: "किसी भी प्रश्न के लिए,",
    mr: "काही प्रश्नांसाठी,",
  },
  "footer.replay": {
    en: "↺ Replay intro",
    hi: "↺ परिचय दोबारा",
    mr: "↺ परिचय पुन्हा",
  },
  "footer.backRsvp": {
    en: "↑ Back to RSVP",
    hi: "↑ उत्तर पर वापस",
    mr: "↑ उत्तराकडे परत",
  },
  "footer.with_love": {
    en: "With all our love,",
    hi: "ढेर सारे प्यार के साथ,",
    mr: "आमच्या सर्व प्रेमासह,",
  },

  // ── Calendar ──────────────────────────────────────────
  "calendar.add": {
    en: "Add to Calendar",
    hi: "कैलेंडर में जोड़ें",
    mr: "कॅलेंडरमध्ये जोडा",
  },
  "calendar.add_short": {
    en: "Calendar",
    hi: "कैलेंडर",
    mr: "कॅलेंडर",
  },
  "calendar.google": {
    en: "Google Calendar",
    hi: "Google कैलेंडर",
    mr: "Google कॅलेंडर",
  },
  "calendar.outlook": {
    en: "Outlook",
    hi: "Outlook",
    mr: "Outlook",
  },
  "calendar.apple_ics": {
    en: "Apple · Other (.ics)",
    hi: "Apple · अन्य (.ics)",
    mr: "Apple · इतर (.ics)",
  },
  "calendar.all_ceremonies_hint": {
    en: "Includes all four ceremonies",
    hi: "सभी चार समारोह शामिल",
    mr: "सर्व चार सोहळे समाविष्ट",
  },
  "calendar.main_wedding_hint": {
    en: "Main wedding ceremony only",
    hi: "केवल मुख्य विवाह समारोह",
    mr: "फक्त मुख्य विवाह सोहळा",
  },
  "calendar.event_title": {
    en: "{groom} & {bride} — {ceremony}",
    hi: "{groom} & {bride} — {ceremony}",
    mr: "{groom} & {bride} — {ceremony}",
  },
  "calendar.event_description_main": {
    en: "Please join us to celebrate our wedding.",
    hi: "कृपया हमारे विवाह समारोह में शामिल हों।",
    mr: "कृपया आमच्या विवाह सोहळ्यात सहभागी व्हा.",
  },
  "calendar.venue_tbd": {
    en: "Venue to be announced",
    hi: "स्थान की घोषणा बाद में",
    mr: "स्थळ लवकरच जाहीर करू",
  },

  // ── Venue ─────────────────────────────────────────────
  "venue.eyebrow": {
    en: "Where it happens",
    hi: "स्थान",
    mr: "ठिकाण",
  },
  "venue.heading": {
    en: "The venue",
    hi: "स्थान का विवरण",
    mr: "स्थळाचा तपशील",
  },
  "venue.directions": {
    en: "Get directions",
    hi: "मार्गदर्शन पाएँ",
    mr: "दिशानिर्देश मिळवा",
  },
  "venue.tbd_heading": {
    en: "Revealing soon",
    hi: "जल्द बताएँगे",
    mr: "लवकरच सांगू",
  },
  "venue.tbd_body": {
    en: "We are finalising the venue. It will appear here — with directions and a map — the moment it's confirmed.",
    hi: "हम स्थान तय कर रहे हैं। तय होते ही यहाँ मार्गदर्शन और नक्शे के साथ दिखाई देगा।",
    mr: "आम्ही स्थळ निश्चित करत आहोत. ठरताच ते येथे मार्गदर्शन व नकाशासह दिसेल.",
  },
  "venue.opening_directions": {
    en: "Opening directions…",
    hi: "मार्गदर्शन खुल रहा है…",
    mr: "दिशानिर्देश उघडत आहे…",
  },
  "venue.breakdown.eyebrow": {
    en: "Every ceremony, every door",
    hi: "हर रस्म, हर द्वार",
    mr: "प्रत्येक विधी, प्रत्येक द्वार",
  },
  "venue.breakdown.heading": {
    en: "Where each ceremony lives",
    hi: "हर रस्म कहाँ होगी",
    mr: "प्रत्येक विधी कुठे होईल",
  },
  "venue.breakdown.tentative": {
    en: "Tentative",
    hi: "संभावित",
    mr: "संभाव्य",
  },
  "venue.breakdown.tentative_note": {
    en: "Being finalised — we'll update this here the moment it's locked in.",
    hi: "अंतिम निर्णय बाकी है — पक्का होते ही यहाँ अद्यतन कर देंगे।",
    mr: "अंतिम निर्णय प्रलंबित — निश्चित होताच येथे अद्ययावत करू.",
  },
  "venue.breakdown.tbd": {
    en: "To be announced",
    hi: "जल्द ही घोषणा",
    mr: "लवकरच जाहीर",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function translate(
  key: TranslationKey,
  lang: Language,
  vars?: Record<string, string>,
): string {
  const entry = translations[key];
  let out: string = entry[lang] ?? entry.en;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{${k}}`, v);
    }
  }
  return out;
}
