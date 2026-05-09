"use client";

const sections = [
  {
    title: "ലോഗിൻ / Login",
    items: [
      "ഡാഷ്ബോർഡ് ആക്സസ് ചെയ്യാൻ admin@gulfsathyadhara.com ഉം പാസ്‌വേഡും ഉപയോഗിക്കുക.",
      "ലോഗ്‌ഔട്ട് ചെയ്യാൻ സൈഡ്‌ബാറിന്റെ താഴെ ഇടത് ഭാഗത്തുള്ള Logout ബട്ടൺ അമർത്തുക.",
    ],
  },
  {
    title: "മാഗസിൻ / Magazines",
    items: [
      "Magazines → + New Issue ക്ലിക്ക് ചെയ്ത് പുതിയ ലക്കം ചേർക്കാം.",
      "ടൈറ്റിൽ, മാസം, വർഷം, കവർ ഇമേജ് തുടങ്ങിയവ നൽകണം.",
      "Publish ബട്ടൺ ഉപയോഗിച്ച് ലക്കം ആപ്പിൽ കാണിക്കാം അല്ലെങ്കിൽ മറയ്ക്കാം (Draft).",
      "കവർ ഇമേജ് Portrait (vertical) അനുപാതത്തിൽ അപ്‌ലോഡ് ചെയ്യുക.",
    ],
  },
  {
    title: "ആർട്ടിക്കിൾ / Articles",
    items: [
      "Articles → + New Article ക്ലിക്ക് ചെയ്ത് ലേഖനം ചേർക്കാം.",
      "ഒരു ആർട്ടിക്കിൾ ഒരു Magazine Issue-മായി ബന്ധിപ്പിക്കാം.",
      "ഇമേജ്, ക്വോട്ട്, ഇൻലൈൻ ഇമേജ് എന്നിവ ചേർക്കാൻ കഴിയും.",
    ],
  },
  {
    title: "ഉപഭോക്താക്കൾ / Users",
    items: [
      "+ Add User ക്ലിക്ക് ചെയ്ത് അംഗങ്ങളെ ചേർക്കാം.",
      "Mobile നമ്പർ 971 കൊണ്ടു തുടങ്ങണം (ഉദാ: 971501234567).",
      "▼ Subs ബട്ടൺ ക്ലിക്ക് ചെയ്ത് ആ ഉപഭോക്താവിന്റെ Subscription ചരിത്രം കാണാം.",
      "+ Add Subscription ക്ലിക്ക് ചെയ്ത് Amount, Period, Paid Date ചേർക്കാം.",
      "Subscription ചേർക്കുമ്പോൾ ഉപഭോക്താവിന്റെ ഇമെയിലിലേക്ക് Receipt അയക്കും.",
      "Print ബട്ടൺ ഉപയോഗിച്ച് Receipt പ്രിന്റ് ചെയ്യാം.",
      "WhatsApp Reminder ബട്ടൺ ഉപയോഗിച്ച് Expiry നോട്ടിഫിക്കേഷൻ അയക്കാം.",
      "Deactivate ക്ലിക്ക് ചെയ്ത് ഉപഭോക്താവിനെ നിഷ്ക്രിയമാക്കാം; Activate ചെയ്ത് തിരികെ ആക്ടീവ് ആക്കാം.",
      "ആക്ടീവ് Subscription ഉള്ള ഉപഭോക്താക്കളെ Delete ചെയ്യാൻ കഴിയില്ല.",
      "Delete ചെയ്ത ഉപഭോക്താക്കളെ Deleted Users പേജിൽ കാണാം.",
    ],
  },
  {
    title: "വാർത്ത / News & Blogs",
    items: [
      "News & Blogs → Categories വിഭാഗത്തിൽ ആദ്യം Category ചേർക്കുക (Duplicate അനുവദിക്കില്ല).",
      "Add News Item ഉപയോഗിച്ച് ടൈറ്റിൽ, ഉള്ളടക്കം, ഇമേജ്, Published Date ചേർക്കാം.",
      "Published Date auto-fill ആകും, ആവശ്യമെങ്കിൽ Date Picker ഉപയോഗിച്ച് മാറ്റാം.",
    ],
  },
  {
    title: "ഇവന്റ് / Events",
    items: [
      "Events → Add Event ക്ലിക്ക് ചെയ്ത് ടൈറ്റിൽ, Date Picker, Poster Image, Description ചേർക്കാം.",
      "Events Home Page-ലെ Slider-ൽ കാണിക്കും.",
    ],
  },
  {
    title: "ഹോം സ്ലൈഡർ / Home Slider",
    items: [
      "Slider → Add Slide ഉപയോഗിച്ച് ബാനർ ഇമേജ്, Poster, Title, Details, Website, Contact ചേർക്കാം.",
      "Sort Order നൽകി slides-ന്റെ ക്രമം നിർണ്ണയിക്കാം (0, 1, 2… Lower = First).",
      "Edit ക്ലിക്ക് ചെയ്ത് ഏത് Slide-ഉം തിരുത്താം; Cancel ചെയ്ത് ഫോം ക്ലിയർ ആകും.",
    ],
  },
  {
    title: "ടിക്കർ / Running Ticker",
    items: [
      "Settings → Running Ticker വിഭാഗത്തിൽ Message Text ടൈപ്പ് ചെയ്ത് Enable Toggle ഓൺ ചെയ്യുക.",
      "Save Ticker ക്ലിക്ക് ചെയ്ത് Save ആക്കുക.",
      "ടിക്കർ App Home Page-ൽ Logo Bar-ന്റെ ചുവടെ Gold Bar ആയി scroll ചെയ്ത് കാണിക്കും.",
    ],
  },
  {
    title: "WhatsApp ടെംപ്ലേറ്റ് / WhatsApp Template",
    items: [
      "Settings → WhatsApp Notification Template-ൽ Malayalam Message ടൈപ്പ് ചെയ്യാം.",
      "{name}, {expiry}, {amount} എന്നിവ Auto Replace ആകും.",
      "'Load default Malayalam template' ക്ലിക്ക് ചെയ്ത് Default Template ലോഡ് ചെയ്യാം.",
    ],
  },
  {
    title: "SMTP Email / ഇമെയിൽ",
    items: [
      "Settings → SMTP Settings-ൽ Host, Port, Username, Password, From Name, Admin Email ചേർക്കുക.",
      "Gmail ഉപയോഗിക്കുന്നവർ App Password ഉപയോഗിക്കുക (Google Account → Security → App Passwords).",
      "Subscription Receipt Automatically ഉപഭോക്താവിന് അയക്കും.",
    ],
  },
  {
    title: "ആർട്ട് / Art & Galleries",
    items: [
      "Art Categories-ൽ Categories ചേർക്കുക (Duplicate അനുവദിക്കില്ല).",
      "Art-ൽ ചിത്രങ്ങൾ, Description, Author, Magazine Issue ചേർക്കാം.",
      "Galleries-ൽ Article-ഉമായി ബന്ധിപ്പിച്ച് ഗ്യാലറി ചിത്രങ്ങൾ ചേർക്കാം.",
    ],
  },
  {
    title: "വീഡിയോ / Videos",
    items: [
      "Videos → Add Category → Add Video (YouTube Link).",
      "Category Duplicate ചേർക്കാൻ കഴിയില്ല.",
      "YouTube Thumbnail Auto Preview ആകും.",
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-2xl" lang="ml">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-gray-900">Help / സഹായം</h1>
        <p className="text-[13px] text-gray-500 mt-1 font-inter">Gulf Sathyadhara Admin Dashboard — User Manual (Malayalam)</p>
      </div>

      <div className="space-y-4">
        {sections.map((sec) => (
          <div key={sec.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-[14px] font-semibold text-gray-800 font-malayalam">{sec.title}</h2>
            </div>
            <ul className="px-5 py-4 space-y-2.5">
              {sec.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-gray-700 leading-relaxed">
                  <span className="flex-shrink-0 mt-1 w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="font-malayalam">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5 text-[13px] text-blue-700">
        <strong className="font-inter">Support:</strong>{" "}
        <span className="font-malayalam">സഹായത്തിനായി Admin-നെ ബന്ധപ്പെടുക. Default Login: admin@gulfsathyadhara.com</span>
      </div>
    </div>
  );
}
