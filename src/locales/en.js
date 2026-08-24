export default {
  navbar: {
    examples: "Examples",
    reviews: "Reviews",
    faq: "FAQ",
    login: "Login",
    start: "Get Started"
  },
  hero: {
    badge1: "Birthday 🎂",
    badge2: "Wedding 💍",
    badge3: "Baptism 👶",
    pill: "Emotion in music",
    subtitle: "#1 AI music creation platform",
    titleLine1: "Create a song",
    titleLine2: "in 3 minutes",
    description: "Birthdays, Weddings, Baptisms, Tributes... Turn your messages into unforgettable songs with AI.",
    cta: "Create my song",
    socialProof: "Used by over",
    users: "users",
    ticker: ["ENCOURAGEMENT", "BIRTHDAY", "WEDDING", "BAPTISM", "DOWRY", "THANK YOU", "RECONCILIATION", "DECLARATION", "LOVE"]
  },
  playlist: {
    titlePrefix: "They created this with",
    subtitle: "Listen to examples of personalized songs created for unique moments.",
    items: [
      { category: "Birthday", category2: "Party", title: "Joyeux Anniversaire Rodrigez", style: "Rumba", img: "https://cdn2.suno.ai/image_3e1be834-fc58-4e19-91e7-bbf12febbe4b.jpeg", audio_url: "https://cdn1.suno.ai/3e1be834-fc58-4e19-91e7-bbf12febbe4b.mp3" },
      { category: "Love", category2: "Romance", title: "Pour ma femme Déborah", style: "Style Roumba", img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&h=500&fit=crop", audio_url: "https://cdn1.suno.ai/0cd32548-7db0-45fc-b179-805909e83908.mp3" },
      { category: "Tribute", category2: "Love", title: "Bolingo ya Seko", style: "Rumba Congolaise", img: "https://cdn2.suno.ai/image_780812a2-b26e-4c14-9194-a579fb235127.jpeg", audio_url: "https://cdn1.suno.ai/780812a2-b26e-4c14-9194-a579fb235127.mp3" },
      { category: "Victory", category2: "Success", title: "Le Triomphe de Dieu Merci", style: "Amapiano", img: "https://cdn2.suno.ai/image_91d39720-9688-40df-964f-724bdfc57e83.jpeg", audio_url: "https://cdn1.suno.ai/91d39720-9688-40df-964f-724bdfc57e83.mp3" }
    ]
  },
  testimonials: {
    titlePrefix: "They marked the",
    titleHighlight: "occasion",
    subtitle: "Discover how they enhanced their events with a unique song.",
    items: [
      { quote: "I created a song for my sister's wedding entrance. Everyone cried with emotion. It was magical!", author: "Dieu Merci Kambale", category: "Wedding" },
      { quote: "For my father's 50th, we made a Highlife style song telling his story. Best gift of the evening.", author: "Rodriguez Essabe", category: "Birthday" },
      { quote: "Fast, great quality, and we can really put our own jokes in the lyrics. We loved it.", author: "Bénit Mvioki", category: "Party" }
    ]
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about Ndules.",
    items: [
      { q: "Can I mention names in the song?", a: "Absolutely! The AI is trained to naturally integrate names into the lyrics of your song." },
      { q: "For what occasions can I create a song?", a: "All occasions are good: weddings, birthdays, retirements, declarations of love, or just for fun." },
      { q: "Can I choose the musical style?", a: "Yes, you have a choice of many styles: Afrobeat, Rap, Amapiano, Pop, Acoustic, Rumba, and many more." },
      { q: "How do I receive my song?", a: "Once generated, you can listen to it directly on the platform and download it in MP3 format." }
    ]
  },
  footer: {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "contact@ndules.com",
    copyright: "Ndules. Music for everyone."
  },
  privacyPage: {
    title: "Privacy Policy",
    lastUpdated: "Last updated:",
    section1Title: "1. Data Collection",
    section1Text: "We collect the information you provide directly to us when you use Ndules, including the texts, first names, and descriptions you submit to generate a song.",
    section2Title: "2. Use of Artificial Intelligence",
    section2Text: "The data you submit is processed by our artificial intelligence algorithms to generate musical works. This data is not used to train our AI models without your explicit consent.",
    section3Title: "3. Data Sharing",
    section3Text: "We do not sell or rent your personal data to third parties. Your generated songs remain private unless you choose to share them publicly via a link.",
    section4Title: "4. Your Rights",
    section4Text: "In accordance with the GDPR, you have a right to access, rectify, and delete your data. You can exercise this right by contacting us at"
  },
  termsPage: {
    title: "Terms of Service",
    lastUpdated: "Last updated:",
    section1Title: "1. Purpose",
    section1Text: "These Terms of Service govern the access and use of the Ndules service, an Artificial Intelligence music generator.",
    section2Title: "2. Intellectual Property",
    section2Text: "Users retain all exploitation rights on the songs generated via the Ndules platform, subject to compliance with the rights of third parties (including the prohibition of using texts protected by copyright).",
    section3Title: "3. Acceptable Use",
    section3Text: "You agree not to use Ndules to generate hateful, discriminatory, illegal content or content inciting violence. Any breach of this rule will result in the immediate suspension of the account.",
    section4Title: "4. Limitation of Liability",
    section4Text: "Ndules is provided \"as is\". Although we strive to provide a high quality service, we cannot guarantee that the generated works will exactly match your subjective expectations."
  },
  dashboard: {
    welcome: "Welcome to your space, Creator",
    subtitle: "Generate music, manage your subscription and listen to your latest creations.",
    aiGenerator: {
      title: "Generate Music",
      promptPlaceholder: "Describe the music you want to create (e.g. A sweet love song with acoustic guitar for Sophie and Marc's wedding...)",
      styleLabel: "Musical Style",
      styleOptions: ["Afrobeat", "Amapiano", "Rumba", "Acoustic", "Pop", "Rap", "R&B", "Electro"],
      moodLabel: "Mood",
      moodOptions: ["Happy", "Romantic", "Energetic", "Nostalgic", "Epic", "Relaxed"],
      generateButton: "Generate with AI",
      generatingButton: "Creating...",
      creditsCost: "Cost: 1 credit",
      progressSteps: {
        analyzing: "Analyzing prompt...",
        composing: "Composing melody...",
        mastering: "Audio mastering..."
      }
    },
    subscription: {
      title: "My Subscription",
      currentPlan: "Current Plan",
      planName: "Premium",
      creditsLeft: "Credits left",
      creditsAmount: "24",
      renewsOn: "Renews on",
      renewsDate: "August 12, 2026",
      upgradeButton: "Upgrade my plan",
      manageButton: "Manage subscription",
      featuresTitle: "Included in Premium:",
      features: [
        "30 generations per month",
        "High-Resolution audio quality",
        "Unlimited MP3 downloads",
        "Commercial use rights"
      ]
    },
    sidebar: {
      storageTitle: "Storage Space",
      storageUsed: "2.4 GB",
      storageTotal: "5 GB",
      quickLinksTitle: "Quick Links",
      links: [
        "Creation Tutorials",
        "Contact Support",
        "Manage Invoices"
      ]
    },
    recentTracks: {
      title: "My Recent Creations",
      noTracks: "You haven't generated any music yet.",
      play: "Play",
      pause: "Pause",
      delete: "Delete",
      download: "Download",
      generatedTitle: "AI Creation - "
    },
    modals: {
      close: "Close",
      upgradeTitle: "Choose a new plan",
      currentPlanBadge: "Active",
      selectPlan: "Select this plan",
      plans: [
        { name: "Creator", price: "$9 / month", credits: 10, desc: "Perfect for getting started and testing AI music." },
        { name: "Premium", price: "$24 / month", credits: 30, desc: "For music lovers and content creators." },
        { name: "Pro Studio", price: "$49 / month", credits: 100, desc: "Unlimited generations in studio WAV quality." }
      ],
      manageTitle: "Subscription Management",
      manageStatus: "Your subscription is currently active and renews automatically.",
      cardInfo: "Credit card **** **** **** 4242",
      cancelBtn: "Pause subscription",
      tutoTitle: "Tutorial: 3 keys for a perfect prompt",
      tutoSteps: [
        { title: "1. Be descriptive about emotion", text: "State the main mood: happy, nostalgic, celebratory..." },
        { title: "2. Specify the instruments", text: "Mention for example: soft acoustic guitar, saxophone, tribal beats." },
        { title: "3. Add context", text: "Tell the AI who the song is for (mom's birthday, wedding, tribute)." }
      ],
      supportTitle: "Contact Ndules Support",
      supportSubject: "Subject of your request",
      supportMessage: "Your message...",
      supportSend: "Send message",
      supportSent: "Message sent successfully! Our team will reply within 24h.",
      invoicesTitle: "Your Invoice History",
      invoices: [
        { date: "12 Jul 2026", amount: "€24.00", ref: "INV-2026-07" },
        { date: "12 Jun 2026", amount: "€24.00", ref: "INV-2026-06" },
        { date: "12 May 2026", amount: "€24.00", ref: "INV-2026-05" }
      ],
      downloadPdf: "Download PDF"
    }
  },
  dashboardMenu: {
    home: "Home",
    create: "Create",
    explore: "Explore",
    music: "My Music",
    shorts: "Shorts",
    stats: "Stats",
    credits: "Credits",
    logout: "Logout"
  },
  pages: {
    dashboardHome: {
      greetingMorning: "Good morning",
      greetingEvening: "Good evening",
      dashboard: "Dashboard",
      recentSongs: "Recent songs",
      noSongs: "No songs generated yet.",
      createSong: "Create a song",
      createSongDesc: "Afrobeat, Amapiano, R&B..."
    },
    myMusic: {
      title: "My Music",
      createFirst: "Create my first song",
      live: "Live",
      listensCount: "Play(s)",
      tabAll: "All",
      tabFav: "Favorites",
      noFavs: "You don't have any favorites yet.",
      noSongsDesc: 'You haven\'t generated any songs yet. Click on "Create my first song"!',
      btnShare: "Share",
      btnPublish: "Publish",
      btnPublished: "Published",
      btnRemix: "Remix",
      btnViewShort: "View Short",
      btnClipShort: "Clip Short (1 credit)",
      msgAlreadyPublished: "This song is already published!",
      msgPublishSuccess: "Congratulations! Your song has been published in Explorer.",
      msgPublishError: "Error during publication. Please try again.",
      msgCopied: "Link copied to clipboard!",
      msgFavAdded: "Added to favorites!",
      msgFavError: "Error updating favorites.",
      noCreditsTitle: "No more credits available!",
      noCreditsDesc: "You have no credits left to generate new songs. Buy credits to continue creating your musical masterpieces.",
      btnCancel: "Cancel",
      btnBuyCredits: "Buy credits"
    },
    explore: {
      title: "Trending Now",
      searchPlaceholder: "Search for a song...",
      filterAll: "All",
      filterPop: "Pop",
      filterRap: "Rap",
      noTracks: "No songs found.",
      aiGenerated: "An original AI-generated creation"
    },
    stats: {
      title: "Statistics",
      subtitle: "Track the performance of your creations",
      listens: "Plays",
      likes: "Likes",
      downloads: "Downloads",
      listenTime: "Play time",
      listen7Days: "Plays in the last 7 days",
      popularSongs: "Your popular songs",
      recentActivity: "Recent activity",
      songs: "Songs",
      noSongs: "You haven't generated any songs yet.",
      noActivity: "No recent activity"
    },
    shorts: {
      title: "Studio Shorts",
      subtitle: "AI Video Generator",
      desc: "Turn your songs into video clips for social media.",
      shareText: "Watch this Short Clip",
      shareTextLink: "Watch this Ndules Clip",
      linkCopied: "Clip link copied!",
      deleteError: "Error deleting the Short.",
      description: "Turn your music into viral vertical videos (9:16) for TikTok, Instagram Reels, and YouTube Shorts. Select a song to get started.",
      loading: "Loading your Shorts...",
      noShorts: "You haven't generated a Short yet. Go to the Dashboard to get started!",
      view: "View Short",
      share: "Share",
      delete: "Delete",
      isReady: "✓ Your Short is ready!"
    },
    credits: {
      title: "Buy Credits",
      subtitle: "1 song = 1 Credit",
      currency: "US USD",
      decouverte: "Discovery",
      populaire: "Popular",
      premium: "Premium",
      credits: "Credits",
      promoCode: "I have a promo code",
      socialProof: "Used by 171K+ users",
      continue: "Continue",
      preparing: "Preparing...",
      howItWorks: "How it works?",
      point1: "Buy Credits as needed",
      point2: "1 Credit = 1 personalized song",
      point3: "Your Credits never expire"
    },
    login: {
      title: "Welcome to Ndules",
      subtitle: "The world's first AI music generator",
      google: "Continue with Google",
      error: "An error occurred during login."
    },
    modals: {
      publishTitle: "Share with the world",
      visibility: "More visibility",
      getLikes: "Get likes",
      publishBtn: "Publish",
      createShortTitle: "Create a Short Clip",
      animatedLyrics: "Animated lyrics included",
      chooseMoment: "Choose the moment you want to celebrate",
      tellStoryTitle: "Tell your story",
      tellStoryDesc: "Describe what you want in your song",
      chooseVoice: "Choose the voice type for your song",
      yourLyricsTitle: "Your lyrics",
      yourLyricsDesc: "Edit if needed before creating",
      songTitleLabel: "Song title",
      lyricsLabel: "Lyrics",
      progress: "Progress",
      findInMyMusic: "Find your song in My Music",
      publishDescription: "will be visible to the entire community in Explorer.",
      inspire: "Inspire other creators",
      later: "Later",
      createShortDesc: "Turn {title} into a vertical video perfect for TikTok, Instagram Reels or YouTube Shorts.",
      errorNotEnoughNotes: "You don't have enough Credits to generate a video clip.",
      errorDeductNote: "Unable to deduct the Credit. Check your balance.",
      errorSaveVideo: "The video was generated but could not be saved.",
      errorUnexpected: "An unexpected error occurred."
    },
    player: {
      nowPlaying: "Now playing"
    }
  }
};
