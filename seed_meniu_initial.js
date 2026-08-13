import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzdtssvjsrhyocskivmm.supabase.co';
const supabaseKey = 'sb_publishable_JRIxO4MMjth3IkqfaOCPmw_e69T87UP';
const supabase = createClient(supabaseUrl, supabaseKey);

const menuItems = [
    // VINURI & SPUMANTE
    { nume: "Rivero Alb", pret: 40, categorie: "Bar", descriere: "Vin Alb" },
    { nume: "Castel Huniade Fetească Regală", pret: 45, categorie: "Bar", descriere: "Vin Alb" },
    { nume: "Purcari Chardonnay Sec", descriere: "Vin Alb | 750 ml", pret: 60, categorie: "Bar" },
    { nume: "Santa Rita Alb", pret: 60, categorie: "Bar", descriere: "Vin Alb" },
    { nume: "Tyrsos Vermentino di Sardegna", pret: 80, categorie: "Bar", descriere: "Vin Alb" },
    { nume: "Sauvignon Blanc Sec", pret: 80, categorie: "Bar", descriere: "Vin Alb" },
    { nume: "Implicit Sauvignon Blanc", descriere: "Vin Alb | 750 ml", pret: 80, categorie: "Bar" },
    { nume: "Sole Chardonnay", pret: 115, categorie: "Bar", descriere: "Vin Alb" },
    { nume: "Solo Quinta Alb Sec", pret: 155, categorie: "Bar", descriere: "Vin Alb" },

    { nume: "Rivero Rosé", pret: 40, categorie: "Bar", descriere: "Vin Rosé" },
    { nume: "Castel Huniade Rosé Demisec", pret: 45, categorie: "Bar", descriere: "Vin Rosé" },
    { nume: "Mateus", pret: 65, categorie: "Bar", descriere: "Vin Rosé" },
    { nume: "Valle del Tirso Rosato", pret: 80, categorie: "Bar", descriere: "Vin Rosé" },
    { nume: "Implicit Rosé", pret: 80, categorie: "Bar", descriere: "Vin Rosé" },
    { nume: "Santa Rita Rosato", pret: 80, categorie: "Bar", descriere: "Vin Rosé" },
    { nume: "Muse Night Rosé Demisec", pret: 115, categorie: "Bar", descriere: "Vin Rosé" },

    { nume: "Chianti Borgo Imperiale", pret: 60, categorie: "Bar", descriere: "Vin Roșu" },
    { nume: "Implicit Merlot Roșu Sec", pret: 80, categorie: "Bar", descriere: "Vin Roșu" },
    { nume: "Cuvée Überland Roșu", pret: 220, categorie: "Bar", descriere: "Vin Roșu" },

    { nume: "Castel Huniade Sauvignon Blanc", descriere: "Vin | 187 ml", pret: 12, categorie: "Bar" },
    { nume: "Castel Huniade Rosé Demisec", descriere: "Vin | 187 ml", pret: 12, categorie: "Bar" },
    { nume: "Castel Huniade Cabernet Sauvignon", descriere: "Vin | 187 ml", pret: 12, categorie: "Bar" },

    { nume: "Prosecco la pahar", pret: 12, categorie: "Bar", descriere: "Spumante" },
    { nume: "Spumant Borgo Imperiale", pret: 50, categorie: "Bar", descriere: "Spumante" },
    { nume: "Prosecco Maranello", pret: 55, categorie: "Bar", descriere: "Spumante" },
    { nume: "Spumant Astoria F.V. Moscato Rosé", pret: 80, categorie: "Bar", descriere: "Spumante" },
    { nume: "Prosecco Terre di Marca Alb / Rosé", pret: 80, categorie: "Bar", descriere: "Spumante" },
    { nume: "Spumant Riesling Borgo Imperiale", pret: 130, categorie: "Bar", descriere: "Spumante" },
    { nume: "Prosecco Le Rive Extra Dry", descriere: "Spumante | 1.5L", pret: 535, categorie: "Bar" },
    { nume: "Șampanie Moët & Chandon Ice Rosé", pret: 625, categorie: "Bar", descriere: "Spumante" },

    // BAR & CAFEA
    { nume: "Cocktail fără alcool", pret: 20, categorie: "Bar", descriere: "Cocktail" },
    { nume: "Aperol Spritz", pret: 25, categorie: "Bar", descriere: "Cocktail" },
    { nume: "Mojito", pret: 25, categorie: "Bar", descriere: "Cocktail" },
    { nume: "Cuba Libre", pret: 25, categorie: "Bar", descriere: "Cocktail" },
    { nume: "Piña Colada", pret: 25, categorie: "Bar", descriere: "Cocktail" },
    { nume: "Sex on the Beach", pret: 25, categorie: "Bar", descriere: "Cocktail" },
    { nume: "Hugo", pret: 25, categorie: "Bar", descriere: "Cocktail" },
    { nume: "Cosmopolitan", pret: 25, categorie: "Bar", descriere: "Cocktail" },
    { nume: "Gin Tonic", pret: 25, categorie: "Bar", descriere: "Cocktail" },

    { nume: "Finlandia", pret: 10, categorie: "Bar", descriere: "Vodcă" },
    { nume: "Stalinskaya", pret: 12, categorie: "Bar", descriere: "Vodcă" },
    { nume: "Absolut", pret: 15, categorie: "Bar", descriere: "Vodcă" },
    { nume: "Beluga Noble", pret: 35, categorie: "Bar", descriere: "Vodcă" },

    { nume: "Jack Daniel's", pret: 20, categorie: "Bar", descriere: "Whisky" },
    { nume: "Chivas Regal 12 ani", pret: 20, categorie: "Bar", descriere: "Whisky" },
    { nume: "Johnnie Walker Black Label", pret: 25, categorie: "Bar", descriere: "Whisky" },

    { nume: "Gin Tanqueray", pret: 17, categorie: "Bar", descriere: "Gin" },
    { nume: "Rom Captain Morgan", pret: 15, categorie: "Bar", descriere: "Rom" },
    { nume: "Rom Bumbu Original", pret: 25, categorie: "Bar", descriere: "Rom" },
    { nume: "Tequila Olmeca Gold", pret: 15, categorie: "Bar", descriere: "Tequila" },

    { nume: "Alexandrion 5*", pret: 10, categorie: "Bar", descriere: "Brandy / Cognac" },
    { nume: "Vecchia Romagna Nera", pret: 12, categorie: "Bar", descriere: "Brandy / Cognac" },
    { nume: "Metaxa 5*", pret: 15, categorie: "Bar", descriere: "Brandy / Cognac" },
    { nume: "Courvoisier", pret: 20, categorie: "Bar", descriere: "Brandy / Cognac" },

    { nume: "Campari", pret: 10, categorie: "Bar", descriere: "Bitter / Lichior" },
    { nume: "Jägermeister", pret: 15, categorie: "Bar", descriere: "Bitter / Lichior" },
    { nume: "Limoncello", pret: 15, categorie: "Bar", descriere: "Bitter / Lichior" },
    { nume: "Sheridan's", pret: 17, categorie: "Bar", descriere: "Bitter / Lichior" },
    { nume: "Sambuca", pret: 20, categorie: "Bar", descriere: "Bitter / Lichior" },

    { nume: "Tequila Clase Azul Reposado", descriere: "Special | 700 ml", pret: 1800, categorie: "Bar" },

    { nume: "Espresso", pret: 7, categorie: "Bar", descriere: "Cafea" },
    { nume: "Cafea lungă", pret: 7, categorie: "Bar", descriere: "Cafea" },
    { nume: "Cappuccino", pret: 7, categorie: "Bar", descriere: "Cafea" },
    { nume: "Vergnano Bianco Ricco", pret: 7, categorie: "Bar", descriere: "Cafea" },
    { nume: "Latte Macchiato", pret: 8, categorie: "Bar", descriere: "Cafea" },
    { nume: "Cafea cu lapte", pret: 8, categorie: "Bar", descriere: "Cafea" },
    { nume: "Cafea fără cofeină", pret: 9, categorie: "Bar", descriere: "Cafea" },
    { nume: "Ciocolată caldă", pret: 10, categorie: "Bar", descriere: "Cafea" },
    { nume: "Dublu espresso", pret: 14, categorie: "Bar", descriere: "Cafea" },

    // PIZZA & FOCACCIA
    { nume: "Margherita", descriere: "Pizza | sos de roșii, mozzarella", pret: 33, categorie: "Restaurant" },
    { nume: "Marinara", descriere: "Pizza | sos de roșii, oregano, usturoi, anșoa", pret: 33, categorie: "Restaurant" },
    { nume: "Ortolana", descriere: "Pizza | sos de roșii, mozzarella, vinete, dovlecei, ardei", pret: 35, categorie: "Restaurant" },
    { nume: "Capriciosa", descriere: "Pizza | sos de roșii, mozzarella, ciuperci, măsline, prosciutto crudo, ou", pret: 36, categorie: "Restaurant" },
    { nume: "Napoli", descriere: "Pizza | sos de roșii, mozzarella, anșoa, oregano", pret: 36, categorie: "Restaurant" },
    { nume: "Vegetariană", descriere: "Pizza | sos de roșii, mozzarella, vinete, ardei, dovlecel, ciuperci, ceapă", pret: 36, categorie: "Restaurant" },
    { nume: "Wurstel e Patatine", descriere: "Pizza | sos de roșii, mozzarella, cartofi, crenvurști", pret: 36, categorie: "Restaurant" },
    { nume: "Diavola", descriere: "Pizza | sos de roșii, mozzarella, salam picant", pret: 37, categorie: "Restaurant" },
    { nume: "Boscaiola", descriere: "Pizza | sos de roșii, mozzarella, ciuperci, cârnați oltenești", pret: 37, categorie: "Restaurant" },
    { nume: "Tonno e Cipolla", descriere: "Pizza | sos de roșii, mozzarella, ton, ceapă", pret: 37, categorie: "Restaurant" },
    { nume: "Quattro Formaggi", descriere: "Pizza | mozzarella, gorgonzola, parmigiano, cașcaval", pret: 37, categorie: "Restaurant" },
    { nume: "Tradițională", descriere: "Pizza | sos de roșii, mozzarella, șuncă, ciuperci, măsline", pret: 37, categorie: "Restaurant" },
    { nume: "Salami", descriere: "Pizza | sos de roșii, mozzarella, salam, bacon", pret: 37, categorie: "Restaurant" },
    { nume: "Pepperoni", descriere: "Pizza | sos de roșii, mozzarella, salam picant, ardei", pret: 37, categorie: "Restaurant" },
    { nume: "Margherita e Prosciutto", descriere: "Pizza | sos de roșii, mozzarella, prosciutto crudo sau cotto", pret: 37, categorie: "Restaurant" },
    { nume: "Estiva", descriere: "Pizza | mozzarella, rucola, prosciutto, roșii cherry", pret: 38, categorie: "Restaurant" },
    { nume: "Calzone", descriere: "Pizza | sos de roșii, mozzarella, prosciutto cotto", pret: 38, categorie: "Restaurant" },
    { nume: "Funghi e Prosciutto", descriere: "Pizza | sos de roșii, mozzarella, ciuperci, prosciutto cotto", pret: 39, categorie: "Restaurant" },
    { nume: "Bella Roma", descriere: "Pizza | sos de roșii, mozzarella, rucola, roșii cherry, prosciutto, parmigiano", pret: 40, categorie: "Restaurant" },
    { nume: "Funghi Porcini", descriere: "Pizza | sos de roșii, mozzarella, hribi", pret: 40, categorie: "Restaurant" },
    { nume: "Pizza Family", descriere: "Pizza | porție dublă, cât două pizza", pret: 70, categorie: "Restaurant" },

    { nume: "Focaccia", descriere: "Focaccia | ulei de măsline, oregano", pret: 15, categorie: "Restaurant" },
    { nume: "Focaccia Bianca", descriere: "Focaccia | ulei de măsline, oregano, mozzarella", pret: 20, categorie: "Restaurant" },
    { nume: "Focaccia cu Nutella", descriere: "Focaccia | ulei de măsline, oregano, nutella", pret: 20, categorie: "Restaurant" },
    { nume: "Focaccia cu Prosciutto", descriere: "Focaccia | mozzarella, oregano, prosciutto", pret: 25, categorie: "Restaurant" },

    // BUCATARIE & DESERT
    { nume: "Burro e Parmigiano", descriere: "Paste | unt, parmigiano", pret: 25, categorie: "Restaurant" },
    { nume: "Penne all'Arrabbiata", descriere: "Paste | sos de roșii, usturoi, ardei iute", pret: 35, categorie: "Restaurant" },
    { nume: "Bolognese / Ragù", descriere: "Paste | ragù de vită, sos de roșii, parmigiano", pret: 35, categorie: "Restaurant" },
    { nume: "Aglio, Olio e Peperoncino", descriere: "Paste | ulei de măsline, usturoi, ardei iute, pătrunjel", pret: 35, categorie: "Restaurant" },
    { nume: "All'Amatriciana", descriere: "Paste | sos de roșii, bacon, ceapă, parmigiano", pret: 38, categorie: "Restaurant" },
    { nume: "Carbonara", descriere: "Paste | ou, bacon, parmigiano, piper negru", pret: 39, categorie: "Restaurant" },
    { nume: "Ai Funghi Porcini", descriere: "Paste | hribi, smântână, parmigiano", pret: 45, categorie: "Restaurant" },

    { nume: "Supplì", pret: 5, categorie: "Restaurant", descriere: "Antipasti" },
    { nume: "Bruschetta Pomodoro", descriere: "Antipasti | roșii, usturoi, busuioc, ulei de măsline", pret: 5, categorie: "Restaurant" },
    { nume: "Chipsuri", pret: 5, categorie: "Restaurant", descriere: "Antipasti" },
    { nume: "Legume la grătar", pret: 10, categorie: "Restaurant", descriere: "Fel Principal" },
    { nume: "Scaloppina al Limone", pret: 35, categorie: "Restaurant", descriere: "Fel Principal" },
    { nume: "Platou aperitiv (2 pers.)", pret: 40, categorie: "Restaurant", descriere: "Antipasti" },
    { nume: "Ceafă de porc la grătar", descriere: "Fel Principal | 300 g", pret: 40, categorie: "Restaurant" },
    { nume: "Ceafă de porc cu legume la grătar", descriere: "Fel Principal | 300 g", pret: 40, categorie: "Restaurant" },

    { nume: "Clătite cu Finetti", descriere: "Desert | 2 buc / porție", pret: 10, categorie: "Restaurant" },
    { nume: "Cheesecake", pret: 15, categorie: "Restaurant", descriere: "Desert" },
    { nume: "Tiramisu", pret: 20, categorie: "Restaurant", descriere: "Desert" },
    { nume: "Gumă de mestecat Mentos", pret: 10, categorie: "Restaurant", descriere: "Desert" },

    { nume: "Betty Blue Vanilie", pret: 5, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Betty Blue Tiramisu", pret: 5, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Betty Blue Triple Chocolate", pret: 5, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Betty Blue Chocolate", pret: 5, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Betty Blue Fistic", pret: 5, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Betty Blue Bubble Gum", pret: 5, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Cornet Scufița Roșie", pret: 5, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Napoca Cornet Cacao", pret: 6, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Napoca Pahar Cacao", pret: 6, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Napoca Pahar Vanilie", pret: 6, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Twister Green", pret: 7, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Calippo Căpșuni", pret: 8, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Cornetto King Cone Vanilie", pret: 12, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Cornetto King Cone Ciocolată", pret: 15, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Magnum Migdale", pret: 15, categorie: "Restaurant", descriere: "Înghețată" },
    { nume: "Magnum Piersică", pret: 15, categorie: "Restaurant", descriere: "Înghețată" },

    // BAUTURI
    { nume: "Coca-Cola", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Coca-Cola", descriere: "Răcoritoare | 330 ml", pret: 10, categorie: "Bar" },
    { nume: "Coca-Cola Zero Zahăr", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Coca-Cola Zero Zero", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Sprite", descriere: "Răcoritoare | 330 ml", pret: 10, categorie: "Bar" },
    { nume: "Fanta Struguri", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Fanta Portocale", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Schweppes Raspberry Lemon", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Schweppes Mandarin", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Schweppes Tonic", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Cappy Nectar Portocale", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Cappy Nectar Piersici", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Cappy Nectar Pere", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Cappy Nectar Vișine", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Cappy Nectar Cireșe", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Prigat Căpșuni, Măr și Banană", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Prigat Kiwi și Pară", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Prigat Piersică și Caisă", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Fuzetea Piersici", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Fuzetea Lemon", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Limonadă", descriere: "Răcoritoare | 250 ml", pret: 10, categorie: "Bar" },
    { nume: "Lemon Fresh", descriere: "Răcoritoare | 500 ml", pret: 10, categorie: "Bar" },

    { nume: "Apă plată Dorna", descriere: "Apă | 330 ml", pret: 6, categorie: "Bar" },
    { nume: "Apă minerală Dorna", descriere: "Apă | 330 ml", pret: 6, categorie: "Bar" },
    { nume: "Apă plată Izvorul Alb", descriere: "Apă | 330 ml", pret: 6, categorie: "Bar" },
    { nume: "Apă plată Bucovina", descriere: "Apă | 330 ml", pret: 6, categorie: "Bar" },
    { nume: "Apă plată Dorna", descriere: "Apă | 750 ml", pret: 15, categorie: "Bar" },
    { nume: "Apă plată Borsec", descriere: "Apă | 750 ml", pret: 15, categorie: "Bar" },
    { nume: "Apă minerală Borsec", descriere: "Apă | 750 ml", pret: 15, categorie: "Bar" },

    { nume: "Red Bull", descriere: "Energizant | 250 ml", pret: 12, categorie: "Bar" },
    { nume: "Cooler Focus Afine", descriere: "Energizant | 500 ml", pret: 12, categorie: "Bar" },
    { nume: "Cooler Hydrate Mentă și Lime", descriere: "Energizant | 500 ml", pret: 12, categorie: "Bar" },

    { nume: "Ursus", descriere: "Bere Draft | 300 ml", pret: 8, categorie: "Bar" },
    { nume: "Ursus", descriere: "Bere Draft | 400 ml", pret: 10, categorie: "Bar" },
    { nume: "Peroni", descriere: "Bere Draft | 300 ml", pret: 10, categorie: "Bar" },
    { nume: "Peroni", descriere: "Bere Draft | 400 ml", pret: 12, categorie: "Bar" },

    { nume: "Ciucaș", descriere: "Bere | 330 ml", pret: 7, categorie: "Bar" },
    { nume: "Ursus Premium", descriere: "Bere | 330 ml", pret: 9, categorie: "Bar" },
    { nume: "Timișoreana", descriere: "Bere | 330 ml", pret: 9, categorie: "Bar" },
    { nume: "Peroni Red", descriere: "Bere | 330 ml", pret: 10, categorie: "Bar" },
    { nume: "Kozel Dark", descriere: "Bere | 330 ml", pret: 10, categorie: "Bar" },
    { nume: "Ursus Black", descriere: "Bere | 330 ml", pret: 10, categorie: "Bar" },
    { nume: "Ursus fără alcool", descriere: "Bere | 330 ml", pret: 10, categorie: "Bar" },
    { nume: "Ursus Soc, Mentă și Lime", descriere: "Bere | 330 ml", pret: 10, categorie: "Bar" },
    { nume: "Kozel Premium Lager", descriere: "Bere | 330 ml", pret: 12, categorie: "Bar" },
    { nume: "Peroni Nastro Azzurro", descriere: "Bere | 330 ml", pret: 15, categorie: "Bar" },
    { nume: "Peroni Capri", descriere: "Bere | 330 ml", pret: 15, categorie: "Bar" },
    { nume: "Peroni fără alcool", descriere: "Bere | 330 ml", pret: 15, categorie: "Bar" },
    { nume: "Pilsner Urquell", descriere: "Bere | 330 ml", pret: 15, categorie: "Bar" },
    { nume: "Ursus Nefiltrată", descriere: "Bere | 330 ml", pret: 15, categorie: "Bar" },
    { nume: "Ursus Fructe Roșii și Lămâie", descriere: "Bere | 330 ml", pret: 15, categorie: "Bar" },
    { nume: "Corona", descriere: "Bere | 330 ml", pret: 15, categorie: "Bar" },
    { nume: "Azuga", descriere: "Bere | 330 ml", pret: 15, categorie: "Bar" },
    { nume: "Cooler F.A. Grepfrut", descriere: "Bere | 330 ml", pret: 10, categorie: "Bar" },
    { nume: "Cooler F.A. Lemon", descriere: "Bere | 330 ml", pret: 10, categorie: "Bar" },
    { nume: "Cooler F.A. Zmeură și Mure", descriere: "Bere | 330 ml", pret: 10, categorie: "Bar" }
];

const imageMap = {
    "Margherita": "/img/categorii/pizza/pizza-margarita.jpg",
    "Marinara": "/img/categorii/pizza/pizza-marinara.jpg",
    "Ortolana": "/img/categorii/pizza/pizza-ortolana.jpg",
    "Capriciosa": "/img/categorii/pizza/pizza-capriciosa.jpg",
    "Napoli": "/img/categorii/pizza/pizza-napoli.jpg",
    "Vegetariană": "/img/categorii/pizza/pizza-vegetariana.jpg",
    "Wurstel e Patatine": "/img/categorii/pizza/pizza-wurstel-e-patatine.jpg",
    "Diavola": "/img/categorii/pizza/pizza-diavola.jpg",
    "Boscaiola": "/img/categorii/pizza/pizza-boscaiola.png",
    "Tonno e Cipolla": "/img/categorii/pizza/pizza-tonno-e-cipolla.jpg",
    "Quattro Formaggi": "/img/categorii/pizza/pizza-quattro-formaggi.jpg",
    "Tradițională": "/img/categorii/pizza/pizza-traditionala.jpg",
    "Salami": "/img/categorii/pizza/pizza-salami.jpg",
    "Pepperoni": "/img/categorii/pizza/pizza-pepperoni.jpg",
    "Margherita e Prosciutto": "/img/categorii/pizza/pizza-margherita-e-prosciutto.jpg",
    "Estiva": "/img/categorii/pizza/pizza-estiva.jpg",
    "Calzone": "/img/categorii/pizza/pizza-calzone.jpg",
    "Funghi e Prosciutto": "/img/categorii/pizza/pizza-funghi-e-prosciutto.jpg",
    "Bella Roma": "/img/categorii/pizza/pizza-bella-roma.jpg",
    "Funghi Porcini": "/img/categorii/pizza/pizza-funghi-porvini.jpg",
    "Pizza Family": "/img/categorii/pizza/pizza-family.jpg",

    "Focaccia": "/img/categorii/focacia/pizza-focaccia-bianca.jpg",
    "Focaccia Bianca": "/img/categorii/focacia/pizza-focaccia-bianca.jpg",
    "Focaccia cu Nutella": "/img/categorii/focacia/pizza-focaccia-cu-nutella.jpg",
    "Focaccia cu Prosciutto": "/img/categorii/focacia/pizza-focaccia-prosciuto.jpg",

    "Burro e Parmigiano": "/img/categorii/paste/paste-buro-e-parmigiano.jpg",
    "Penne all'Arrabbiata": "/img/categorii/paste/paste-arrabbiata.jpg",
    "Bolognese / Ragù": "/img/categorii/paste/paste-ragu-bolognese.jpg",
    "Aglio, Olio e Peperoncino": "/img/categorii/paste/paste-aglio-peperoncino.jpg",
    "All'Amatriciana": "/img/categorii/paste/paste-all-americana.jpg",
    "Carbonara": "/img/categorii/paste/paste-carbonara.jpg",
    "Ai Funghi Porcini": "/img/categorii/paste/paste-funghi-porcini.jpg",

    "Supplì": "/img/categorii/antipasti/suppli.jpg",
    "Bruschetta Pomodoro": "/img/categorii/antipasti/bruschetta-pomodoro.jpg",
    "Chipsuri": "/img/categorii/antipasti/chipsuri.jpg",
    "Legume la grătar": "/img/categorii/fel_principal/legume-la-gratar.jpg",
    "Scaloppina al Limone": "/img/categorii/fel_principal/scalopina-al-limoni.jpg",
    "Platou aperitiv (2 pers.)": "/img/categorii/antipasti/platou-aperitiv.jpg",
    "Ceafă de porc la grătar": "/img/categorii/fel_principal/ceafa-de-porc-la-gratar.jpg",
    "Ceafă de porc cu legume la grătar": "/img/categorii/fel_principal/ceafa-de-porc-la-gratar-cu-legume-la-gratar.jpg",

    "Clătite cu Finetti": "/img/categorii/desert/clatite-cu-finetti.jpg",
    "Cheesecake": "/img/categorii/desert/cheesecake.jpg",
    "Tiramisu": "/img/categorii/desert/tiramisu.jpg",
    "Gumă de mestecat Mentos": "/img/categorii/desert/gumm-mestecat-mentos.jpg",

    "Betty Blue Vanilie": "/img/categorii/inghetata/inghetata-betty-blue-vanilie.jpg",
    "Betty Blue Tiramisu": "/img/categorii/inghetata/inghetata-betty-blue-tiramisu.jpg",
    "Betty Blue Triple Chocolate": "/img/categorii/inghetata/inghetata-betty-blue-chocolate.jpg",
    "Betty Blue Chocolate": "/img/categorii/inghetata/inghetata-betty-blue-chocolate.jpg",
    "Betty Blue Fistic": "/img/categorii/inghetata/inghetata-betty-blue-vanilie.jpg",
    "Betty Blue Bubble Gum": "/img/categorii/inghetata/inghetata-bubble-gum.jpg",
    "Cornet Scufița Roșie": "/img/categorii/inghetata/cornet-scufita-rosie.jpg",
    "Napoca Cornet Cacao": "/img/categorii/inghetata/napoca-cornet-cacao.jpg",
    "Napoca Pahar Cacao": "/img/categorii/inghetata/napoca-pahar-cacao.jpg",
    "Napoca Pahar Vanilie": "/img/categorii/inghetata/napoca-pahar-vanilie.jpg",
    "Twister Green": "/img/categorii/inghetata/twister-green.jpg",
    "Calippo Căpșuni": "/img/categorii/inghetata/calipi-capsuni.jpg",
    "Cornetto King Cone Vanilie": "/img/categorii/inghetata/napoca-cornet-cacao.jpg",
    "Cornetto King Cone Ciocolată": "/img/categorii/inghetata/napoca-cornet-cacao.jpg",
    "Magnum Migdale": "/img/categorii/inghetata/magnum-migdale.jpg",
    "Magnum Piersică": "/img/categorii/inghetata/magnum-piersica.jpg"
};

async function seedMenu() {
    console.log("Ștergere produse existente...");
    const { error: deleteError } = await supabase
        .from('meniu')
        .delete()
        .neq('id', 0); // Sterge tot
        
    if (deleteError) {
        console.error("Eroare la stergere:", deleteError);
        return;
    }
    
    console.log("Inserare meniu nou...");
    
    // Add image url to items if mapped
    const itemsToInsert = menuItems.map(item => ({
        ...item,
        imagine_url: imageMap[item.nume] || null
    }));

    const { error: insertError } = await supabase
        .from('meniu')
        .insert(itemsToInsert);

    if (insertError) {
        console.error("Eroare la inserare:", insertError);
    } else {
        console.log(`Succes! Au fost adăugate ${itemsToInsert.length} produse.`);
    }
}

seedMenu();
