const heroCoverGridItems = [
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/570/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/578080/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1716740/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4000/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1151640/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1238810/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1238840/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1811260/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1053680/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/892970/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/381210/library_600x900.jpg",
];

const getRowItems = (row) => {
  const items = [...heroCoverGridItems];
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = (row * 7 + index) % items.length;
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return [...items, ...items, ...items];
};

export const siteData = {
  currentYear: new Date().getFullYear(),
  navigation: [
    {
      label: "Bütün Məhsullar",
      action: "AllProducts",
      icon: "solar:widget-5-bold-duotone",
    },
    {
      label: "PlayStation",
      action: "PlayStation",
      icon:
        '<svg width="19" height="15" viewBox="0 0 19 15" fill="currentColor"><path d="M18.8316 11.4803C18.4603 11.9594 17.5509 12.3009 17.5509 12.3009L10.7868 14.7865V12.9529L15.7649 11.1379C16.3297 10.9315 16.416 10.6385 15.9574 10.485C15.4989 10.3315 14.6689 10.3747 14.1032 10.5829L10.7868 11.7776V9.87618L10.9777 9.80912C10.9777 9.80912 11.9363 9.46235 13.2836 9.30971C14.6318 9.15794 16.2822 9.33088 17.5776 9.83294C19.0372 10.305 19.2013 11.0012 18.8316 11.4803ZM11.4302 8.35853V3.67235C11.4302 3.12176 11.3309 2.61529 10.8257 2.47235C10.4397 2.34529 10.1996 2.71235 10.1996 3.26206V15L7.10514 13.995V0C8.42046 0.249706 10.3377 0.840882 11.3681 1.19559C13.9892 2.11588 14.8779 3.26206 14.8779 5.84294C14.8779 8.35853 13.3596 9.31147 11.4302 8.35853ZM1.42671 12.7624C-0.072566 12.33 -0.322158 11.43 0.360981 10.9121C0.992301 10.4338 2.06667 10.0738 2.06667 10.0738L6.50405 8.45912V10.2997L3.31031 11.4688C2.74635 11.6753 2.65999 11.9682 3.11772 12.1218C3.57717 12.2762 4.40713 12.2321 4.97195 12.0247L6.50405 11.4565V13.1021L6.19832 13.155C4.66622 13.4109 3.03481 13.3041 1.42671 12.7624Z"/></svg>',
    },
    {
      label: "Xbox",
      action: "Xbox",
      icon:
        '<svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor"><path d="M2.56501 13.146C3.93002 14.3432 5.68435 15.0023 7.5 15C9.31681 15.0025 11.0724 14.3435 12.4387 13.146C13.6117 11.9505 9.741 7.7025 7.5 6.00975C5.26125 7.7025 1.38751 11.9505 2.56351 13.146M9.5385 4.14225C11.1007 5.9925 14.2155 10.5877 13.3357 12.2122C14.4153 10.8799 15.003 9.21632 15 7.5015C15.0013 6.50862 14.8046 5.52545 14.4215 4.60946C14.0384 3.69348 13.4765 2.86306 12.7687 2.16675C12.7687 2.16675 12.7515 2.15325 12.7177 2.1405C12.6613 2.12109 12.6019 2.11145 12.5422 2.112C12.1717 2.112 11.301 2.38425 9.5385 4.14225ZM2.28376 2.14125C2.24776 2.154 2.23276 2.16675 2.22976 2.1675C1.52224 2.86393 0.96065 3.69441 0.577801 4.61039C0.194952 5.52637 -0.0014729 6.50948 8.31521e-06 7.50225C8.31521e-06 9.2865 0.624008 10.923 1.66276 12.2107C0.788257 10.5825 3.90075 5.991 5.46375 4.14225C3.70125 2.3835 2.829 2.1135 2.46001 2.1135C2.40014 2.11147 2.34048 2.12142 2.28451 2.14275L2.28376 2.14125ZM7.5 2.21925C7.5 2.21925 5.6595 1.14225 4.2225 1.09125C3.65775 1.071 3.31275 1.27575 3.2715 1.30275C4.6125 0.40425 6.0375 0 7.491 0H7.5C8.95875 0 10.3785 0.4035 11.7285 1.30275C11.6865 1.27425 11.3445 1.07025 10.779 1.09125C9.34125 1.14225 7.5 2.21625 7.5 2.21625V2.21925Z"/></svg>',
    },
    {
      label: "Servislər",
      action: "Servislər",
      icon:
        '<svg width="13" height="14" viewBox="0 0 13 14" fill="currentColor"><path d="M2.52778 0H10.4722C10.5843 0 10.6949 0.0253015 10.7952 0.0739009C10.8955 0.1225 10.9827 0.193063 11.05 0.28L13 2.8V13.3C13 13.4857 12.9239 13.6637 12.7885 13.795C12.653 13.9263 12.4693 14 12.2778 14H0.722222C0.530677 14 0.346977 13.9263 0.211534 13.795C0.076091 13.6637 0 13.4857 0 13.3V2.8L1.95 0.28C2.01727 0.193063 2.10451 0.1225 2.20479 0.0739009C2.30507 0.0253015 2.41566 0 2.52778 0ZM11.1944 2.8L10.1111 1.4H2.88889L1.80556 2.8H11.1944ZM4.33333 5.6H2.88889V7C2.88889 7.92826 3.26934 8.8185 3.94656 9.47487C4.62377 10.1313 5.54227 10.5 6.5 10.5C7.45773 10.5 8.37623 10.1313 9.05344 9.47487C9.73066 8.8185 10.1111 7.92826 10.1111 7V5.6H8.66667V7C8.66667 7.55695 8.43839 8.0911 8.03206 8.48492C7.62574 8.87875 7.07464 9.1 6.5 9.1C5.92536 9.1 5.37426 8.87875 4.96794 8.48492C4.56161 8.0911 4.33333 7.55695 4.33333 7V5.6Z"/></svg>',
    },
    {
      label: "Valyuta",
      action: "Oyun Valyutası",
      icon:
        '<svg width="14" height="14" viewBox="0 0 401.601 401.6" fill="currentColor"><path d="M116.682,229.329c11.286,0,22.195-0.729,32.518-2.086V114.094c-10.322-1.356-21.232-2.085-32.518-2.085 c-64.441,0-116.681,23.693-116.681,52.921v11.477C0.001,205.634,52.241,229.329,116.682,229.329z"/><path d="M116.682,288.411c11.286,0,22.195-0.729,32.518-2.084v-33.166c-10.325,1.356-21.229,2.095-32.518,2.095 c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.5-2.454,7.124-2.454,10.839v11.477 C0.001,264.718,52.241,288.411,116.682,288.411z"/><path d="M149.199,314.823v-2.578c-10.325,1.356-21.229,2.095-32.518,2.095c-56.25,0-103.199-18.054-114.227-42.082 C0.848,275.757,0,279.381,0,283.096v11.477c0,29.229,52.24,52.922,116.681,52.922c12.887,0,25.282-0.95,36.873-2.7 c-2.873-5.877-4.355-12.075-4.355-18.496V314.823z"/><path d="M284.92,22.379c-64.441,0-116.681,23.693-116.681,52.921v11.477c0,29.228,52.24,52.921,116.681,52.921 c64.44,0,116.681-23.693,116.681-52.921V75.3C401.601,46.072,349.36,22.379,284.92,22.379z"/><path d="M284.92,165.626c-56.25,0-103.199-18.053-114.227-42.082c-1.606,3.499-2.454,7.123-2.454,10.839v11.477 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.477c0-3.716-0.848-7.34-2.454-10.839 C388.119,147.573,341.17,165.626,284.92,165.626z"/><path d="M284.92,224.71c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.499-2.454,7.123-2.454,10.839v11.477 c0,29.229,52.24,52.922,116.681,52.922c64.44,0,116.681-23.693,116.681-52.922v-11.477c0-3.716-0.848-7.34-2.454-10.839 C388.119,206.657,341.17,224.71,284.92,224.71z"/><path d="M284.92,286.983c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.5-2.454,7.123-2.454,10.838v11.478 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.478c0-3.715-0.848-7.34-2.454-10.838 C388.119,268.928,341.17,286.983,284.92,286.983z"/><path d="M284.92,346.066c-56.25,0-103.199-18.053-114.227-42.081c-1.606,3.5-2.454,7.125-2.454,10.838V326.3 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.478c0-3.715-0.848-7.34-2.454-10.838 C388.119,328.012,341.17,346.066,284.92,346.066z"/></svg>',
    },
    {
      label: "Əlaqə",
      action: "contact",
      icon:
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
    },
  ],
  subHeaderLinks: [
    { label: "Endirim", action: "PlayStation", type: "sale" },
    { label: "Sony Türkiyə Oyun Kataloqu", action: "PlayStation" },
    { label: "Sony Azərbaycan Oyun Kataloqu", action: "PlayStation" },
    { label: "Steam", action: "Servislər" },
    { label: "Spotify", action: "Servislər" },
    { label: "ChatGPT", action: "Servislər" },
  ],
  catalogTabs: {
    AllProducts: {
      eyebrow: "Full catalog",
      title: "Bütün məhsullar",
      description: "Bütün platforma və kateqoriyalardakı məhsullar tək səhifədə, səhifələmə ilə göstərilir.",
      chips: ["Hamısı", "Oyunlar", "Paketlər", "Servislər", "Valyuta", "Yeni gələnlər"],
      filters: ["Platforma", "Kateqoriya", "Qiymət", "Endirim", "Məhsul növü", "Region"],
      banners: [],
    },
    PlayStation: {
      eyebrow: "Sony catalog",
      title: "PlayStation oyun kataloqu",
      description: "PlayStation bölməsi üçün vahid kataloq görünüşü.",
      chips: ["PS5", "PS4", "PS Plus", "Sony Türkiyə", "Sony Azərbaycan", "Pre-order"],
      filters: ["Platforma", "Janr", "Endirim", "Naşir", "Dil", "Buraxılış tarixi"],
      banners: [],
    },
    Xbox: {
      eyebrow: "Microsoft catalog",
      title: "Xbox oyun kataloqu",
      description: "Eyni layout Xbox tabı üçün də istifadə olunur.",
      chips: ["Series X|S", "Xbox One", "Game Pass", "EA Play", "Ubisoft+", "Gift Cards"],
      filters: ["Platforma", "Abunəlik", "Nəşriyyatçı", "Qiymət", "Buraxılış ili", "Region"],
      banners: [],
    },
    "Servislər": {
      eyebrow: "Digital services",
      title: "Rəqəmsal servis kataloqu",
      description: "Abunəlik və servis məhsulları da eyni kataloq skeleti ilə açılır.",
      chips: ["Spotify", "Netflix", "ChatGPT", "Canva", "YouTube", "Discord Nitro"],
      filters: ["Kateqoriya", "Müddət", "Populyar", "Yeni", "Hədiyyə", "Bölgə"],
      banners: [],
    },
    "Oyun Valyutası": {
      eyebrow: "Wallet & top-up",
      title: "Oyun valyutası kataloqu",
      description: "Balans artırma və oyun içi valyuta məhsulları üçün eyni səhifə sistemi tətbiq olunur.",
      chips: ["V-Bucks", "Steam Wallet", "PSN Wallet", "Xbox Gift", "Robux", "EA FC Points"],
      filters: ["Xidmət", "Nominal", "Region", "Aksiya", "Populyar", "Mövcudluq"],
      banners: [],
    },
  },
  fallbackHotDeals: [],
  fallbackPlayerPicks: [],
  serviceHighlights: [
    {
      title: "Abunəliklər",
      copy: "PS Plus, Game Pass, EA Play və digər xidmətlər üçün vahid axın.",
      icon: "solar:play-stream-bold",
    },
    {
      title: "Oyun kataloqları",
      copy: "Sony və Xbox bölmələri üçün sürətli keçid və aydın struktur.",
      icon: "solar:widget-5-bold",
    },
    {
      title: "Balans artırma",
      copy: "Steam, wallet və oyun içi valyuta məhsulları üçün ayrıca vitrın.",
      icon: "solar:wallet-money-bold",
    },
  ],
  footerShopLinks: [
    { label: "Bütün Məhsullar", action: "AllProducts" },
    { label: "PlayStation", action: "PlayStation" },
    { label: "Xbox", action: "Xbox" },
    { label: "Servislər", action: "Servislər" },
    { label: "Oyun Valyutası", action: "Oyun Valyutası" },
  ],
  footerSupportLinks: [
    { label: "Necə almalı?", href: "#" },
    { label: "Tez-tez verilən suallar", href: "#" },
    { label: "Geri qaytarma", href: "#" },
    { label: "Əlaqə", href: "#" },
  ],
  footerLegalLinks: [
    { label: "İstifadə şərtləri", href: "#" },
    { label: "Məxfilik siyasəti", href: "#" },
    { label: "Cookie siyasəti", href: "#" },
  ],
  heroRows: Array.from({ length: 5 }, (_, index) => ({
    row: index + 1,
    items: getRowItems(index + 1),
  })),
};
