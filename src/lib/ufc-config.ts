export const ufcConfig = {
  current_event: {
    name: "UFC Fight Night: Adesanya vs. Cannonier",
    date: "2026-06-20",
    venue: "T-Mobile Arena, Las Vegas, Nevada",
    main_event: {
      fighter1: "Israel Adesanya",
      fighter2: "Jared Cannonier",
      weight_class: "Middleweight Championship",
      fighter1_img: "https://a.espncdn.com/i/headshots/mma/players/full/3150.png",
      fighter2_img: "https://a.espncdn.com/i/headshots/mma/players/full/3910.png",
      fighter1_record: "25-3-0",
      fighter2_record: "17-6-0",
    },
    fight_card: {
      main: [
        { fighter1: "Israel Adesanya", fighter2: "Jared Cannonier", weight_class: "Middleweight", fighter1_record: "25-3-0", fighter2_record: "17-6-0" },
        { fighter1: "Alex Pereira", fighter2: "Jamahal Hill", weight_class: "Light Heavyweight", fighter1_record: "12-1-0", fighter2_record: "13-2-0" },
        { fighter1: "Zhang Weili", fighter2: "Rose Namajunas", weight_class: "Women's Strawweight", fighter1_record: "26-3-0", fighter2_record: "13-6-0" },
        { fighter1: "Justin Gaethje", fighter2: "Rafael Fiziev", weight_class: "Lightweight", fighter1_record: "26-5-0", fighter2_record: "13-3-0" },
        { fighter1: "Sean O'Malley", fighter2: "Marlon Vera", weight_class: "Bantamweight", fighter1_record: "18-2-0", fighter2_record: "23-10-0" },
      ],
      prelims: [
        { fighter1: "Magomed Ankalaev", fighter2: "Nikita Krylov", weight_class: "Light Heavyweight", fighter1_record: "20-1-1", fighter2_record: "31-9-0" },
        { fighter1: "Jalin Turner", fighter2: "Dan Hooker", weight_class: "Lightweight", fighter1_record: "14-8-0", fighter2_record: "24-12-0" },
        { fighter1: "Amanda Lemos", fighter2: "Virna Jandiroba", weight_class: "Women's Strawweight", fighter1_record: "14-4-1", fighter2_record: "21-3-0" },
      ],
    },
  },

  featured_fighter: {
    name: "Israel Adesanya",
    nickname: "The Last Stylebender",
    weight_class: "Middleweight",
    country: "Nigeria",
    flag: "🇳🇬",
    record: "25-3-0",
    height: "6'4\"",
    reach: "80\"",
    stance: "Switch",
    image: "https://a.espncdn.com/i/headshots/mma/players/full/3150.png",
  },

  rankings: [
    { rank: 1, fighter: "Islam Makhachev", record: "27-1-0", weightClass: "Lightweight" },
    { rank: 2, fighter: "Jon Jones", record: "28-1-0", weightClass: "Heavyweight" },
    { rank: 3, fighter: "Leon Edwards", record: "22-4-0", weightClass: "Welterweight" },
    { rank: 4, fighter: "Alex Pereira", record: "12-1-0", weightClass: "Light Heavyweight" },
    { rank: 5, fighter: "Israel Adesanya", record: "25-3-0", weightClass: "Middleweight" },
  ],

  news: [
    { id: "1", title: "UFC 305 Official Weigh-In Results", description: "All fighters make weight for tomorrow's pay-per-view event in Perth.", image: "", date: "2026-06-16", source: "UFC News" },
    { id: "2", title: "Adesanya Plans to Retake Middleweight Throne", description: "Israel Adesanya is determined to reclaim championship gold.", image: "", date: "2026-06-15", source: "UFC News" },
    { id: "3", title: "Newcomer Watch: 5 Fighters to Know in 2026", description: "Keep an eye on these rising UFC talents making waves this year.", image: "", date: "2026-06-14", source: "UFC News" },
  ],

  featured_fights: [
    { name: "UFC 305", fighters: "Adesanya vs. Cannonier", status: "Upcoming", date: "Jun 20" },
    { name: "UFC Fight Night", fighters: "Pereira vs. Hill", status: "Upcoming", date: "Jun 27" },
    { name: "UFC 306", fighters: "O'Malley vs. Vera 3", status: "Announced", date: "Jul 11" },
    { name: "UFC 307", fighters: "Gaethje vs. Fiziev 2", status: "Announced", date: "Jul 25" },
  ],
};
