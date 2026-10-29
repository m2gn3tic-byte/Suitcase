# Suitcase'i proovimine

Testimise põhiline siht on arvuti veebibrauser, kus mäng avaneb telefonile mõeldud 9:16 püstvaatena. Lõplik siht on Androidi telefon ja Google Play; veeb ning Android kasutavad sama mängukoodi.

## Praegune arenduskoopia

Mängu töökaust on `/workspace/Suitcase`. Mängus on 24 taset, 18 eset, tume kujundus, graafika, Androidi projekt ja automaattestid. Ületoomine ja kohalik ehitus ei avalda mängu uuel veebiaadressil. Avaliku Suitcase'i mängulingi toimimist pole kinnitatud.

Pilvekeskkonna avaldamine säilitab arendusfailid. See ei ava mängu veebilehena ega muuda `/workspace/...` failiteid kasutaja allalaadimislinkideks. Arendusserver tuleb igas uues tööseansis uuesti käivitada.

## Arvutisse kaasa võetav mäng

```sh
npm ci --no-audit --no-fund
npm run build:standalone
```

Tulemus on `artifacts/Mahub-kull.html`. Kui fail on sinu arvutisse edastatud, ava see Chrome'i, Edge'i või Firefoxiga. Kood, stiilid ja esemepildid on failis koos; Node.js-i, kontot ega serverit pole mängimiseks vaja. Edenemise säilitamiseks kasuta sama brauserit ja failiasukohta või võta edenemisest varukoopia.

Hallatud pilve-Chromium keelab administraatori reegliga `file://` avamise. Iseseisva faili test kasutab täpselt eksporditud HTML-i võrguühenduseta dokumendina ja keelab lisapäringud. Päris arvutis failile topeltklõpsamist tuleb eraldi kontrollida.

## Veebiversiooni ettevalmistamine

```sh
npm run build:pages
```

Tulemus on `dist-pages/` ja aadressiosa `/Suitcase/`. Kaustatee suurtäht on oluline. Kohalik `npm run preview:pages` on mõeldud selle teekonna testimiseks.

Avaldamisloaga ja puhta, commit'itud lähtekoodi korral saadab `npm run publish:playtest` ehitatud lehe harusse `gh-pages` ning iseseisva HTML-i ja avamisjuhendi harusse `playtest`. Skript kasutab praegust `origin` hoidlat, nõuab puhast tööpuud ja saadab testiharud ühe atomaarse lükkamisega. Sundlükkamist ei kasutata. Mõlema ehitusharu commit sisaldab lähtekoodi commit'i viidet.

Seejärel vali [Suitcase'i Pagesi seadetes](https://github.com/m2gn3tic-byte/Suitcase/settings/pages) **Deploy from a branch → gh-pages → /(root) → Save**. Mänguaadressi ja `playtest` haru ZIP-i toimimist saab kinnitada pärast päris avaldamist. Alternatiivne `.github/workflows/playtest.yml` käivitub ainult käsitsi ning eeldab Pagesi allikaks GitHub Actionsi valimist.

## Edenemise ületoomine

1. Ava tasemete menüü ja **Edenemise varukoopia**.
2. Vali **Salvesta varukoopia** ning hoia allalaaditud JSON-fail alles.
3. Ava teine mängu asukoht või brauser ja vali samas menüüs varukoopia fail.
4. Kontrolli eelvaadet ning vajuta **Taasta varukoopia**.

Läbitud tasemed liidetakse praeguse edenemisega. Sama taseme pooleliolev paigutus asendub varukoopia omaga. Teised paigutused jäävad alles. Loobumine ei muuda mängu ning vigased, tundmatu formaadiga või üle 1 MB failid lükatakse tagasi. Pilvesünkroonimist ega faili serverisse saatmist ei toimu.

Varukoopia nupp on alates versioonist 0.3. Vana 0.2 versiooni brauserisalvestust ei saa uus veebiaadress automaatselt lugeda. Sama päritolu ja sama salvestusvõtmega mäng võib edenemist jagada; muul juhul tuleb varukoopia salvestada uuendatud mänguvaatest, mis näeb varasemat edenemist.

## Mängimise kontroll

1. Lohista ese kohvrisse või vali ese ja puuduta ruutu.
2. Vali ese ning kasuta **Pööra** või klahvi **R**.
3. Proovi kattuvat ja üle serva paigutust: mäng peab need tagasi lükkama.
4. Proovi vihjet, käigu tagasivõtmist ja uuesti alustamist.
5. Lõpeta tase, ava järgmine ja värskenda lehte; edenemine peab säilima.
6. Vaata esemekogust uusi esemeid ja proovi **Päeva kohvrit**.
7. Taasta varukoopia teises brauseris või aadressil ja kontrolli pooleliolevat kohvrit.
8. Tootmisversiooni esimese laadimise järel proovi võrguühenduseta mängimist.

Automaatselt käivitab need vood `npm run test:e2e`. Ekraanipildi kontroll loob `artifacts/mahub-portrait-1080x1920.png` ja kontrollib täpset pikslimõõtu.

Veateate korral pane kirja brauser, ekraanisuurus, kohvri number ja viimased sammud. Androidi APK loomise juhend on [ANDROID.md](ANDROID.md); seadmetest ja Google Plays avaldamine on eraldi sammud.
