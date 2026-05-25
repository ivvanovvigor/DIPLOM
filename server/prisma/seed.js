const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = [
    // ==========================================
    // 1. ШОЛОМИ (10 товарів)
    // ==========================================
    {
      title: 'МОТОШОЛОМ AXXIS STORM S SV WHITE',
      price: 7040,
      category: 'Шоломи',
      description: 'Високоякісний модулярний шолом з вбудованими сонцезахисними окулярами.',
      imageUrl: 'https://motodom.ua/image/cache__webp/catalog/Product_Pictures/Helmets/AXXIS/Storm_SV/Storm_S_SV_White1-800x800h.webp',
      specs: { "Тип": "Модуляр", "Матеріал": "Полікарбонат", "Вага": "1650 г", "Сертифікація": "ECE 22.06" }
    },
    {
      title: 'МОТОШОЛОМ MT REVENGE 2 RS BLACK',
      price: 5200,
      category: 'Шоломи',
      description: 'Спортивний інтеграл з відмінною аеродинамікою для треку та міста.',
      imageUrl: 'https://motogo.com.ua/images/ab__webp/thumbnails/550/550/detailed/54/1_0slz-lm_jpg.webp',
      specs: { "Тип": "Інтеграл", "Матеріал": "Фібергласс", "Вага": "1450 г", "Сертифікація": "ECE 22.05" }
    },
    {
      title: 'МОТОШОЛОМ LS2 FF320 STREAM EVO SOLID',
      price: 4800,
      category: 'Шоломи',
      description: 'Комфортний повнолицевий шолом для щоденних поїздок містом.',
      imageUrl: 'https://freerider.in.ua/image/cache/catalog/LS2/FF320/motoshlem-ls2-ff320-stream-evo-gloss-black-500x500.jpg.pagespeed.ce.5lz9L3pJmw.jpg',
      specs: { "Тип": "Інтеграл", "Матеріал": "HPTT термопласт", "Вага": "1550 г", "Сертифікація": "ECE 22.05" }
    },
    {
      title: 'МОТОШОЛОМ HJC C70 LANTIC',
      price: 6900,
      category: 'Шоломи',
      description: 'Аеродинамічний дизайн, чудова оглядовість та покращена вентиляція.',
      imageUrl: 'https://rmoto.com.ua/modules/catalog/hjc_c70_boltas1_0c2d5_0.webp',
      specs: { "Тип": "Інтеграл", "Матеріал": "Полікарбонат", "Вага": "1500 г", "Сертифікація": "ECE 22.05" }
    },
    {
      title: 'МОТОШОЛОМ SHARK SKWAL I3 LINIK MATT',
      price: 11500,
      category: 'Шоломи',
      description: 'Перший у світі шолом з інтегрованими активними LED-стоп-сигналами.',
      imageUrl: 'https://moto777.com.ua/image/cache/catalog/product/shark/SKWAL%20i3/LINIK/shark_skwal_i3_linik_matt_black_grey_yellow_1-1280x1280.png',
      specs: { "Тип": "Інтеграл", "Матеріал": "Полікарбонат", "Вага": "1560 г", "Сертифікація": "ECE 22.06" }
    },
    {
      title: 'МОТОШОЛОМ  AGV K3 SV MULTI BIRD',
      price: 9400,
      category: 'Шоломи',
      description: 'Агресивний спортивний дизайн від легендарного італійського бренду.',
      imageUrl: 'https://images.prom.ua/5548949982_w640_h640_5548949982.jpg',
      specs: { "Тип": "Інтеграл", "Матеріал": "Термопластик", "Вага": "1490 г", "Сертифікація": "ECE 22.05" }
    },
    {
      title: 'МОТОШОЛОМ SHOEI NXR 2 SOLID BLACK',
      price: 24500,
      category: 'Шоломи',
      description: 'Преміальний японський шолом найвищого рівня безпеки та шумоізоляції.',
      imageUrl: 'https://motodom.ua/image/cache__webp/catalog/Product_Pictures/Helmets/Shoei/NXR_2/Black/Black-800x800h.webp',
      specs: { "Тип": "Інтеграл", "Матеріал": "AIM композит", "Вага": "1390 г", "Сертифікація": "ECE 22.06" }
    },
    {
      title: 'МОТОШОЛОМ NOLAN N80-8 ALLY N-COM',
      price: 10800,
      category: 'Шоломи',
      description: 'Сучасний туринговий шолом з можливістю встановлення фірмової гарнітури.',
      imageUrl: 'https://motostyle.ua/image/cache/product/168917/11.1-450x450.webp',
      specs: { "Тип": "Інтеграл", "Матеріал": "Полікарбонат Lexan", "Вага": "1530 г", "Сертифікація": "ECE 22.06" }
    },
    {
      title: 'МОТОШОЛОМ AIROH COMMANDER COLOR WHITE',
      price: 13900,
      category: 'Шоломи',
      description: 'Універсальний шолом класу Ендуро/Тур-Ендуро зі знімним козирком.',
      imageUrl: 'https://motostyle.ua/image/cache/product/181347/2.21-450x450.webp',
      specs: { "Тип": "Ендуро", "Матеріал": "Композит HPC", "Вага": "1430 г", "Сертифікація": "ECE 22.05" }
    },
    {
      title: 'МОТОШОЛОМ BELL QUALIFIER DLX MIPS',
      price: 7800,
      category: 'Шоломи',
      description: 'Шолом з технологією захисту мозку MIPS та фотохромним візором.',
      imageUrl: 'https://images.prom.ua/2966231088_motosholom-bell-qualifier.jpg',
      specs: { "Тип": "Інтеграл", "Матеріал": "Полікарбонат", "Вага": "1550 г", "Сертифікація": "DOT / ECE" }
    },

    // ==========================================
    // 2. ЕКІПІРУВАННЯ (10 товарів)
    // ==========================================
    {
      title: 'МОТОКУРТКА REVIT IGNITION 4 BLACK',
      price: 27200,
      category: 'Екіпірування',
      description: 'Преміальна куртка, що поєднує натуральну шкіру та вентильовану сітку.',
      imageUrl: 'https://motostyle.ua/image/cache/product/183308/2-7-450x450.webp',
      specs: { "Тип": "Куртка", "Матеріал": "Шкіра / Текстиль", "Захист": "Seeflex CE-Level 2", "Сезон": "Літо/Осінь" }
    },
    {
      title: 'МОТОБОТИ ALPINESTARS SMX-6 V2',
      price: 9800,
      category: 'Екіпірування',
      description: 'Спортивні мотоботи з інноваційною системою біомеханічного захисту гомілкостопа.',
      imageUrl: 'https://motodom.ua/image/cache__webp/catalog/Product_Pictures/Boots/Alpinestars/SMX-6_V2/smx-6_v2_brg-800x800w.webp',
      specs: { "Тип": "Взуття", "Матеріал": "Мікрофібра", "Захист": "ТПУ протектори", "Клас": "Спорт" }
    },
    {
      title: 'МОТОРУКАВИЦІ FIVE RFX1 REPLICA',
      price: 5600,
      category: 'Екіпірування',
      description: 'Професійні гоночні рукавички з карбоновими вставками та кевларовою підкладкою.',
      imageUrl: 'https://motostyle.ua/image/cache/data/motostyle/product/42954/motoperchatki-five-rfx-1-replica-attack-red-m-450x450.webp',
      specs: { "Тип": "Рукавички", "Матеріал": "Козяча шкіра", "Захист": "Карбон / Кевлар", "Клас": "Спорт" }
    },
    {
      title: 'МОТОДЖИНСИ SHIMA GIRO 2.0 KHAKI',
      price: 4300,
      category: 'Екіпірування',
      description: 'Мотоциклетні джинси прямого крою з посиленням із волокон Aramide.',
      imageUrl: 'https://motostyle.ua/image/cache/product/169924/1-450x450.webp',
      specs: { "Тип": "Штани", "Матеріал": "Денім / Кевлар", "Захист": "Коліна SAS-TEC", "Клас": "Місто" }
    },
    {
      title: 'ТЕРМОБІЛИЗНА REBELHORN FREEZE',
      price: 1850,
      category: 'Екіпірування',
      description: 'Двокомпонентна термобілизна з ефектом охолодження для спекотної погоди.',
      imageUrl: 'https://bikermarket.ua/content/images/21/260x600l80mc0/termobriuky-rebelhorn-freeze-ii-black-l-art.-rh-pnt-freeze-ii_01l-sht.-26555546926690.webp',
      specs: { "Тип": "Термобілизна", "Матеріал": "Поліамід / Еластан", "Властивості": "Швидке відведення вологи", "Сезон": "Літо" }
    },
    {
      title: 'МОТОЧЕРЕПАХА FOX TITAN SPORT',
      price: 6400,
      category: 'Екіпірування',
      description: 'Повний захист корпусу для мотокросу та ендуро з сертифікованими протекторами.',
      imageUrl: 'https://edos.com.ua/wp-content/uploads/2019/10/Motocherepaha-FOX-Titan-Sport-Black.jpeg',
      specs: { "Тип": "Захист тіла", "Матеріал": "Сітка / ABS пластик", "Захист": "Спина, груди, плечі, лікті", "Клас": "Крос/Ендуро" }
    },
    {
      title: 'МОТОКОМБІНЕЗОН ALPINESTARS MISSILE V2',
      price: 39999,
      category: 'Екіпірування',
      description: 'Професійний роздільний шкіряний комбінезон, сумісний з подушкою безпеки Tech-Air.',
      imageUrl: 'https://motodom.ua/image/cache__webp/catalog/Product_Pictures/Leather_suit/Alpinestars/MissileV2/alpinestars_missile_v2_leather_suit_pc_black_white_750x750-800x800.webp',
      specs: { "Тип": "Комбінезон", "Матеріал": "Волов'я шкіра (1.3 мм)", "Захист": "GP-R коліна/ліктьові слайдери", "Сумісність": "Tech-Air 5" }
    },
    {
      title: 'МОТОКУРТКА ТУРИСТИЧНА SPIDI MULTITECH',
      price: 11200,
      category: 'Екіпірування',
      description: 'Надійна текстильна куртка для дальніх подорожей у будь-яку погоду.',
      imageUrl: 'https://motostyle.ua/image/cache/data/shlem/product/72261/motokurtka-spidi-multitech-armor-evo-black-orange-m-450x450.webp',
      specs: { "Тип": "Куртка", "Матеріал": "Cordura 500D", "Мембрана": "H2Out водонепроникна", "Сезон": "Всесезонна" }
    },
    {
      title: 'НАКОЛІННИКИ THOR FORCE XP BLACK',
      price: 3900,
      category: 'Екіпірування',
      description: 'Шарнірні наколінники з подвійною системою фіксації та міцною чашкою.',
      imageUrl: 'https://motodom.ua/image/cache__webp/catalog/Product_Pictures/Protection/Thor/Thor_Force_XP/Force_XP1-800x800h.webp',
      specs: { "Тип": "Наколінники", "Конструкція": "Шарнірна", "Матеріал": "Ударостійкий пластик", "Сертифікація": "CE" }
    },
    {
      title: 'МОТОБОТИ ДЛЯ МІСТА SHIMA STRATO',
      price: 9950,
      category: 'Екіпірування',
      description: 'Короткі та легкі мотокеди із замші з посиленою підошвою та захистом кісточки.',
      imageUrl: 'https://motostyle.ua/image/cache/product/160622/eng_pl_Motorcycle-Boots-Shima-Strato-Lady-black-144641_1-450x450.webp',
      specs: { "Тип": "Взуття", "Матеріал": "Натуральна замша / Текстиль", "Захист": "Посилений носок і п'ята", "Клас": "Місто" }
    },

    // ==========================================
    // 3. ЗАПЧАСТИНИ (10 товарів)
    // ==========================================
    {
      title: 'ЛАНЦЮГ DID 520 VX3 GOLD 120L',
      price: 3200,
      category: 'Запчастини',
      description: 'Надійний золотий ланцюг X-Ring з подовженим терміном служби для дорожніх мотоциклів.',
      imageUrl: 'https://motokontakt.com.ua/content/images/29/768x612l80mc0/privodnaya-tsep-did-520vx3-gb-112zb-59990731026541.webp',
      specs: { "Тип": "Привід", "Крок ланцюга": "520", "Кількість ланок": "120", "Тип ущільнення": "X-Ring" }
    },
    {
      title: 'ЗІРКА ЗАДНЯ JT JTR1304.45',
      price: 1100,
      category: 'Запчастини',
      description: 'Високоякісна сталева задня зірка, виготовлена шляхом лазерного різання.',
      imageUrl: 'https://bikermarket.ua/content/images/46/800x800l80mc0/96259611922879.webp',
      specs: { "Тип": "Зірка", "Розташування": "Задня", "Кількість зубів": "45", "Матеріал": "Сталь C49" }
    },
    {
      title: 'ФІЛЬТР МАСЛЯНИЙ HIFLO HF204',
      price: 450,
      category: 'Запчастини',
      description: 'Еталон якості серед масляних фільтрів, сумісний з більшістю японських мотоциклів.',
      imageUrl: 'https://motostyle.ua/image/cache/product/10406/13-450x450.webp',
      specs: { "Тип": "Фільтр", "Клас": "Масляний", "Конструкція": "Навкрутний", "Країна": "Таїланд" }
    },
    {
      title: 'КОЛОДКИ ГАЛЬМІВНІ BREMBO 07HO30SA',
      price: 1950,
      category: 'Запчастини',
      description: 'Синтеровані (sintered) гальмівні колодки переднього контуру для дорожніх мотоциклів.',
      imageUrl: 'https://webcdn.intercars.eu/files/002501/07ho30sa_%231.jpg',
      specs: { "Тип": "Гальма", "Склад": "Спечена металокераміка", "Розташування": "Передні", "Ефективність": "Максимальна" }
    },
    {
      title: 'СВІЧКА ЗАПАЛЮВАННЯ NGK CR9EH-9',
      price: 380,
      category: 'Запчастини',
      description: 'Оригінальна свічка запалювання для стабільної роботи двигуна на високих обертах.',
      imageUrl: 'https://motostyle.ua/image/cache/product/12153/7502-1-450x450.webp',
      specs: { "Тип": "Електрика", "Резьба": "M10", "Калільне число": "9", "Зазор": "0.9 мм" }
    },
    {
      title: 'ФІЛЬТР ПОВІТРЯНИЙ HIFLO HFA3612',
      price: 890,
      category: 'Запчастини',
      description: 'Повітряний фільтр точної відповідності оригінальним специфікаціям OEM.',
      imageUrl: 'https://motoelit.com.ua/content/images/42/520x390l80mc0/hiflo-hfa3612-filtr-vozdushnyy-90887517626633.webp',
      specs: { "Тип": "Фільтр", "Клас": "Повітряний", "Матеріал": "Паперовий елемент", "Сумісність": "Suzuki GSX-R" }
    },
    {
      title: 'АКУМУЛЯТОР YUASA YTX9-BS',
      price: 2400,
      category: 'Запчастини',
      description: 'Преміальний сухозаряджений AGM акумулятор з високим пусковим струмом.',
      imageUrl: 'https://motokontakt.com.ua/content/images/14/800x594l80mc0/30733467083587.webp',
      specs: { "Тип": "Електрика", "Технологія": "AGM (Гелевий)", "Ємність": "8 Ач", "Пусковий струм": "135 А" }
    },
    {
      title: 'ЗІРКА ПЕРЕДНЯ JT JTF1373.16',
      price: 790,
      category: 'Запчастини',
      description: 'Ведуча зірка з хромомолібденової сталі з термообробкою.',
      imageUrl: 'https://motokontakt.com.ua/content/images/46/1800x1350l80mc0/jt-jtf1373.16rb-55182613289369.webp',
      specs: { "Тип": "Зірка", "Розташування": "Передня (ведуча)", "Кількість зубів": "15", "Матеріал": "Сталь SCM420" }
    },
    {
      title: 'САЛЬНИКИ ВИЛКИ ARIETE ARI053',
      price: 650,
      category: 'Запчастини',
      description: 'Комплект сальників вилки зі спеціального гумового компаунду XNBR.',
      imageUrl: 'https://motostar.com.ua/content/images/50/1600x1200l80mc0/salnik-vilki-ariete-ari.053-55-120-43x54x11-2sht-60826286955001.webp',
      specs: { "Тип": "Підвіска", "Розміри": "41x54x11 мм", "Комплектація": "2 шт.", "Матеріал": "Гума XNBR" }
    },
    {
      title: 'АМОРТИЗАТОР ЗАДНІЙ YSS TOP-LINE',
      price: 34800,
      category: 'Запчастини',
      description: 'Газонаповнений моноамортизатор з регулюванням переднатягу пружини та відбою.',
      imageUrl: 'https://a.allegroimg.com/original/11d994/af6bddfe4a07bc72115165c1fdfe/Amortyzator-tylny-YSS-Top-Line-MZ456-MZ456-320TR-19-85',
      specs: { "Тип": "Підвіска", "Конструкція": "Газо-масляний", "Регулювання": "Переднатяг, Rebound", "Довжина": "320 мм" }
    },

    // ==========================================
    // 4. АКСЕСУАРИ (10 товарів)
    // ==========================================
    {
      title: 'ЧОХОЛ OXFORD AQUATEX L',
      price: 1250,
      category: 'Аксесуари',
      description: 'Міцний всесезонний водонепроникний чохол для захисту мотоцикла від негоди та сонця.',
      imageUrl: 'https://motodom.ua/image/cache__webp/catalog/Product_Pictures/Accessories/Chehli/Oxford/Aquatex/oxford-aquatex-800x800.webp',
      specs: { "Розмір": "L (Довжина до 240 см)", "Матеріал": "Поліестер 100D", "Водостійкість": "Так", "Термостійкість": "До 150°C" }
    },
    {
      title: 'ЗАМОК НА ДИСК KOVIX KD6 ALARM',
      price: 2400,
      category: 'Аксесуари',
      description: 'Протиугінний замок на гальмівний диск із вбудованою інтелектуальною сиреною.',
      imageUrl: 'https://moto-motion.com.ua/content/images/16/490x390l80mc0/zamok-na-disk-alarm-onoff-kovix-kd6-az9051-23984693061450.webp',
      specs: { "Тип": "Протиугінний", "Гучність сирени": "120 дБ", "Діаметр штифта": "6 мм", "Матеріал": "Цинковий сплав" }
    },
    {
      title: 'ТРИМАЧ ТЕЛЕФОНУ QUAD LOCK HANDLEBAR',
      price: 2100,
      category: 'Аксесуари',
      description: 'Професійне запатентоване кріплення для надійної фіксації смартфона на кермі.',
      imageUrl: 'https://bikermarket.ua/content/images/42/623x600l80mc0/73236464489974.webp',
      specs: { "Тип": "Кріплення", "Монтаж": "На кермо (22-32 мм)", "Фіксація": "Двохетапний замок", "Матеріал": "Нейлон / Скловолокно" }
    },
    {
      title: 'МАСТИЛО ЛАНЦЮГА IPONE X-TREM ROAD',
      price: 680,
      category: 'Аксесуари',
      description: 'Високотехнологічне біле мастило на основі тефлону, стійке до вимивання водою.',
      imageUrl: 'https://motokontakt.com.ua/content/images/31/287x390l80mc0/26915278652978.webp',
      specs: { "Тип": "Хімія", "Об'єм": "750 мл", "Призначення": "Для дорожніх мотоциклів", "Основа": "Синтетика з PTFE" }
    },
    {
      title: 'РЮКЗАК МОТОЦИКЛЕТНИЙ OGIO MACH 3',
      price: 5900,
      category: 'Аксесуари',
      description: 'Жорсткий аеродинамічний рюкзак, стійкий до деформації від зустрічного повітря.',
      imageUrl: 'https://www.motoshop.ua/content/images/15/370x370l80mc0/82710835230642.webp',
      specs: { "Тип": "Багаж", "Об'єм": "22 л", "Матеріал": "Формований PU пластик", "Відсік для ноутбука": "До 15.6 дюймів" }
    },
    {
      title: 'МОТОГАРНІТУРА SENA 50S SINGLE',
      price: 15400,
      category: 'Аксесуари',
      description: 'Флагманська інтерком-система з преміальним звуком від Harman Kardon та технологією Mesh.',
      imageUrl: 'https://bikermarket.ua/content/images/37/1000x1000l80mc0/20318117136898.webp',
      specs: { "Тип": "Зв'язок", "Динаміки": "Harman Kardon", "Радіус дії": "До 2 км", "Інтерком": "Mesh 2.0 / Bluetooth 5.0" }
    },
    {
      title: 'СІТКА БАГАЖНА Oxford Cargo Net',
      price: 320,
      category: 'Аксесуари',
      description: 'Еластична сітка з металевими гачками в захисній гумовій оболонці для кріплення шолома.',
      imageUrl: 'https://bikermarket.ua/content/images/14/666x637l80mc0/54635139419437.webp',
      specs: { "Тип": "Багаж", "Розмір": "30x30 см", "Кількість гачків": "6 шт.", "Матеріал": "Високоеластичний латекс" }
    },
    {
      title: 'ОЧИЩУВАЧ ШОЛОМА IPONE HELMET IN',
      price: 390,
      category: 'Аксесуари',
      description: 'Очисний мус для внутрішньої підкладки шолома, нейтралізує неприємні запахи.',
      imageUrl: 'https://dynamica.ua/wp-content/uploads/2021/04/helmet_kit_01.jpg',
      specs: { "Тип": "Хімія", "Об'єм": "150 мл", "Форма випуску": "Піна (мус)", "Ефект": "Антибактеріальний" }
    },
    {
      title: 'КАНІСТРА ДЛЯ ПАЛИВА GIVI 2.5L',
      price: 950,
      category: 'Аксесуари',
      description: 'Компактна додаткова каністра для бензину, сертифікована для кріплення на кофри.',
      imageUrl: 'https://www.tradeinn.com/f/13800/138008345/givi-%D0%9A%D0%B0%D0%BD%D0%B8%D1%81%D1%82%D1%80%D0%B0-%D0%B4%D0%BB%D1%8F-%D1%82%D0%BE%D0%BF%D0%BB%D0%B8%D0%B2%D0%B0-tan01-2.5l.webp',
      specs: { "Тип": "Каністра", "Об'єм": "2.5 л", "Матеріал": "Високоміцний поліетилен", "Сумісність": "Кріплення GIVI E148" }
    },
    {
      title: 'ПРОТИУГІННИЙ ЛАНЦЮГ OXFORD HARDCORE XL',
      price: 4900,
      category: 'Аксесуари',
      description: 'Надміцний ланцюг із загартованої сталі товщиною 13 мм у захисному тканинному чохлі.',
      imageUrl: 'https://motodom.ua/image/cache__webp/catalog/Product_Pictures/Zamki_cepi_trosy/Cepi/Oxford/GP/0d06d11c904ea913152f461ec1d24465-800x800w.webp',
      specs: { "Тип": "Протиугінний", "Довжина": "1.5 м", "Товщина ланки": "13 мм", "Рівень захисту": "Sold Secure Gold" }
    }
  ];

  console.log('Починаємо очищення та наповнення бази даних на 40 товарів...');

  // Видаляємо старі товари, щоб уникнути дублікатів
  await prisma.product.deleteMany({});

  for (const product of products) {
    await prisma.product.create({
      data: {
        title: product.title,
        description: product.description,
        category: product.category,
        imageUrl: product.imageUrl,
        specs: product.specs,
        price: product.price ? Number(product.price) : 0,
        views: Math.floor(Math.random() * 500)
      }
    });
  }

  console.log('Готово! Базу даних наповнено: по 10 товарів у кожній категорії.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });