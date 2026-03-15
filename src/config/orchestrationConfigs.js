const credentials = require('./credentials');
const { menuMainCourseIdeo, menuIdeoRamadhan } = require('./menus/menuIdeo');
const { MenuFoodMaari } = require('./menus/menuMaari');
const { MenuPromo } = require('./menus/menuPromo');
const { menuBurjoMakanKenyang, menuBurjoAyamNgacir, menuBurjoNyemil } = require('./menus/menuBurjo');

function markAllAsSoldStatus(configMenu, status) {
  return configMenu.map((category) => ({
    ...category,
    menu: category.menu.map((item) => ({ ...item, soldout: status })),
  }));
}

// ─── Ideo Reguler ────────────────────────────────────────────────────────────

const configMenuRegulerSoldout = {
  credentials: credentials.ideo,
  menuSpecs: [
    { categoryName: 'MAIN COURSE', branchName: 'IDEOLOGIS+', configMenu: markAllAsSoldStatus(menuMainCourseIdeo, true) },
    { categoryName: 'FOOD - MAARI', branchName: 'IDEOLOGIS+', configMenu: markAllAsSoldStatus(MenuFoodMaari, true) },
  ],
};

const configMenuRegulerUnSoldout = {
  credentials: credentials.ideo,
  menuSpecs: [
    { categoryName: 'MAIN COURSE', branchName: 'IDEOLOGIS+', configMenu: markAllAsSoldStatus(menuMainCourseIdeo, false) },
    { categoryName: 'FOOD - MAARI', branchName: 'IDEOLOGIS+', configMenu: markAllAsSoldStatus(MenuFoodMaari, false) },
  ],
};

// ─── Ideo Ramadhan ────────────────────────────────────────────────────────────

const configMenuRamadhanSoldout = {
  credentials: credentials.ideo,
  menuSpecs: [
    { categoryName: 'IDEO FOOD', branchName: 'IDEOLOGIS+', configMenu: markAllAsSoldStatus(menuIdeoRamadhan, true) },
  ],
};

const configMenuRamadhanUnSoldout = {
  credentials: credentials.ideo,
  menuSpecs: [
    { categoryName: 'IDEO FOOD', branchName: 'IDEOLOGIS+', configMenu: markAllAsSoldStatus(menuIdeoRamadhan, false) },
  ],
};

// ─── Promo ────────────────────────────────────────────────────────────────────

const configPromoSoldout = {
  credentials: credentials.ideo,
  menuSpecs: [
    { categoryName: 'MAIN COURSE', branchName: 'IDEOLOGIS+', configMenu: markAllAsSoldStatus(MenuPromo, true) },
  ],
};

const configPromoUnSoldout = {
  credentials: credentials.ideo,
  menuSpecs: [
    { categoryName: 'MAIN COURSE', branchName: 'IDEOLOGIS+', configMenu: markAllAsSoldStatus(MenuPromo, false) },
  ],
};

// ─── Burjo Ngegas ─────────────────────────────────────────────────────────────

const BURJO_BRANCHES = ['Burjo Ngegas Peleburan', 'Burjo Ngegas Majapahit', 'Burjo Ngegas Gombel'];

function buildBurjoSpecs(status) {
  const specs = [];
  for (const branchName of BURJO_BRANCHES) {
    specs.push({ categoryName: 'MAKAN KENYANG', branchName, configMenu: markAllAsSoldStatus(menuBurjoMakanKenyang, status) });
    specs.push({ categoryName: 'AYAM NGACIR', branchName, configMenu: markAllAsSoldStatus(menuBurjoAyamNgacir, status) });
    specs.push({ categoryName: 'NYEMIL', branchName, configMenu: markAllAsSoldStatus(menuBurjoNyemil, status) });
  }
  return specs;
}

const configBurjoMajorSoldout = { credentials: credentials.burjo, menuSpecs: buildBurjoSpecs(true) };
const configBurjoMajorUnSoldout = { credentials: credentials.burjo, menuSpecs: buildBurjoSpecs(false) };

module.exports = {
  markAllAsSoldStatus,
  configMenuRegulerSoldout,
  configMenuRegulerUnSoldout,
  configMenuRamadhanSoldout,
  configMenuRamadhanUnSoldout,
  configPromoSoldout,
  configPromoUnSoldout,
  configBurjoMajorSoldout,
  configBurjoMajorUnSoldout,
};
