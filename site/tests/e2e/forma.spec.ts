import { test, expect, type Page } from '@playwright/test';

const odaberi = (page: Page, grupa: string, opcija: string) =>
  page.getByRole('radiogroup', { name: grupa }).getByRole('radio', { name: opcija, exact: true }).click();

const presretni = async (page: Page, status = 200) => {
  const tijela: string[] = [];
  await page.route('**/', async (route) => {
    if (route.request().method() === 'POST') {
      tijela.push(route.request().postDataBuffer()?.toString('latin1') ?? '');
      await route.fulfill({ status, body: '' });
    } else await route.continue();
  });
  return tijela;
};

const doKontakta = async (page: Page) => {
  await odaberi(page, 'Vrsta objekta', 'Hotel, turistički ili ugostiteljski objekt');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await odaberi(page, 'Vrsta obloge', 'LVT vinil ploče i daske');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await odaberi(page, 'Raspored', 'Riblja kost');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await odaberi(page, 'Površina', '150 – 500 m²');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await odaberi(page, 'Trenutna podloga', 'Novi estrih, nikad nije bilo obloge');
  await odaberi(page, 'Je li potrebno niveliranje ili sanacija podloge?', 'Da');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await odaberi(page, 'Koliko je star estrih?', '1 – 2 mjeseca');
  await odaberi(page, 'Postoji li podno grijanje?', 'Da');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await page.getByLabel('Grad ili mjesto').fill('Split');
  await odaberi(page, 'Na kojem je katu?', '1. – 3. kat');
  await odaberi(page, 'Postoji li dizalo za unos materijala?', 'Da');
  await odaberi(page, 'Kada bi radovi trebali početi?', 'U roku mjesec dana');
  await page.getByRole('button', { name: 'Dalje' }).click();
};

const popuniKontakt = async (page: Page) => {
  await page.getByLabel('Ime i prezime').fill('Ana Horvat');
  await page.getByLabel('E-mail').fill('ana@primjer.hr');
  await page.getByLabel('Broj telefona').fill('091 234 5678');
  await page.getByLabel(/Slažem se s obradom podataka/).check();
};

test.beforeEach(async ({ page }) => {
  await page.goto('/zatrazi-ponudu/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
});

test('puni tok šalje radni nalog i vodi na zahvalnu stranicu', async ({ page }) => {
  const tijela = await presretni(page);
  await doKontakta(page);
  await popuniKontakt(page);
  await page.getByRole('button', { name: 'Pošalji radni nalog' }).click();
  await expect(page).toHaveURL(/\/hvala\/\?objekt=hotel$/);
  expect(tijela[0]).toContain('radni-nalog');
  expect(tijela[0]).toContain('riblja-kost');
  expect(tijela[0]).toContain('Split');
});

test('PVC u roli preskače raspored i ne broji ga u napretku', async ({ page }) => {
  await odaberi(page, 'Vrsta objekta', 'Zdravstvena ustanova');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await odaberi(page, 'Vrsta obloge', 'PVC / vinil u roli');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await expect(page.getByRole('heading', { name: 'Kolika je približna površina?' })).toBeVisible();
  await expect(page.getByText('Korak 3 od 7')).toBeVisible();
});

test('query parametri unaprijed popunjavaju korake', async ({ page }) => {
  await page.goto('/zatrazi-ponudu/?objekt=hotel&obloga=lvt');
  await expect(page.getByRole('heading', { name: 'Kakav raspored želite?' })).toBeVisible();
  await page.goto('/zatrazi-ponudu/?objekt=xyz');
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Za kakav prostor tražite pod?' })).toBeVisible();
});

test('klik na stavku naloga vraća na taj korak s odgovorom', async ({ page }) => {
  await odaberi(page, 'Vrsta objekta', 'Hotel, turistički ili ugostiteljski objekt');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await odaberi(page, 'Vrsta obloge', 'Epoksidni pod');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await odaberi(page, 'Površina', '150 – 500 m²');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await page.getByRole('complementary', { name: 'Radni nalog' }).getByRole('button', { name: /Površina/ }).click();
  await expect(page.getByRole('heading', { name: 'Kolika je približna površina?' })).toBeVisible();
  await expect(page.getByRole('radio', { name: '150 – 500 m²' })).toHaveAttribute('aria-checked', 'true');
});

test('osvježavanje vraća korak i odgovore', async ({ page }) => {
  await odaberi(page, 'Vrsta objekta', 'Hotel, turistički ili ugostiteljski objekt');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await odaberi(page, 'Vrsta obloge', 'Epoksidni pod');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await odaberi(page, 'Površina', '150 – 500 m²');
  await page.getByRole('button', { name: 'Dalje' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Kakva je trenutna podloga?' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Radni nalog' })).toContainText('Hotel, turistički ili ugostiteljski objekt');
});

test('prevelik prilog prikazuje grešku i čuva podatke', async ({ page }) => {
  await doKontakta(page);
  await popuniKontakt(page);
  await page.getByLabel(/Priložite troškovnik/).setInputFiles({ name: 'veliki.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(9 * 1024 * 1024) });
  await page.getByRole('button', { name: 'Pošalji radni nalog' }).click();
  await expect(page.getByText('Prilog je veći od 8 MB.')).toBeVisible();
  await expect(page.getByLabel('Ime i prezime')).toHaveValue('Ana Horvat');
});

test('greška poslužitelja ostavlja podatke i prikazuje poruku', async ({ page }) => {
  await presretni(page, 500);
  await doKontakta(page);
  await popuniKontakt(page);
  await page.getByRole('button', { name: 'Pošalji radni nalog' }).click();
  await expect(page.getByRole('alert')).toContainText('Slanje nije uspjelo');
  await expect(page.getByRole('button', { name: 'Pošalji radni nalog' })).toBeEnabled();
  await expect(page.getByLabel('Ime i prezime')).toHaveValue('Ana Horvat');
});

test('validacija kontakta prikazuje poruke uz polja', async ({ page }) => {
  await doKontakta(page);
  await page.getByRole('button', { name: 'Pošalji radni nalog' }).click();
  await expect(page.getByText('Upišite ime i prezime.')).toBeVisible();
  await expect(page.getByText('Potrebna je privola za obradu podataka.')).toBeVisible();
});

