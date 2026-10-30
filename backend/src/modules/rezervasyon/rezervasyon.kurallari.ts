// Sunum, Adil Dağıtım tablosu. Pilot verisine göre ileride yönetici panelinden ayarlanacak.
export const REZERVASYON_KURALLARI = {
  gunlukLimit: 2,
  ihlalAskiEsigi: 3, // gelinmeyen rezervasyon sayısı
  askiSuresiGun: 7,
  taramaAraligiMs: 60_000,
};

const ANAHTAR_ONEKI = 'rezervasyon:';

export const rezervasyonAnahtari = (id: string) => `${ANAHTAR_ONEKI}${id}`;

export const anahtardanRezervasyonId = (anahtar: string): string | null =>
  anahtar.startsWith(ANAHTAR_ONEKI) ? anahtar.slice(ANAHTAR_ONEKI.length) : null;
