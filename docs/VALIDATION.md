# Suitcase 0.4.0 — kontrollitud 29.10.2026

Tume sügavsinine ja türkiissinine kujundus, soojad oranžid nupud ning selged valiku- ja fookusrõhutused on rakendatud mängus, menüüdes, laadimisvaates ja Androidi käivituskuvas. 9:16 paigutus ja varasem edenemine säilivad.

- `npm test`: kõik 15 loogika- ja salvestustesti läbisid.
- `npm run test:e2e`: 39 läbis; üks teadlikult vahele jäetud korduv telefoniprojekti ekraanipilt. Arvutiprojekt kontrollis täpset 1080 × 1920 pilti.
- Brauserisari kontrollib päris hiire- ja puuteliigutusi, paigutust, pööramist, vihjeid, tagasivõtmist, taseme lõpetamist, esemete avanemist, päevapuslet, võrguühenduseta mängimist ja `/Suitcase/` alamkataloogi.
- Varukoopia allalaadimine ja taastamine teises päritolus, vigase faili tagasilükkamine ning salvestusruumi tõrke ohutu käsitlemine läbisid mõlema seadmeprojektiga.
- Mängu, esemekogu ja tasemete menüü tume kujundus vaadati ekraanipiltidelt üle.
- `npm run android:build` ehitas versiooni 0.4.0/code4; APK allkiri kontrolliti. APK veebifailid vastavad bait-baidilt praegusele tootmisehitusele.

APK SHA-256: `7ae9ce2bf84c736253f044dfb8ff40084f86789e7b1d3545df61662367f528e2`.

Päris Androidi telefonis ega emulaatoris mängimist ei kontrollitud. Hallatud Chromium ei luba `file://` avamist; iseseisvat HTML-i testiti täpse dokumendina võrguühenduseta ja lisapäringuteta.

Kasutaja palus selle versiooni veebist proovitavaks teha. GitHubi HTTPS-hoidla on ligipääsetav. Keskkonna võrgupoliitika blokeerib `api.github.com` ja `m2gn3tic-byte.github.io`, mistõttu GitHub Pagesi seadistust ega avaliku mängulehe HTTP-vastust ei saa siit kontrollida. Neid piiranguid ei tohi käsitleda tõendina, et veebileht on avaldatud või töökorras. Avaldamise sammud on failis [TESTIMINE.md](TESTIMINE.md).

Varasem keskkonna seadistuse salvestus tagastas `draft_not_editable`. Täielikud ettevalmistusjuhised on failides [cloud/INSTALL.sh](cloud/INSTALL.sh) ja [cloud/START.md](cloud/START.md). See ei takistanud käesoleva mängukoodi arendamist, ehitamist ega kohalikke brauseriteste. Hoidlate valikut ei muudetud ning vana `/workspace/whatever` töökaust säilitati.
