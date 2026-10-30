export enum KullaniciRol {
  ALICI = 'alici',
  ISLETME = 'isletme',
  YONETICI = 'yonetici',
}

export enum DogrulamaDurumu {
  BEKLEMEDE = 'beklemede',
  ONAYLI = 'onayli',
  REDDEDILDI = 'reddedildi',
}

export enum IsletmeTuru {
  FIRIN = 'firin',
  MARKET = 'market',
  PASTANE = 'pastane',
  MANAV = 'manav',
}

// Yalnızca kabul edilen kategoriler (bkz. sunum, Gıda Güvenliği).
// Çiğ et, kremalı tatlı, pişmiş yemek vb. bilinçli olarak yok.
export enum IlanKategori {
  UNLU_MAMUL = 'unlu_mamul',
  KURU_PASTA = 'kuru_pasta',
  PAKETLI = 'paketli',
  MEYVE_SEBZE = 'meyve_sebze',
  SUT_URUNU = 'sut_urunu',
}

export enum RezervasyonDurumu {
  BEKLIYOR = 'bekliyor',
  TESLIM = 'teslim',
  IPTAL = 'iptal',
}
